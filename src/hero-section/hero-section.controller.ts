import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch } from "@nestjs/common"
import { HeroSectionService } from "./hero-section.service"
import { CreateHeroSectionDto } from "./dto/create-hero-section.dto"
import { UpdateHeroSectionDto } from "./dto/update-hero-section.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"

@Controller("hero-sections")
export class HeroSectionController {
  constructor(private readonly heroSectionService: HeroSectionService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createHeroSectionDto: CreateHeroSectionDto) {
    return this.heroSectionService.create(createHeroSectionDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll(@Query("storeId") storeId?: string, @Query("includeInactive") includeInactive?: boolean) {
    if (storeId) {
      return this.heroSectionService.findAllByStore(storeId, includeInactive === true)
    }
    return this.heroSectionService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.heroSectionService.findOne(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId/active")
  getActiveHeroSection(@Param("storeId") storeId: string) {
    return this.heroSectionService.getActiveHeroSection(storeId);
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateHeroSectionDto: UpdateHeroSectionDto) {
    return this.heroSectionService.update(id, updateHeroSectionDto)
  }

  @UseGuards(AuthGuard)
  @Patch(":id/activate")
  activate(@Param("id") id: string) {
    return this.heroSectionService.toggleActive(id, true);
  }

  @UseGuards(AuthGuard)
  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string) {
    return this.heroSectionService.toggleActive(id, false);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.heroSectionService.remove(id);
  }
}
