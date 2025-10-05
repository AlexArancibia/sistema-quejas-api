import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body, Query } from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PublicKeyGuard } from '../auth/guards/public.guard';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areasService.create(createAreaDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('active') active?: string) {
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    return this.areasService.findAll(isActive);
  }

  @UseGuards(PublicKeyGuard)
  @Get('public')
  findActiveAreas() {
    return this.areasService.findAll(true);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.areasService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areasService.update(id, updateAreaDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areasService.remove(id);
  }
}
