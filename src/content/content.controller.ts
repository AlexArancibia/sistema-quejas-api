import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "../auth/guards/public.guard"
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  @Get()
  @UseGuards(PublicKeyGuard)
  findAll() {
    return this.contentService.findAll()
  }

  @Get(':id')
  @UseGuards(PublicKeyGuard)
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.contentService.update(id, updateContentDto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
