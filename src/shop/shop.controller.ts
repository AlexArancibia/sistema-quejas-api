import { Controller, Get, Post, Body, Param, Put, UseGuards, Delete, Logger, Patch } from "@nestjs/common"
import   { CreateShopSettingsDto } from "./dto/create-shop-settings.dto"
import   { UpdateShopSettingsDto } from "./dto/update-shop-settings.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "src/auth/guards/public.guard"
import { ShopSettingsService } from "./shop.service"

@Controller("shop-settings")
export class ShopSettingsController {
  private readonly logger = new Logger(ShopSettingsController.name)

  constructor(private readonly shopSettingsService: ShopSettingsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createShopSettingsDto: CreateShopSettingsDto) {
    this.logger.log(`Creating shop settings for store: ${createShopSettingsDto.storeId}`);
    return this.shopSettingsService.create(createShopSettingsDto);
  }

  @Get()
  findAll() {
    this.logger.log("Finding all stores")
    return this.shopSettingsService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  findByStoreId(@Param("storeId") storeId: string) {
    this.logger.log(`Finding shop settings by store ID: ${storeId}`);
    return this.shopSettingsService.findByStoreId(storeId);
  }

  @UseGuards(PublicKeyGuard)
  @Get("domain/:domain")
  findByDomain(@Param("domain") domain: string) {
    this.logger.log(`Finding shop settings by domain: ${domain}`);
    return this.shopSettingsService.findByDomain(domain);
  }

  @UseGuards(AuthGuard)
  @Patch("store/:storeId")
  update(@Param("storeId") storeId: string, @Body() updateShopSettingsDto: UpdateShopSettingsDto) {
    this.logger.log(`Updating shop settings for store: ${storeId}`)
    return this.shopSettingsService.update(storeId, updateShopSettingsDto)
  }

  @UseGuards(AuthGuard)
  @Post("store/:storeId/currencies/:currencyId")
  addAcceptedCurrency(@Param("storeId") storeId: string, @Param("currencyId") currencyId: string) {
    this.logger.log(`Adding accepted currency ${currencyId} to store: ${storeId}`)
    return this.shopSettingsService.addAcceptedCurrency(storeId, currencyId)
  }

  @UseGuards(AuthGuard)
  @Delete("store/:storeId/currencies/:currencyId")
  removeAcceptedCurrency(@Param("storeId") storeId: string, @Param("currencyId") currencyId: string) {
    this.logger.log(`Removing accepted currency ${currencyId} from store: ${storeId}`)
    return this.shopSettingsService.removeAcceptedCurrency(storeId, currencyId)
  }
}
