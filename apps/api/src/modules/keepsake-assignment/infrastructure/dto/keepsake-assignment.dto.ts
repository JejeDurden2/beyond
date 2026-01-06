import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { Relationship } from '@/modules/beneficiary/domain/entities/beneficiary.entity';

export class BulkAssignDto {
  @IsArray()
  @IsUUID('4', { each: true })
  beneficiaryIds!: string[];
}

export class UpdatePersonalMessageDto {
  @IsString()
  @IsOptional()
  personalMessage?: string | null;
}

export interface AssignmentResponseDto {
  id: string;
  keepsakeId: string;
  beneficiaryId: string;
  beneficiaryFirstName: string;
  beneficiaryLastName: string;
  beneficiaryFullName: string;
  beneficiaryEmail: string;
  beneficiaryRelationship: Relationship;
  personalMessage: string | null;
  createdAt: string;
}
