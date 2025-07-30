import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body, Query } from "@nestjs/common"
import { InstructorsService } from "./instructors.service"
import { CreateInstructorDto } from "./dto/create-instructor.dto"
import { UpdateInstructorDto } from "./dto/update-instructor.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "src/auth/guards/public.guard"

@Controller("instructors")

export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createInstructorDto: CreateInstructorDto) {
    return this.instructorsService.create(createInstructorDto)
  }
  @UseGuards(PublicKeyGuard)
  @Get()
findAll(@Query('active') active?: string) {
  const isActive = active === "true" ? true : active === "false" ? false : undefined
  return this.instructorsService.findAll(isActive)
}
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Get(':id/ratings')
  getInstructorRatings(@Param('id') id: string) {
    return this.instructorsService.getInstructorRatings(id);
  }
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() updateInstructorDto: UpdateInstructorDto) {
    return this.instructorsService.update(id, updateInstructorDto)
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(id);
  }
}
