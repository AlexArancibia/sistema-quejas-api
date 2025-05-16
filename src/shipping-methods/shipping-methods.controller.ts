import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, Logger } from "@nestjs/common";
import { ShippingMethodsService } from "./shipping-methods.service";
import { CreateShippingMethodDto } from "./dto/create-shipping-method.dto";
import { UpdateShippingMethodDto } from "./dto/update-shipping-method.dto";
import { PublicKeyGuard } from "../auth/guards/public.guard";
import { AuthGuard } from "../auth/guards/auth.guard";

@Controller("shipping-methods")
export class ShippingMethodController {
  private readonly logger = new Logger(ShippingMethodController.name);

  constructor(private readonly shippingMethodService: ShippingMethodsService) {}

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll() {
    this.logger.debug('Obteniendo todos los métodos de envío');
    return this.shippingMethodService.findAll();
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  findAllByStore(@Param("storeId") storeId: string) {
    this.logger.debug(`Obteniendo métodos de envío para la tienda: ${storeId}`);
    return this.shippingMethodService.findAllByStore(storeId);
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
    this.logger.debug(`Actualizando método de envío con ID: ${id}`);
    this.logger.debug(`Payload: ${JSON.stringify(updateShippingMethodDto)}`);
    return this.shippingMethodService.update(id, updateShippingMethodDto);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    this.logger.debug(`Eliminando método de envío con ID: ${id}`);
    return this.shippingMethodService.remove(id);
  }
}