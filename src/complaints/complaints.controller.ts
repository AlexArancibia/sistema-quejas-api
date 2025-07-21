import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Query, Body, ParseIntPipe } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PublicKeyGuard } from "../auth/guards/public.guard";
import { ComplaintStatus, ComplaintPriority } from "@prisma/client";

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @UseGuards(PublicKeyGuard)
  @Post()
  create(@Body() createComplaintDto: CreateComplaintDto) {
    return this.complaintsService.create(createComplaintDto);
  }

  @UseGuards(PublicKeyGuard)
@Get()
async findAll(
  @Query('branchId') branchId?: string,
  @Query('status') status?: ComplaintStatus,
  @Query('priority') priority?: ComplaintPriority,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('page') page?: string,
   @Query('limit') limit?: string
) {
  // Validación de parámetros de paginación
  const pageNum = page ? Number.parseInt(page) : 1
    const limitNum = limit ? Number.parseInt(limit) : 10

  return this.complaintsService.findAll(
    branchId,
    status,
    priority,
    startDate,
    endDate,
    pageNum,
    limitNum
  );
}

  @UseGuards(AuthGuard)
  @Get('stats')
  async getStats(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.complaintsService.getStats(branchId, startDate, endDate);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto
  ) {
    return this.complaintsService.update(id, updateComplaintDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.complaintsService.remove(id);
  }
}