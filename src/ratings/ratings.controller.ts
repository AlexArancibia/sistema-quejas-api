import { Controller, Get, Post, Patch, Delete, UseGuards } from "@nestjs/common"
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
  create(createRatingDto: CreateRatingDto) {
    return this.ratingsService.create(createRatingDto)
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(branchId?: string, instructorId?: string, page?: string, limit?: string) {
    const pageNum = page ? Number.parseInt(page) : 1
    const limitNum = limit ? Number.parseInt(limit) : 10
    return this.ratingsService.findAll(branchId, instructorId, pageNum, limitNum)
  }

  @UseGuards(AuthGuard)
  @Get("stats")
  getStats(branchId?: string, instructorId?: string) {
    return this.ratingsService.getStats(branchId, instructorId)
  }

  @UseGuards(AuthGuard)
  @Get("analytics")
  getAnalytics(branchId?: string) {
    return this.ratingsService.getAnalytics(branchId)
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(id: string) {
    return this.ratingsService.findOne(id)
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(id: string, updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.update(id, updateRatingDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(id: string) {
    return this.ratingsService.remove(id)
  }
}
