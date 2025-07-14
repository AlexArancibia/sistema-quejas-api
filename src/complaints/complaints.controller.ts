import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Query, Body } from "@nestjs/common"
import { ComplaintsService } from "./complaints.service"
import { CreateComplaintDto } from "./dto/create-complaint.dto"
import { UpdateComplaintDto } from "./dto/update-complaint.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "../auth/guards/public.guard"

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @UseGuards(PublicKeyGuard)
  @Post()
  create(@Body() createComplaintDto: CreateComplaintDto) {
    return this.complaintsService.create(createComplaintDto)
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Number.parseInt(page) : 1
    const limitNum = limit ? Number.parseInt(limit) : 10
    return this.complaintsService.findAll(storeId, status, priority, pageNum, limitNum)
  }

  @UseGuards(AuthGuard)
  @Get('stats')
  getStats(@Query('storeId') storeId?: string) {
    return this.complaintsService.getStats(storeId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param('id') id: string,  @Body() updateComplaintDto: UpdateComplaintDto) {
    return this.complaintsService.update(id, updateComplaintDto)
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(id);
  }
}
