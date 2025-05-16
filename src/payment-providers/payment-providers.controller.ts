import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch } from "@nestjs/common"
import { PaymentProviderService } from "./payment-providers.service"
import { CreatePaymentProviderDto } from "./dto/create-payment-provider.dto"
import { UpdatePaymentProviderDto } from "./dto/update-payment-provider.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PaymentProviderType } from "@prisma/client"

@Controller("payment-providers")
export class PaymentProviderController {
  constructor(private readonly paymentProviderService: PaymentProviderService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPaymentProviderDto: CreatePaymentProviderDto) {
    return this.paymentProviderService.create(createPaymentProviderDto)
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll() {
    return this.paymentProviderService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  findAllByStore(
    @Param("storeId") storeId: string,
    @Query("includeInactive") includeInactive?: boolean,
    @Query("type") type?: PaymentProviderType,
  ) {
    return this.paymentProviderService.findAllByStore(storeId, includeInactive === true, type)
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.paymentProviderService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updatePaymentProviderDto: UpdatePaymentProviderDto) {
    return this.paymentProviderService.update(id, updatePaymentProviderDto)
  }

  @UseGuards(AuthGuard)
  @Patch(":id/activate")
  activate(@Param("id") id: string) {
    return this.paymentProviderService.toggleActive(id, true);
  }

  @UseGuards(AuthGuard)
  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string) {
    return this.paymentProviderService.toggleActive(id, false);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.paymentProviderService.remove(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id/statistics")
  getStatistics(@Param("id") id: string) {
    return this.paymentProviderService.getStatistics(id);
  }
}
