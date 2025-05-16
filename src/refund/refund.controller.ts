import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from "@nestjs/common"
import { RefundService } from "./refund.service"
import { CreateRefundDto } from "./dto/create-refund.dto"
import { UpdateRefundDto } from "./dto/update-refund.dto"
import { CreateRefundLineItemDto } from "./dto/create-refund-line-item.dto"
import { UpdateRefundLineItemDto } from "./dto/update-refund-line-item.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "../auth/guards/public.guard"
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

@Controller("refunds")
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRefundDto: CreateRefundDto) {
    return this.refundService.create(createRefundDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll() {
    return this.refundService.findAll()
  }
  @UseGuards(PublicKeyGuard)
  @Get("order/:orderId")
  findAllByOrder(@Param("orderId") orderId: string) {
    return this.refundService.findAllByOrder(orderId);
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  findAllByStore(@Param("storeId") storeId: string) {
    return this.refundService.findAllByStore(storeId);
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.refundService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateRefundDto: UpdateRefundDto) {
    return this.refundService.update(id, updateRefundDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.refundService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post("line-items")
  createLineItem(@Body() createRefundLineItemDto: CreateRefundLineItemDto) {
    return this.refundService.createLineItem(createRefundLineItemDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get("line-items/:id")
  findLineItem(@Param("id") id: string) {
    return this.refundService.findLineItem(id);
  }

  @UseGuards(AuthGuard)
  @Put("line-items/:id")
  updateLineItem(@Param("id") id: string, @Body() updateRefundLineItemDto: UpdateRefundLineItemDto) {
    return this.refundService.updateLineItem(id, updateRefundLineItemDto)
  }

  @UseGuards(AuthGuard)
  @Delete("line-items/:id")
  removeLineItem(@Param("id") id: string) {
    return this.refundService.removeLineItem(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("statistics/store/:storeId")
  getStatisticsByStore(@Param("storeId") storeId: string, @Query() dateRange: DateRangeDto) {
    return this.refundService.getStatisticsByStore(storeId, dateRange.startDate, dateRange.endDate)
  }
}
