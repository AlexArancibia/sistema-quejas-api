import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body } from "@nestjs/common"
import { BranchesService } from "./branches.service"
import { CreateBranchDto } from "./dto/create-branch.dto"
import { UpdateBranchDto } from "./dto/update-branch.dto"
import { AuthGuard } from "../auth/guards/auth.guard"

@Controller("branches")
@UseGuards(AuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto)
  }

  @Get()
  findAll(active?: string) {
    const isActive = active === "true" ? true : active === "false" ? false : undefined
    return this.branchesService.findAll(isActive)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Get(':id/users')
  getBranchUsers(@Param('id') id: string) {
    return this.branchesService.getBranchUsers(id);
  }

  @Get(':id/instructors')
  getBranchInstructors(@Param('id') id: string) {
    return this.branchesService.getBranchInstructors(id);
  }

  @Get(":id/complaints")
  getBranchComplaints(@Param('id') id: string, status?: string) {
    return this.branchesService.getBranchComplaints(id, status)
  }

  @Get(':id/ratings')
  getBranchRatings(@Param('id') id: string) {
    return this.branchesService.getBranchRatings(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchesService.update(id, updateBranchDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
