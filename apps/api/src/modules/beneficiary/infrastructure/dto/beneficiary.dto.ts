import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @IsEnum(RELATIONSHIPS)
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

  @IsEnum(RELATIONSHIPS)
  @IsOptional()
  relationship?: Relationship;

  @IsString()
  @IsOptional()
  note?: string | null;
}

export interface BeneficiaryResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  relationship: Relationship;
  note: string | null;
  assignmentCount: number;
  createdAt: string;
}
