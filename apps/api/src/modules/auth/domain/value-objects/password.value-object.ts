import { ValueObject } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import * as bcrypt from 'bcrypt';

interface PasswordProps {
  hashedValue: string;
}

export class Password extends ValueObject<PasswordProps> {
  private static readonly MIN_LENGTH = 12;
  private static readonly MAX_LENGTH = 128;
  private static readonly SALT_ROUNDS = 12;

  private constructor(props: PasswordProps) {
    super(props);
  }

  static async create(plainPassword: string): Promise<Result<Password, string>> {
    const validationResult = this.validate(plainPassword);
    if (validationResult.isErr()) {
      return err(validationResult.error);
    }

    const hashedValue = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    return ok(new Password({ hashedValue }));
  }

  static fromHash(hashedValue: string): Password {
    return new Password({ hashedValue });
  }

  private static validate(password: string): Result<void, string> {
    if (!password) {
      return err('Password is required');
    }

    if (password.length < this.MIN_LENGTH) {
      return err(`Password must be at least ${this.MIN_LENGTH} characters`);
    }

    if (password.length > this.MAX_LENGTH) {
      return err(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    return ok(undefined);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.props.hashedValue);
  }

  get hashedValue(): string {
    return this.props.hashedValue;
  }
}
