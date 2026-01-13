import { IsUUID } from 'class-validator';

export class DeliverKeepsakeDto {
  @IsUUID()
  keepsakeId!: string;
}
