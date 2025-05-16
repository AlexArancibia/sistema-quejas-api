import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch } from "@nestjs/common"
import { CurrencyService } from "./currency.service"
import { CreateCurrencyDto } from "./dto/create-currency.dto"
import { UpdateCurrencyDto } from "./dto/update-currency.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"

@Controller("currencies")
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(createCurrencyDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll(@Query("includeInactive") includeInactive?: boolean) {
    // Ya no filtramos por storeId
    return this.currencyService.findAll(includeInactive === true);
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.currencyService.findOne(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("by-code/:code")
  findByCode(@Param("code") code: string) {
    // Eliminamos el parámetro storeId
    return this.currencyService.findByCode(code);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCurrencyDto: UpdateCurrencyDto) {
    return this.currencyService.update(id, updateCurrencyDto);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.currencyService.remove(id);
  }
}