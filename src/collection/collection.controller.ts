import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch } from "@nestjs/common"
import  { CollectionService } from "./collection.service"
import  { CreateCollectionDto } from "./dto/create-collection.dto"
import  { UpdateCollectionDto } from "./dto/update-collection.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"

@Controller("collections")
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionService.create(createCollectionDto)
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll(@Query("storeId") storeId?: string) {
    if (storeId) {
      return this.collectionService.findAllByStore(storeId);
    }
    return this.collectionService.findAll();
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.collectionService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionService.update(id, updateCollectionDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.collectionService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post(":id/products/:productId")
  addProduct(@Param("id") id: string, @Param("productId") productId: string) {
    return this.collectionService.addProduct(id, productId)
  }

  @UseGuards(AuthGuard)
  @Delete(":id/products/:productId")
  removeProduct(@Param("id") id: string, @Param("productId") productId: string) {
    return this.collectionService.removeProduct(id, productId)
  }
}
