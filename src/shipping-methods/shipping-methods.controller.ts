import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, Logger, Query } from "@nestjs/common"
import { ShippingMethodsService } from "./shipping-methods.service"
import { CreateShippingMethodDto } from "./dto/create-shipping-method.dto"
import { UpdateShippingMethodDto } from "./dto/update-shipping-method.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"

@Controller("shipping-methods")
export class ShippingMethodController {
  private readonly logger = new Logger(ShippingMethodController.name)

  constructor(private readonly shippingMethodService: ShippingMethodsService) {}

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll() {
    this.logger.debug("Obteniendo todos los métodos de envío")
    return this.shippingMethodService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  findAllByStore(@Param("storeId") storeId: string) {
    this.logger.debug(`Obteniendo métodos de envío para la tienda: ${storeId}`);
    return this.shippingMethodService.findAllByStore(storeId);
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId/location")
  findByGeographicLocation(
    @Param("storeId") storeId: string,
    @Query("countryCode") countryCode?: string,
    @Query("stateCode") stateCode?: string,
    @Query("cityName") cityName?: string,
    @Query("postalCode") postalCode?: string,
  ) {
    this.logger.debug(`Obteniendo métodos de envío por ubicación para la tienda: ${storeId}`)
    this.logger.debug(`Parámetros de ubicación: ${JSON.stringify({ countryCode, stateCode, cityName, postalCode })}`)
    return this.shippingMethodService.findByGeographicLocation(storeId, countryCode, stateCode, cityName, postalCode)
  }

  @UseGuards(PublicKeyGuard)
  @Get("geographic-data")
  getGeographicData(@Query("countryCode") countryCode?: string, @Query("stateId") stateId?: string) {
    this.logger.debug("Obteniendo datos geográficos")
    this.logger.debug(`Parámetros: countryCode=${countryCode}, stateId=${stateId}`)
    return this.shippingMethodService.getGeographicData(countryCode, stateId)
  }

  @UseGuards(PublicKeyGuard)
  @Get("geographic-data/search")
  searchGeographicData(@Query("q") searchTerm: string, @Query("type") type?: "country" | "state" | "city") {
    this.logger.debug(`Buscando datos geográficos: ${searchTerm}, tipo: ${type}`)
    return this.shippingMethodService.searchGeographicData(searchTerm, type)
  }

  @UseGuards(PublicKeyGuard)
  @Get(":methodId/calculate-cost")
  calculateShippingCost(
    @Param("methodId") methodId: string,
    @Query("weight") weight: string,
    @Query("countryCode") countryCode?: string,
    @Query("stateCode") stateCode?: string,
    @Query("cityName") cityName?: string,
    @Query("postalCode") postalCode?: string,
  ) {
    this.logger.debug(`Calculando costo de envío para método: ${methodId}`)
    const weightNum = Number.parseFloat(weight)
    if (isNaN(weightNum)) {
      throw new Error("El peso debe ser un número válido")
    }
    return this.shippingMethodService.calculateShippingCost(
      methodId,
      weightNum,
      countryCode,
      stateCode,
      cityName,
      postalCode,
    )
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createShippingMethodDto: CreateShippingMethodDto) {
    this.logger.debug('Creando nuevo método de envío');
    this.logger.debug(`Payload: ${JSON.stringify(createShippingMethodDto)}`);
    return this.shippingMethodService.create(createShippingMethodDto);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateShippingMethodDto: UpdateShippingMethodDto) {
    this.logger.debug(`Actualizando método de envío con ID: ${id}`)
    this.logger.debug(`Payload: ${JSON.stringify(updateShippingMethodDto)}`)
    return this.shippingMethodService.update(id, updateShippingMethodDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    this.logger.debug(`Eliminando método de envío con ID: ${id}`);
    return this.shippingMethodService.remove(id);
  }
}
