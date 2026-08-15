import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckInDto, CreateCourseDto, CreateReviewDto, NearbyCourseQueryDto, RateCheckInDto } from './dto/course.dto';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('ranking')
  ranking() {
    return this.coursesService.findAll();
  }

  @Get('nearby')
  @UseGuards(JwtAuthGuard)
  nearby(@CurrentUser() user: AuthUser, @Query() query: NearbyCourseQueryDto) {
    return this.coursesService.findNearby(user.id, query.lat, query.lng, query.radius ?? 1200);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  myCourses(@CurrentUser() user: AuthUser) {
    return this.coursesService.findMine(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/reviews')
  reviews(@Param('id') id: string) {
    return this.coursesService.getReviews(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.coursesService.createReview(id, user.id, dto);
  }

  @Get(':id/trace')
  @UseGuards(JwtAuthGuard)
  getTrace(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.coursesService.getTrace(id, user.id);
  }

  @Post(':id/checkins')
  @UseGuards(JwtAuthGuard)
  checkIn(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CheckInDto,
  ) {
    return this.coursesService.checkIn(id, user.id, dto);
  }

  @Post(':id/checkins/:spotId/rating')
  @UseGuards(JwtAuthGuard)
  rateCheckIn(
    @Param('id') id: string,
    @Param('spotId') spotId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RateCheckInDto,
  ) {
    return this.coursesService.rateCheckIn(id, user.id, spotId, dto.rating);
  }

  @Post(':id/trace/complete')
  @UseGuards(JwtAuthGuard)
  completeTrace(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.coursesService.completeTrace(id, user.id);
  }
}
