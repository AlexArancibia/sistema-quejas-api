import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body } from "@nestjs/common"
import { BranchesService } from "./branches.service"
import { CreateBranchDto } from "./dto/create-branch.dto"
import { UpdateBranchDto } from "./dto/update-branch.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "src/auth/guards/public.guard"

@Controller("branches")

export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto)
  }
  @UseGuards(PublicKeyGuard)
  @Get()
  findAll(active?: string) {
    const isActive = active === "true" ? true : active === "false" ? false : undefined
    return this.branchesService.findAll(isActive)
  }
@UseGuards(PublicKeyGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }
  @UseGuards(AuthGuard)  
  @Get(':id/users')
  getBranchUsers(@Param('id') id: string) {
    return this.branchesService.getBranchUsers(id);
  }
  @UseGuards(AuthGuard)
  @Get(':id/instructors')
  getBranchInstructors(@Param('id') id: string) {
    return this.branchesService.getBranchInstructors(id);
  }
  @UseGuards(AuthGuard)
  @Get(":id/complaints")
  getBranchComplaints(@Param('id') id: string, status?: string) {
    return this.branchesService.getBranchComplaints(id, status)
  }
  @UseGuards(AuthGuard)
  @Get(':id/ratings')
  getBranchRatings(@Param('id') id: string) {
    return this.branchesService.getBranchRatings(id);
  }
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchesService.update(id, updateBranchDto)
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
