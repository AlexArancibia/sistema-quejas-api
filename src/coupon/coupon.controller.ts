import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch } from "@nestjs/common"
import   { CouponsService } from "./coupon.service"
import   { CreateCouponDto } from "./dto/create-coupon.dto"
import   { UpdateCouponDto } from "./dto/update-coupon.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"
import { ValidateCouponDto } from "./dto/validate-coupon.dto"

@Controller("coupons")
export class CouponController {
  constructor(private readonly couponService: CouponsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll(@Query("storeId") storeId?: string, @Query("includeInactive") includeInactive?: boolean) {
    if (storeId) {
      return this.couponService.findAllByStore(storeId, includeInactive === true)
    }
    return this.couponService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.couponService.findOne(id)
  }

  @UseGuards(PublicKeyGuard)
  @Get("by-code/:storeId/:code")
  findByCode(@Param("storeId") storeId: string, @Param("code") code: string) {
    return this.couponService.findByCode(storeId, code)
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.couponService.remove(id)
  }

  @UseGuards(PublicKeyGuard)
  @Post("validate")
  validateCoupon(@Body() validateCouponDto: ValidateCouponDto) {
    return this.couponService.validateCoupon(validateCouponDto)
  }

  @UseGuards(AuthGuard)
  @Patch(":id/apply")
  applyCoupon(@Param("id") id: string) {
    return this.couponService.applyCoupon(id)
  }
}
