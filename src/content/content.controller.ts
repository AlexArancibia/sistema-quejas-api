import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch } from "@nestjs/common"
import   { ContentService } from "./content.service"
import   { CreateContentDto } from "./dto/create-content.dto"
import   { UpdateContentDto } from "./dto/update-content.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"
import   { ContentType } from "@prisma/client"
 
@Controller("contents")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll(
    @Query("storeId") storeId?: string,
    @Query("type") type?: ContentType,
    @Query("published") published?: boolean,
    @Query("category") category?: string,
  ) {
    if (storeId) {
      return this.contentService.findAllByStore(storeId, {
        type,
        published: published !== undefined ? published === true : undefined,
        category,
      })
    }
    return this.contentService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contentService.findOne(id)
  }

  @UseGuards(PublicKeyGuard)
  @Get("by-slug/:storeId/:slug")
  findBySlug(@Param("storeId") storeId: string, @Param("slug") slug: string) {
    return this.contentService.findBySlug(storeId, slug)
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.contentService.update(id, updateContentDto)
  }

  @UseGuards(AuthGuard)
  @Patch(":id/publish")
  publish(@Param("id") id: string) {
    return this.contentService.togglePublished(id, true)
  }

  @UseGuards(AuthGuard)
  @Patch(":id/unpublish")
  unpublish(@Param("id") id: string) {
    return this.contentService.togglePublished(id, false)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.contentService.remove(id)
  }
}
