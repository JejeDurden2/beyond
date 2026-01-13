import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Relationship, RELATIONSHIPS } from '../../domain/entities/beneficiary.entity';

export class CreateBeneficiaryDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsIn(RELATIONSHIPS)
  relationship!: Relationship;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateBeneficiaryDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsIn(RELATIONSHIPS)
  @IsOptional()
  relationship?: Relationship;

  @IsString()
  @IsOptional()
  note?: string | null;
}

export class SetTrustedPersonDto {
  @IsBoolean()
  isTrustedPerson!: boolean;
}

export interface BeneficiaryResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  relationship: Relationship;
  note: string | null;
  isTrustedPerson: boolean;
  assignmentCount: number;
  createdAt: string;
}

export interface BeneficiaryKeepsakeResponseDto {
  id: string;
  keepsakeId: string;
  keepsakeTitle: string;
  keepsakeType: string;
  keepsakeStatus: string;
  keepsakeUpdatedAt: string;
  personalMessage: string | null;
  createdAt: string;
}
