import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

export type Relationship =
  | 'SPOUSE'
  | 'CHILD'
  | 'PARENT'
  | 'SIBLING'
  | 'GRANDCHILD'
  | 'GRANDPARENT'
  | 'FRIEND'
  | 'COLLEAGUE'
  | 'OTHER';

export const RELATIONSHIPS: Relationship[] = [
  'SPOUSE',
  'CHILD',
  'PARENT',
  'SIBLING',
  'GRANDCHILD',
  'GRANDPARENT',
  'FRIEND',
  'COLLEAGUE',
  'OTHER',
];

export interface BeneficiaryProps {
  id?: string;
  vaultId: string;
  firstName: string;
  lastName: string;
  email: string;
  relationship: Relationship;
  note?: string | null;
  accessToken?: string | null;
  accessedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Beneficiary extends AggregateRoot<BeneficiaryProps> {
  private constructor(props: BeneficiaryProps) {
    super(props);
  }

  static create(props: BeneficiaryProps): Result<Beneficiary, string> {
    if (!props.vaultId) {
      return err('Vault ID is required');
    }
    if (!props.firstName?.trim()) {
      return err('First name is required');
    }
    if (!props.lastName?.trim()) {
      return err('Last name is required');
    }
    if (!props.email?.trim()) {
      return err('Email is required');
    }
    if (!props.relationship || !RELATIONSHIPS.includes(props.relationship)) {
      return err('Valid relationship is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.email)) {
      return err('Invalid email format');
    }

    return ok(new Beneficiary(props));
  }

  get vaultId(): string {
    return this.props.vaultId;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get email(): string {
    return this.props.email;
  }

  get relationship(): Relationship {
    return this.props.relationship;
  }

  get note(): string | null {
    return this.props.note ?? null;
  }

  get accessToken(): string | null {
    return this.props.accessToken ?? null;
  }

  get accessedAt(): Date | null {
    return this.props.accessedAt ?? null;
  }

  update(props: {
    firstName?: string;
    lastName?: string;
    email?: string;
    relationship?: Relationship;
    note?: string | null;
  }): Result<void, string> {
    if (props.firstName !== undefined) {
      if (!props.firstName.trim()) {
        return err('First name is required');
      }
      this.props.firstName = props.firstName;
    }

    if (props.lastName !== undefined) {
      if (!props.lastName.trim()) {
        return err('Last name is required');
      }
      this.props.lastName = props.lastName;
    }

    if (props.email !== undefined) {
      if (!props.email.trim()) {
        return err('Email is required');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(props.email)) {
        return err('Invalid email format');
      }
      this.props.email = props.email;
    }

    if (props.relationship !== undefined) {
      if (!RELATIONSHIPS.includes(props.relationship)) {
        return err('Valid relationship is required');
      }
      this.props.relationship = props.relationship;
    }

    if (props.note !== undefined) {
      this.props.note = props.note;
    }

    this._updatedAt = new Date();
    return ok(undefined);
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
