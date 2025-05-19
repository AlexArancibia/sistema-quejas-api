import { PartialType } from '@nestjs/mapped-types';
import { CreateFrequentlyBoughtTogetherDto } from './create-fbt.dto';

export class UpdateFrequentlyBoughtTogetherDto extends PartialType(CreateFrequentlyBoughtTogetherDto) {}
