import { PartialType } from '@nestjs/mapped-types';
import { CreatePenguinDto } from './create-penguin.dto';

export class UpdatePenguinDto extends PartialType(CreatePenguinDto) {}
