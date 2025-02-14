import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpCode } from "@nestjs/common"
import { HeroSectionService } from './hero-section.service';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { AuthGuard } from "src/auth/guards/auth.guard";
import { PublicKeyGuard } from "src/auth/guards/public.guard";

@Controller('hero-section')
export class HeroSectionController {
  constructor(private readonly heroSectionService: HeroSectionService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHeroSectionDto: CreateHeroSectionDto) {
    return this.heroSectionService.create(createHeroSectionDto);
  }

  @Get()
  @UseGuards(PublicKeyGuard)
  findAll() {
    return this.heroSectionService.findAll()
  }

  @Get(':id')
  @UseGuards(PublicKeyGuard)
  findOne(@Param('id') id: string) {
    return this.heroSectionService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateHeroSectionDto: UpdateHeroSectionDto) {
    return this.heroSectionService.update(id, updateHeroSectionDto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.heroSectionService.remove(id);
  }
}

