import { ValueObject } from '@/shared/domain';
import { randomBytes } from 'crypto';

interface EncryptionSaltProps {
  value: string;
}

export class EncryptionSalt extends ValueObject<EncryptionSaltProps> {
  private static readonly SALT_LENGTH = 32;

  private constructor(props: EncryptionSaltProps) {
    super(props);
  }

  static generate(): EncryptionSalt {
    const saltBytes = randomBytes(this.SALT_LENGTH);
    return new EncryptionSalt({ value: saltBytes.toString('base64') });
  }

  static fromString(value: string): EncryptionSalt {
    return new EncryptionSalt({ value });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.value;
  }
}
