import { PartialType } from '@nestjs/mapped-types';
import {  CreateShopSettingsDto } from './create-shop-settings.dto';

export class UpdateShopSettingsDto extends PartialType(CreateShopSettingsDto) {}

