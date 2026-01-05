import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

export interface BeneficiaryProps {
  id?: string;
  vaultId: string;
  name: string;
  email: string;
  relationship?: string | null;
  accessToken?: string | null;
  accessedAt?: Date | null;
  createdAt?: Date;
}

export class Beneficiary extends AggregateRoot<BeneficiaryProps> {
  private constructor(props: BeneficiaryProps) {
    super(props);
  }

  static create(props: BeneficiaryProps): Result<Beneficiary, string> {
    if (!props.vaultId) {
      return err('Vault ID is required');
    }
    if (!props.name) {
      return err('Name is required');
    }
    if (!props.email) {
      return err('Email is required');
    }
    return ok(new Beneficiary(props));
  }

  get vaultId(): string {
    return this.props.vaultId;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get relationship(): string | null {
    return this.props.relationship ?? null;
  }

  get accessToken(): string | null {
    return this.props.accessToken ?? null;
  }

  get accessedAt(): Date | null {
    return this.props.accessedAt ?? null;
  }

  grantAccess(token: string): void {
    this.props.accessToken = token;
    this._updatedAt = new Date();
  }

  recordAccess(): void {
    this.props.accessedAt = new Date();
    this._updatedAt = new Date();
  }
}
