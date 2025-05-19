import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { FrequentlyBoughtTogetherService } from "./fbt.service";
import { CreateFrequentlyBoughtTogetherDto } from "./dto/create-fbt.dto";
import { UpdateFrequentlyBoughtTogetherDto } from "./dto/update-fbt.dto";

@Controller("frequently-bought-together")
export class FrequentlyBoughtTogetherController {
  constructor(private readonly frequentlyBoughtTogetherService: FrequentlyBoughtTogetherService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createFrequentlyBoughtTogetherDto: CreateFrequentlyBoughtTogetherDto) {
    return this.frequentlyBoughtTogetherService.create(createFrequentlyBoughtTogetherDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll() {
    return this.frequentlyBoughtTogetherService.findAll()
  }

  @UseGuards(PublicKeyGuard)
  @Get('store/:storeId')
  findAllByStore(@Param('storeId') storeId: string) {
    return this.frequentlyBoughtTogetherService.findAllByStore(storeId)
  }

  @UseGuards(PublicKeyGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.frequentlyBoughtTogetherService.findOne(id)
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() updateFrequentlyBoughtTogetherDto: UpdateFrequentlyBoughtTogetherDto) {
    return this.frequentlyBoughtTogetherService.update(id, updateFrequentlyBoughtTogetherDto)
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.frequentlyBoughtTogetherService.remove(id)
  }
}
