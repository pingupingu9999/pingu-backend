import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProposalDto } from './create-proposal.dto';

export class UpdateProposalDto extends PartialType(OmitType(CreateProposalDto, ['penguinCategoryTagId', 'proposalType'] as const)) {}
