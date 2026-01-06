import { Entity } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

export interface KeepsakeAssignmentProps {
  id?: string;
  keepsakeId: string;
  beneficiaryId: string;
  personalMessage?: string | null;
  createdAt?: Date;
}

export class KeepsakeAssignment extends Entity<KeepsakeAssignmentProps> {
  private constructor(props: KeepsakeAssignmentProps) {
    super(props);
  }

  static create(props: KeepsakeAssignmentProps): Result<KeepsakeAssignment, string> {
    if (!props.keepsakeId) {
      return err('Keepsake ID is required');
    }
    if (!props.beneficiaryId) {
      return err('Beneficiary ID is required');
    }
    return ok(new KeepsakeAssignment(props));
  }

  get keepsakeId(): string {
    return this.props.keepsakeId;
  }

  get beneficiaryId(): string {
    return this.props.beneficiaryId;
  }

  get personalMessage(): string | null {
    return this.props.personalMessage ?? null;
  }

  updatePersonalMessage(message: string | null): void {
    this.props.personalMessage = message;
    this._updatedAt = new Date();
  }
}
