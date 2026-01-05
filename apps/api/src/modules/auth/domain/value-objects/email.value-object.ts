import { ValueObject } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MAX_LENGTH = 254;

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Result<Email, string> {
    if (!email) {
      return err('Email is required');
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length > this.MAX_LENGTH) {
      return err(`Email must not exceed ${this.MAX_LENGTH} characters`);
    }

    if (!this.EMAIL_REGEX.test(trimmed)) {
      return err('Invalid email format');
    }

    return ok(new Email({ value: trimmed }));
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.value;
  }
}
