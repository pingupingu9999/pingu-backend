import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(OmitType(CreateTagDto, ['categoryTagId'] as const)) {}
