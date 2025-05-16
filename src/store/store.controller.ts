import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Patch } from "@nestjs/common"
import { StoreService } from "./store.service"
import { CreateStoreDto } from "./dto/create-store.dto"
import { UpdateStoreDto } from "./dto/update-store.dto"
import { CreateApiKeyDto } from "./dto/create-api-key.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "../auth/guards/public.guard"

@Controller("stores")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.storeService.findAll()
  }

  @UseGuards(AuthGuard)
  @Get("owner/:ownerId")
  findAllByOwner(@Param("ownerId") ownerId: string) {
    return this.storeService.findAllByOwner(ownerId);
  }

  // @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.storeService.findOne(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("by-slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.storeService.findBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.update(id, updateStoreDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.storeService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post("api-keys")
  createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    return this.storeService.createApiKey(createApiKeyDto);
  }

  @UseGuards(AuthGuard)
  @Get(":storeId/api-keys")
  getApiKeys(@Param("storeId") storeId: string) {
    return this.storeService.getApiKeys(storeId);
  }

  @UseGuards(AuthGuard)
  @Delete(":storeId/api-keys/:keyId")
  deleteApiKey(@Param("storeId") storeId: string, @Param("keyId") keyId: string) {
    return this.storeService.deleteApiKey(storeId, keyId)
  }

  @UseGuards(PublicKeyGuard)
  @Get(":storeId/statistics")
  getStatistics(@Param("storeId") storeId: string) {
    return this.storeService.getStatistics(storeId);
  }

  @UseGuards(PublicKeyGuard)
  @Post("verify-api-key")
  verifyApiKey(@Body() body: { apiKey: string }) {
    return this.storeService.verifyApiKey(body.apiKey);
  }
}