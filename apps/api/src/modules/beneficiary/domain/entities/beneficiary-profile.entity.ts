import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

export interface BeneficiaryProfileProps {
  id?: string;
  userId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BeneficiaryProfile extends AggregateRoot<BeneficiaryProfileProps> {
  private constructor(props: BeneficiaryProfileProps) {
    super(props);
  }

  static create(userId: string): Result<BeneficiaryProfile, string> {
    if (!userId) {
      return err('User ID is required');
    }

    return ok(
      new BeneficiaryProfile({
        userId,
        isActive: true,
      }),
    );
  }

  static reconstitute(props: BeneficiaryProfileProps): BeneficiaryProfile {
    return new BeneficiaryProfile(props);
  }

  deactivate(): void {
    this.props.isActive = false;
    this._updatedAt = new Date();
  }

  reactivate(): void {
    this.props.isActive = true;
    this._updatedAt = new Date();
  }

  get userId(): string {
    return this.props.userId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
