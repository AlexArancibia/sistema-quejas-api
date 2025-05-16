import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch, ParseIntPipe } from "@nestjs/common"
import { OrderService } from "./order.service"
import { CreateOrderDto } from "./dto/create-order.dto"
import { UpdateOrderDto } from "./dto/update-order.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"
import { OrderFinancialStatus, OrderFulfillmentStatus, PaymentStatus, ShippingStatus } from "@prisma/client"
import { Type } from "class-transformer"
import { IsDate, IsEnum, IsOptional } from "class-validator"

class OrderFilterDto {
  @IsOptional()
  @IsEnum(OrderFinancialStatus)
  financialStatus?: OrderFinancialStatus

  @IsOptional()
  @IsEnum(OrderFulfillmentStatus)
  fulfillmentStatus?: OrderFulfillmentStatus

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus

  @IsOptional()
  @IsEnum(ShippingStatus)
  shippingStatus?: ShippingStatus

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date

  @IsOptional()
  @Type(() => Number)
  page?: number

  @IsOptional()
  @Type(() => Number)
  limit?: number
}

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto)
  }

  @Get()
  findAll() {
    return this.orderService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  findAllByStore(@Param("storeId") storeId: string, @Query() filterDto: OrderFilterDto) {
    return this.orderService.findAllByStore(storeId, filterDto)
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId/number/:orderNumber")
  findByOrderNumber(@Param("storeId") storeId: string, @Param("orderNumber", ParseIntPipe) orderNumber: number) {
    return this.orderService.findByOrderNumber(storeId, orderNumber)
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto)
  }

  @UseGuards(AuthGuard)
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body()
    statusData: {
      financialStatus?: OrderFinancialStatus
      fulfillmentStatus?: OrderFulfillmentStatus
      paymentStatus?: PaymentStatus
      shippingStatus?: ShippingStatus
    },
  ) {
    return this.orderService.updateStatus(id, statusData)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.orderService.remove(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("statistics/:storeId")
  getStatistics(
    @Param("storeId") storeId: string,
    @Query("startDate") startDate?: Date,
    @Query("endDate") endDate?: Date,
  ) {
    return this.orderService.getStatistics(storeId, startDate, endDate)
  }
}
