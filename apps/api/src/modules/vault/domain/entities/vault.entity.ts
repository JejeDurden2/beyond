import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { EncryptionSalt } from '../value-objects/encryption-salt.value-object';

export enum VaultStatus {
  ACTIVE = 'active',
  PENDING_VERIFICATION = 'pending_verification',
  UNSEALED = 'unsealed',
}

export interface VaultProps {
  id?: string;
  userId: string;
  status: VaultStatus;
  encryptionSalt: EncryptionSalt;
  unsealedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateVaultInput {
  userId: string;
}

export class Vault extends AggregateRoot<VaultProps> {
  private constructor(props: VaultProps) {
    super(props);
  }

  static create(input: CreateVaultInput): Result<Vault, string> {
    if (!input.userId) {
      return err('User ID is required');
    }

    const encryptionSalt = EncryptionSalt.generate();

    return ok(
      new Vault({
        userId: input.userId,
        status: VaultStatus.ACTIVE,
        encryptionSalt,
      }),
    );
  }

  static reconstitute(props: VaultProps): Vault {
    return new Vault(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): VaultStatus {
    return this.props.status;
  }

  get encryptionSalt(): EncryptionSalt {
    return this.props.encryptionSalt;
  }

  get unsealedAt(): Date | null {
    return this.props.unsealedAt ?? null;
  }

  isActive(): boolean {
    return this.props.status === VaultStatus.ACTIVE;
  }

  isPendingVerification(): boolean {
    return this.props.status === VaultStatus.PENDING_VERIFICATION;
  }

  isUnsealed(): boolean {
    return this.props.status === VaultStatus.UNSEALED;
  }

  startVerification(): Result<void, string> {
    if (this.props.status !== VaultStatus.ACTIVE) {
      return err('Vault must be active to start verification');
    }
    this.props.status = VaultStatus.PENDING_VERIFICATION;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  unseal(): Result<void, string> {
    if (this.props.status !== VaultStatus.PENDING_VERIFICATION) {
      return err('Vault must be pending verification to unseal');
    }
    this.props.status = VaultStatus.UNSEALED;
    this.props.unsealedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  cancelVerification(): Result<void, string> {
    if (this.props.status !== VaultStatus.PENDING_VERIFICATION) {
      return err('Vault must be pending verification to cancel');
    }
    this.props.status = VaultStatus.ACTIVE;
    this._updatedAt = new Date();
    return ok(undefined);
  }
}
