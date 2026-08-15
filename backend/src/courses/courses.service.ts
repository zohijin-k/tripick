import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto, CreateCourseDto, CreateReviewDto } from './dto/course.dto';

type CourseWithData = Awaited<ReturnType<CoursesService['loadCourse']>>;

const REVIEW_FULL_WEIGHT_COMPLETION = 70;
const MAX_HUMAN_SPEED_KMH = 144;
const HANOK_CENTER = { lat: 35.8146, lng: 127.1523 };
const HANOK_CORE_RADIUS_M = 600;
// 숨은 전주 보너스 = 분산 보너스(한옥 코어 외 코스) + 발굴 보너스(검증된 숨은 스팟)
const DISPERSION_BONUS = 0.2; // 한옥마을 코어 외 코스 +20%
const HIDDEN_SPOT_BONUS = 0.1; // 검증된 숨은 스팟 1개당 +10%
const HIDDEN_SPOT_BONUS_CAP = 0.2; // 발굴 보너스 상한 +20%
const HIDDEN_SPOT_VERIFY_THRESHOLD = 2; // GPS 체크인 2회 이상(발굴자 외 1명 이상)이어야 "검증된" 숨은 스팟

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

  async findNearby(userId: string, lat: number, lng: number, radius: number) {
    const [user, courses] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.course.findMany({ include: this.courseInclude() }),
    ]);

    return courses
      .map((course) => {
        const distances = course.spots
          .filter((spot) => spot.lat != null && spot.lng != null)
          .map((spot) => this.distanceMeters(lat, lng, spot.lat!, spot.lng!));
        const distanceMeters = distances.length > 0 ? Math.min(...distances) : Number.POSITIVE_INFINITY;
        const preferenceBonus = user?.travelStyle === course.theme ? 20 : 0;
        return { ...this.toCourseDto(course), distanceMeters, preferenceBonus };
      })
      .filter((course) => course.distanceMeters <= radius)
      .sort((a, b) =>
        b.preferenceBonus - a.preferenceBonus ||
        a.distanceMeters - b.distanceMeters ||
        b.tripickScore.totalScore - a.tripickScore.totalScore,
      )
      .slice(0, 5);
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
            isHidden: spot.isHidden ?? false,
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
            isHidden: spot.isHidden ?? false,
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
    const course = await this.loadCourse(courseId);
    if (!course) throw new NotFoundException('Course not found.');
    const trace = await this.prisma.traceSession.findUnique({
      where: { courseId_userId: { courseId, userId } },
      include: { checkIns: true },
    });
    const verifiedSpotCount = new Set(
      trace?.checkIns.filter((checkIn) => !checkIn.isManual).map((checkIn) => checkIn.spotId) ?? [],
    ).size;
    const isDemoOnly = Boolean(trace?.checkIns.length) && verifiedSpotCount === 0;
    const completionRate = course.spots.length > 0
      ? Math.round((verifiedSpotCount / course.spots.length) * 100)
      : 0;
    const weight = isDemoOnly
      ? 0
      : completionRate >= REVIEW_FULL_WEIGHT_COMPLETION ? 1 : 1 / 3;
    return this.prisma.review.upsert({
      where: { courseId_userId: { courseId, userId } },
      update: {
        rating: dto.rating,
        comment: dto.comment ?? '',
        completionRate,
        weight,
      },
      create: {
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

    const isManual = dto.isManual === true;
    if (spot.lat == null || spot.lng == null) {
      throw new BadRequestException('목적지 좌표가 없어 GPS 체크인을 검증할 수 없습니다.');
    }
    const distanceMeters = this.distanceMeters(dto.lat, dto.lng, spot.lat, spot.lng);
    if (!isManual && distanceMeters > 50) {
      throw new BadRequestException(`체크인 가능 거리(50m)를 벗어났습니다. 현재 거리: ${Math.round(distanceMeters)}m`);
    }

    const trace = await this.getOrCreateTrace(courseId, userId);
    const last = trace.checkIns
      .filter((checkIn) => !checkIn.isManual && checkIn.lat != null && checkIn.lng != null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const speedKmh =
      last && dto.lat != null && dto.lng != null && last.lat != null && last.lng != null
        ? this.speedKmh(last.lat, last.lng, dto.lat, dto.lng, last.createdAt, new Date())
        : null;
    if (!isManual && speedKmh != null && speedKmh > MAX_HUMAN_SPEED_KMH) {
      throw new BadRequestException('비정상 이동 속도가 감지되어 체크인을 거부했습니다.');
    }

    const existingCheckIn = trace.checkIns.find((checkIn) => checkIn.spotId === spot.id);
    if (isManual && existingCheckIn && !existingCheckIn.isManual) {
      return this.refreshTrace(courseId, userId);
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

  /** 방문 검증(체크인)된 사람만 남길 수 있는 스팟 별점 */
  async rateCheckIn(courseId: string, userId: string, spotId: string, rating: number) {
    const course = await this.loadCourse(courseId);
    if (!course) throw new NotFoundException('코스를 찾을 수 없습니다.');
    const spot = course.spots.find((item) => item.id === spotId || item.sourceSpotId === spotId);
    if (!spot) throw new NotFoundException('별점을 남길 장소를 찾을 수 없습니다.');

    const trace = await this.prisma.traceSession.findUnique({
      where: { courseId_userId: { courseId, userId } },
      include: { checkIns: true },
    });
    const checkIn = trace?.checkIns.find((item) => item.spotId === spot.id);
    if (!checkIn) {
      throw new BadRequestException('체크인한 장소에만 별점을 남길 수 있습니다.');
    }

    await this.prisma.checkIn.update({ where: { id: checkIn.id }, data: { rating } });
    return { spotId: spot.id, rating };
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
      traces: { include: { checkIns: true } },
    };
  }

  private toCourseDto(course: NonNullable<CourseWithData>) {
    const verifiedTraces = course.traces.filter((trace) =>
      trace.checkIns.some((checkIn) => !checkIn.isManual),
    );
    const startedCount = verifiedTraces.length;
    const completedCount = verifiedTraces.filter((trace) => {
      const verifiedSpotIds = new Set(
        trace.checkIns.filter((checkIn) => !checkIn.isManual).map((checkIn) => checkIn.spotId),
      );
      return course.spots.length > 0 && verifiedSpotIds.size === course.spots.length;
    }).length;
    const completionRate = startedCount > 0 ? Math.round((completedCount / startedCount) * 100) : 0;
    const weightSum = course.reviews.reduce((sum, review) => sum + review.weight, 0);
    const averageRating =
      weightSum > 0
        ? Math.round((course.reviews.reduce((sum, review) => sum + review.rating * review.weight, 0) / weightSum) * 10) / 10
        : 0;
    const performers = startedCount;
    // 스팟별 GPS 검증 체크인 수 (트레이스당 스팟 1회 유니크 → 체크인 수 = 검증한 사람 수)
    // + 검증된 방문자의 스팟 별점 집계 (체험 모드 isManual 별점은 집계 제외)
    const verifiedCheckInCountBySpot = new Map<string, number>();
    const ratingsBySpot = new Map<string, number[]>();
    for (const trace of course.traces) {
      for (const checkIn of trace.checkIns) {
        if (!checkIn.isManual) {
          verifiedCheckInCountBySpot.set(
            checkIn.spotId,
            (verifiedCheckInCountBySpot.get(checkIn.spotId) ?? 0) + 1,
          );
          if (checkIn.rating != null) {
            const list = ratingsBySpot.get(checkIn.spotId) ?? [];
            list.push(checkIn.rating);
            ratingsBySpot.set(checkIn.spotId, list);
          }
        }
      }
    }
    const tripickScore = this.tripickScore(
      completionRate,
      averageRating,
      performers,
      course.spots,
      verifiedCheckInCountBySpot,
    );
    const verifiedReviewCount = course.reviews.filter(
      (review) => review.completionRate >= REVIEW_FULL_WEIGHT_COMPLETION,
    ).length;
    const countedReviewCount = course.reviews.filter((review) => review.weight > 0).length;
    const verifiedCheckIns = course.traces.flatMap((trace) => trace.checkIns).filter(
      (checkIn) => !checkIn.isManual,
    );
    const trustedCheckInCount = verifiedCheckIns.filter(
      (checkIn) => checkIn.distanceMeters != null && checkIn.distanceMeters <= 50,
    ).length;
    const qualityFields = course.spots.flatMap((spot) => [
      spot.lat != null && spot.lng != null,
      Boolean(spot.address),
      Boolean(spot.imageUrl),
      Boolean(spot.contentId),
      Boolean(spot.category),
    ]);
    const filledQualityFields = qualityFields.filter(Boolean).length;

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
      trustMetrics: {
        startedCount,
        completedCount,
        reviewCount: countedReviewCount,
        verifiedReviewCount,
        checkInCount: verifiedCheckIns.length,
        verifiedCheckInCount: trustedCheckInCount,
        qualityFieldCount: qualityFields.length,
        filledQualityFieldCount: filledQualityFields,
      },
      spots: course.spots.map((spot) => {
        const ratings = ratingsBySpot.get(spot.id) ?? [];
        const ratingAvg =
          ratings.length > 0
            ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1))
            : undefined;
        return {
          id: spot.id,
          name: spot.name,
          category: spot.category ?? undefined,
          lat: spot.lat ?? undefined,
          lng: spot.lng ?? undefined,
          address: spot.address ?? undefined,
          imageUrl: spot.imageUrl ?? undefined,
          contentId: spot.contentId ?? undefined,
          isHidden: spot.isHidden,
          rating: ratingAvg,
          ratingCount: ratings.length,
        };
      }),
    };
  }

  private toTraceDto(trace: {
    checkIns: { spotId: string; isManual: boolean }[];
    completionRate: number;
    completedAt: Date | null;
  }) {
    return {
      visitedSpotIds: trace.checkIns.map((checkIn) => checkIn.spotId),
      completionRate: trace.completionRate,
      completedAt: trace.completedAt?.toISOString() ?? null,
      isDemo: trace.checkIns.length > 0 && trace.checkIns.every((checkIn) => checkIn.isManual),
    };
  }

  private tripickScore(
    completionRate: number,
    averageRating: number,
    performers: number,
    spots: { id: string; lat: number | null; lng: number | null; isHidden: boolean }[],
    verifiedCheckInCountBySpot: Map<string, number>,
  ) {
    const performerScore = Math.min(100, Number(((Math.log10(performers + 1) / Math.log10(100)) * 100).toFixed(2)));
    const ratingScore = Number(((averageRating / 5) * 100).toFixed(2));
    const baseScore = 0.5 * completionRate + 0.3 * ratingScore + 0.2 * performerScore;

    // 숨은 전주 보너스: 분산(한옥 코어 외) + 발굴(검증된 숨은 스팟)
    const dispersionBonus = this.isHanokCoreCourse(spots) ? 0 : DISPERSION_BONUS;
    // 숨은 스팟 = isHidden으로 명시된 유저 발굴 스팟, 타인 GPS 체크인 임계치 이상이면 "검증됨"
    const verifiedHiddenSpotCount = spots.filter(
      (spot) =>
        spot.isHidden &&
        (verifiedCheckInCountBySpot.get(spot.id) ?? 0) >= HIDDEN_SPOT_VERIFY_THRESHOLD,
    ).length;
    const discoveryBonus = Math.min(HIDDEN_SPOT_BONUS_CAP, verifiedHiddenSpotCount * HIDDEN_SPOT_BONUS);
    const hiddenBonus = Number((dispersionBonus + discoveryBonus).toFixed(2));

    const totalScore = Number(Math.min(100, baseScore * (1 + hiddenBonus)).toFixed(2));
    return {
      performerScore,
      ratingScore,
      dispersionBonus,
      discoveryBonus,
      hiddenBonus,
      verifiedHiddenSpotCount,
      totalScore,
    };
  }

  private isHanokCoreCourse(spots: { lat: number | null; lng: number | null }[]) {
    const withCoords = spots.filter(
      (spot): spot is { lat: number; lng: number } => spot.lat != null && spot.lng != null,
    );
    if (withCoords.length === 0) return false;
    const inCore = withCoords.filter(
      (spot) => this.distanceMeters(HANOK_CENTER.lat, HANOK_CENTER.lng, spot.lat, spot.lng) <= HANOK_CORE_RADIUS_M,
    ).length;
    return inCore / withCoords.length > 0.5;
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
