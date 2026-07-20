import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto, CreateCourseDto, CreateReviewDto } from './dto/course.dto';

type CourseWithData = Awaited<ReturnType<CoursesService['loadCourse']>>;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const courses = await this.prisma.course.findMany({
      include: this.courseInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return courses
      .map((course) => this.toCourseDto(course))
      .sort((a, b) => b.tripickScore.totalScore - a.tripickScore.totalScore);
  }

  async findMine(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { creatorId: userId },
      include: this.courseInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return courses.map((course) => this.toCourseDto(course));
  }

  async findOne(id: string) {
    const course = await this.loadCourse(id);
    if (!course) throw new NotFoundException('코스를 찾을 수 없습니다.');
    return this.toCourseDto(course);
  }

  async create(userId: string, dto: CreateCourseDto) {
    const existing = dto.id
      ? await this.prisma.course.findUnique({ where: { id: dto.id } })
      : null;
    if (existing?.creatorId && existing.creatorId !== userId) {
      throw new BadRequestException('다른 사용자의 코스 ID입니다.');
    }

    const course = await this.prisma.course.upsert({
      where: { id: dto.id ?? '__new_course__' },
      update: {
        title: dto.title,
        area: dto.area,
        theme: dto.theme,
        distance: dto.distance,
        transport: dto.transport,
        recommendationReasons: dto.recommendationReasons ?? [],
        spots: {
          deleteMany: {},
          create: dto.spots.map((spot, index) => ({
            sourceSpotId: spot.id,
            name: spot.name,
            category: spot.category,
            lat: spot.lat,
            lng: spot.lng,
            address: spot.address,
            imageUrl: spot.imageUrl,
            contentId: spot.contentId,
            order: index,
          })),
        },
      },
      create: {
        ...(dto.id ? { id: dto.id } : {}),
        title: dto.title,
        area: dto.area,
        theme: dto.theme,
        distance: dto.distance,
        transport: dto.transport,
        recommendationReasons: dto.recommendationReasons ?? [],
        creatorId: userId,
        spots: {
          create: dto.spots.map((spot, index) => ({
            sourceSpotId: spot.id,
            name: spot.name,
            category: spot.category,
            lat: spot.lat,
            lng: spot.lng,
            address: spot.address,
            imageUrl: spot.imageUrl,
            contentId: spot.contentId,
            order: index,
          })),
        },
      },
      include: this.courseInclude(),
    });
    return this.toCourseDto(course);
  }

  async getReviews(courseId: string) {
    await this.assertCourse(courseId);
    const reviews = await this.prisma.review.findMany({
      where: { courseId },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((review) => ({
      id: review.id,
      courseId: review.courseId,
      rating: review.rating,
      comment: review.comment,
      completionRate: review.completionRate,
      weight: review.weight,
      authorName: review.user.nickname,
      createdAt: review.createdAt.toISOString(),
    }));
  }

  async createReview(courseId: string, userId: string, dto: CreateReviewDto) {
    await this.assertCourse(courseId);
    const trace = await this.prisma.traceSession.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    const completionRate = trace?.completionRate ?? 0;
    const weight = completionRate >= 70 ? 1 : 1 / 3;
    return this.prisma.review.create({
      data: {
        courseId,
        userId,
        rating: dto.rating,
        comment: dto.comment ?? '',
        completionRate,
        weight,
      },
    });
  }

  async getTrace(courseId: string, userId: string) {
    await this.assertCourse(courseId);
    const trace = await this.getOrCreateTrace(courseId, userId);
    return this.toTraceDto(trace);
  }

  async checkIn(courseId: string, userId: string, dto: CheckInDto) {
    const course = await this.loadCourse(courseId);
    if (!course) throw new NotFoundException('코스를 찾을 수 없습니다.');
    const spot = course.spots.find((item) => item.id === dto.spotId || item.sourceSpotId === dto.spotId);
    if (!spot) throw new NotFoundException('체크인할 장소를 찾을 수 없습니다.');

    const isManual = dto.isManual ?? false;
    const distanceMeters =
      dto.lat != null && dto.lng != null && spot.lat != null && spot.lng != null
        ? this.distanceMeters(dto.lat, dto.lng, spot.lat, spot.lng)
        : null;
    if (!isManual && distanceMeters != null && distanceMeters > 50) {
      throw new BadRequestException(`체크인 가능 거리(50m)를 벗어났습니다. 현재 거리: ${Math.round(distanceMeters)}m`);
    }

    const trace = await this.getOrCreateTrace(courseId, userId);
    const last = trace.checkIns
      .filter((checkIn) => checkIn.lat != null && checkIn.lng != null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const speedKmh =
      last && dto.lat != null && dto.lng != null && last.lat != null && last.lng != null
        ? this.speedKmh(last.lat, last.lng, dto.lat, dto.lng, last.createdAt, new Date())
        : null;
    if (!isManual && speedKmh != null && speedKmh > 250) {
      throw new BadRequestException('비정상 이동 속도가 감지되어 체크인을 거부했습니다.');
    }

    await this.prisma.checkIn.upsert({
      where: { traceSessionId_spotId: { traceSessionId: trace.id, spotId: spot.id } },
      update: {
        lat: dto.lat,
        lng: dto.lng,
        distanceMeters,
        speedKmh,
        isManual,
      },
      create: {
        traceSessionId: trace.id,
        spotId: spot.id,
        lat: dto.lat,
        lng: dto.lng,
        distanceMeters,
        speedKmh,
        isManual,
      },
    });

    return this.refreshTrace(courseId, userId);
  }

  async completeTrace(courseId: string, userId: string) {
    const trace = await this.refreshTrace(courseId, userId);
    if (trace.completionRate < 100) {
      throw new BadRequestException('아직 모든 장소를 체크인하지 않았습니다.');
    }
    const updated = await this.prisma.traceSession.update({
      where: { courseId_userId: { courseId, userId } },
      data: { completedAt: new Date() },
      include: { checkIns: true },
    });
    return this.toTraceDto(updated);
  }

  private async refreshTrace(courseId: string, userId: string) {
    const course = await this.loadCourse(courseId);
    if (!course) throw new NotFoundException('코스를 찾을 수 없습니다.');
    const trace = await this.getOrCreateTrace(courseId, userId);
    const checked = new Set(trace.checkIns.map((checkIn) => checkIn.spotId));
    const completionRate =
      course.spots.length > 0 ? Math.round((checked.size / course.spots.length) * 100) : 0;
    const updated = await this.prisma.traceSession.update({
      where: { id: trace.id },
      data: { completionRate, completedAt: completionRate === 100 ? new Date() : trace.completedAt },
      include: { checkIns: true },
    });
    return this.toTraceDto(updated);
  }

  private async getOrCreateTrace(courseId: string, userId: string) {
    return this.prisma.traceSession.upsert({
      where: { courseId_userId: { courseId, userId } },
      update: {},
      create: { courseId, userId },
      include: { checkIns: true },
    });
  }

  private async assertCourse(courseId: string) {
    const count = await this.prisma.course.count({ where: { id: courseId } });
    if (count === 0) throw new NotFoundException('코스를 찾을 수 없습니다.');
  }

  private loadCourse(id: string) {
    return this.prisma.course.findUnique({ where: { id }, include: this.courseInclude() });
  }

  private courseInclude() {
    return {
      spots: { orderBy: { order: 'asc' as const } },
      reviews: true,
      traces: true,
    };
  }

  private toCourseDto(course: NonNullable<CourseWithData>) {
    const completedTraces = course.traces.filter((trace) => trace.completedAt);
    const completionRate =
      course.traces.length > 0
        ? Math.round(course.traces.reduce((sum, trace) => sum + trace.completionRate, 0) / course.traces.length)
        : 0;
    const weightSum = course.reviews.reduce((sum, review) => sum + review.weight, 0);
    const averageRating =
      weightSum > 0
        ? Math.round((course.reviews.reduce((sum, review) => sum + review.rating * review.weight, 0) / weightSum) * 10) / 10
        : 0;
    const performers = completedTraces.length;
    const tripickScore = this.tripickScore(completionRate, averageRating, performers);

    return {
      id: course.id,
      title: course.title,
      area: course.area,
      theme: course.theme,
      distance: course.distance,
      transport: course.transport ?? undefined,
      recommendationReasons: course.recommendationReasons,
      spotCount: course.spots.length,
      completionRate,
      averageRating,
      performers,
      tripickScore,
      spots: course.spots.map((spot) => ({
        id: spot.id,
        name: spot.name,
        category: spot.category ?? undefined,
        lat: spot.lat ?? undefined,
        lng: spot.lng ?? undefined,
        address: spot.address ?? undefined,
        imageUrl: spot.imageUrl ?? undefined,
        contentId: spot.contentId ?? undefined,
      })),
    };
  }

  private toTraceDto(trace: { checkIns: { spotId: string }[]; completionRate: number; completedAt: Date | null }) {
    return {
      visitedSpotIds: trace.checkIns.map((checkIn) => checkIn.spotId),
      completionRate: trace.completionRate,
      completedAt: trace.completedAt?.toISOString() ?? null,
    };
  }

  private tripickScore(completionRate: number, averageRating: number, performers: number) {
    const performerScore = Math.min(100, Number(((Math.log10(performers + 1) / Math.log10(100)) * 100).toFixed(2)));
    const ratingScore = Number(((averageRating / 5) * 100).toFixed(2));
    const totalScore = Number((0.5 * completionRate + 0.3 * ratingScore + 0.2 * performerScore).toFixed(2));
    return { performerScore, ratingScore, totalScore };
  }

  private distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadius = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private speedKmh(lat1: number, lng1: number, lat2: number, lng2: number, from: Date, to: Date) {
    const hours = Math.max((to.getTime() - from.getTime()) / 3600000, 1 / 3600);
    return (this.distanceMeters(lat1, lng1, lat2, lng2) / 1000) / hours;
  }
}
