import { Controller, Get, Post, Patch, Delete, UseGuards, Body, Param, Query } from "@nestjs/common"
import { RatingsService } from "./ratings.service"
import { CreateRatingDto } from "./dto/create-rating.dto"
import { UpdateRatingDto } from "./dto/update-rating.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "../auth/guards/public.guard"

@Controller("ratings")
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(PublicKeyGuard)
  @Post()
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingsService.create(createRatingDto)
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('instructorId') instructorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? Number.parseInt(page) : 1
    const limitNum = limit ? Number.parseInt(limit) : 10
    return this.ratingsService.findAll(branchId, instructorId, startDate, endDate, pageNum, limitNum)
  }

  @UseGuards(AuthGuard)
  @Get("stats")
  getStats(
    @Query('branchId') branchId?: string,
    @Query('instructorId') instructorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.ratingsService.getStats(branchId, instructorId, startDate, endDate)
  }

  @UseGuards(AuthGuard)
  @Get("analytics")
  getAnalytics(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.ratingsService.getAnalytics(branchId, startDate, endDate)
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(id)
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.update(id, updateRatingDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param('id') id: string) {
    return this.ratingsService.remove(id)
  }
}