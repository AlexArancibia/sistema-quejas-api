import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body } from "@nestjs/common"
import { InstructorsService } from "./instructors.service"
import { CreateInstructorDto } from "./dto/create-instructor.dto"
import { UpdateInstructorDto } from "./dto/update-instructor.dto"
import { AuthGuard } from "../auth/guards/auth.guard"

@Controller("instructors")
@UseGuards(AuthGuard)
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  create(@Body() createInstructorDto: CreateInstructorDto) {
    return this.instructorsService.create(createInstructorDto)
  }

  @Get()
  findAll(branchId?: string, active?: string) {
    const isActive = active === "true" ? true : active === "false" ? false : undefined
    return this.instructorsService.findAll(branchId, isActive)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @Get(':id/ratings')
  getInstructorRatings(@Param('id') id: string) {
    return this.instructorsService.getInstructorRatings(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateInstructorDto: UpdateInstructorDto) {
    return this.instructorsService.update(id, updateInstructorDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(id);
  }
}
