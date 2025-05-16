import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import   { TeamSectionService } from "./team-section.service"
import   { CreateTeamSectionDto } from "./dto/create-team-section.dto"
import   { UpdateTeamSectionDto } from "./dto/update-team-section.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "src/auth/guards/public.guard"
 

@Controller("team-sections")
export class TeamSectionController {
  constructor(private readonly teamSectionService: TeamSectionService) {}

  
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTeamSectionDto: CreateTeamSectionDto) {
    return this.teamSectionService.create(createTeamSectionDto);
  }

  
  @UseGuards(PublicKeyGuard)
  @Get()
  findAll() {
    return this.teamSectionService.findAll()
  }
  @UseGuards(PublicKeyGuard)
  @Get('store/:storeId')
  findAllByStore(@Param('storeId') storeId: string) {
    return this.teamSectionService.findAllByStore(storeId);
  }
  @UseGuards(PublicKeyGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamSectionService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() updateTeamSectionDto: UpdateTeamSectionDto) {
    return this.teamSectionService.update(id, updateTeamSectionDto)
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamSectionService.remove(id);
  }
}
