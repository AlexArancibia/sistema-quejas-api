import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFinancialStatus, OrderFulfillmentStatus } from '@prisma/client';
import { CustomerAuthGuard } from 'src/customer/guards/customer.guard';
import { PublicKeyGuard } from 'src/auth/guards/public.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @UseGuards(PublicKeyGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }
  @UseGuards(CustomerAuthGuard)
  @Get()
  findAll(
    @Query('financialStatus') financialStatus?: OrderFinancialStatus,
    @Query('fulfillmentStatus') fulfillmentStatus?: OrderFulfillmentStatus,
    @Query('customerId') customerId?: string,
  ) {
    return this.orderService.findAll({ financialStatus, fulfillmentStatus, customerId })
  }
  @UseGuards(PublicKeyGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }
  @UseGuards(CustomerAuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto)
  }
  @UseGuards(CustomerAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
