import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from "@nestjs/common"
import { PaymentTransactionService } from "./payment-transaction.service"
import { CreatePaymentTransactionDto } from "./dto/create-payment-transaction.dto"
import { UpdatePaymentTransactionDto } from "./dto/update-payment-transaction.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PaymentStatus } from "@prisma/client"
import { Type } from "class-transformer"
import { IsDate, IsOptional } from "class-validator"

class DateRangeDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date
}

@Controller("payment-transactions")
export class PaymentTransactionController {
  constructor(private readonly paymentTransactionService: PaymentTransactionService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createPaymentTransactionDto: CreatePaymentTransactionDto) {
    return this.paymentTransactionService.create(createPaymentTransactionDto)
  }

  @Get()
  @UseGuards(PublicKeyGuard)
  findAll() {
    return this.paymentTransactionService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get("order/:orderId")
  findAllByOrder(@Param("orderId") orderId: string) {
    return this.paymentTransactionService.findAllByOrder(orderId)
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  findAllByStore(@Param("storeId") storeId: string, @Query("status") status?: PaymentStatus) {
    return this.paymentTransactionService.findAllByStore(storeId, status)
  }

  @UseGuards(PublicKeyGuard)
  @Get("provider/:paymentProviderId")
  findAllByPaymentProvider(
    @Param("paymentProviderId") paymentProviderId: string,
    @Query("status") status?: PaymentStatus,
  ) {
    return this.paymentTransactionService.findAllByPaymentProvider(paymentProviderId, status)
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.paymentTransactionService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updatePaymentTransactionDto: UpdatePaymentTransactionDto) {
    return this.paymentTransactionService.update(id, updatePaymentTransactionDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.paymentTransactionService.remove(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("statistics/store/:storeId")
  getStatisticsByStore(@Param("storeId") storeId: string, @Query() dateRange: DateRangeDto) {
    return this.paymentTransactionService.getStatisticsByStore(storeId, dateRange.startDate, dateRange.endDate)
  }
}
