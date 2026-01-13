import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { randomBytes } from 'crypto';

export enum InvitationStatus {
  PENDING = 'PENDING',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface BeneficiaryInvitationProps {
  id?: string;
  beneficiaryId: string;
  keepsakeId: string;
  token: string;
  status: InvitationStatus;
  sentAt: Date;
  viewedAt?: Date | null;
  acceptedAt?: Date | null;
  expiresAt: Date;
  resentBy?: string | null;
  resentAt?: Date | null;
  resentCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateBeneficiaryInvitationInput {
  beneficiaryId: string;
  keepsakeId: string;
  expiresInDays?: number;
}

export class BeneficiaryInvitation extends AggregateRoot<BeneficiaryInvitationProps> {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly DEFAULT_EXPIRY_DAYS = 30;
  private static readonly MAX_RESEND_COUNT = 5;

  private constructor(props: BeneficiaryInvitationProps) {
    super(props);
  }

  static create(input: CreateBeneficiaryInvitationInput): Result<BeneficiaryInvitation, string> {
    if (!input.beneficiaryId) {
      return err('Beneficiary ID is required');
    }
    if (!input.keepsakeId) {
      return err('Keepsake ID is required');
    }

    const token = this.generateToken();
    const expiryDays = input.expiresInDays ?? this.DEFAULT_EXPIRY_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    return ok(
      new BeneficiaryInvitation({
        beneficiaryId: input.beneficiaryId,
        keepsakeId: input.keepsakeId,
        token,
        status: InvitationStatus.PENDING,
        sentAt: new Date(),
        viewedAt: null,
        acceptedAt: null,
        expiresAt,
        resentBy: null,
        resentAt: null,
        resentCount: 0,
      }),
    );
  }

  static reconstitute(props: BeneficiaryInvitationProps): BeneficiaryInvitation {
    return new BeneficiaryInvitation(props);
  }

  private static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('base64url');
  }

  markAsViewed(): Result<void, string> {
    if (this.props.status !== InvitationStatus.PENDING) {
      return err('Only pending invitations can be marked as viewed');
    }

    if (this.isExpired()) {
      this.props.status = InvitationStatus.EXPIRED;
      return err('Invitation has expired');
    }

    this.props.status = InvitationStatus.VIEWED;
    this.props.viewedAt = new Date();
    this._updatedAt = new Date();

    return ok(undefined);
  }

  accept(): Result<void, string> {
    if (this.props.status === InvitationStatus.ACCEPTED) {
      return err('Invitation has already been accepted');
    }

    if (this.props.status === InvitationStatus.CANCELLED) {
      return err('Invitation has been cancelled');
    }

    if (this.isExpired()) {
      this.props.status = InvitationStatus.EXPIRED;
      return err('Invitation has expired');
    }

    this.props.status = InvitationStatus.ACCEPTED;
    this.props.acceptedAt = new Date();
    this._updatedAt = new Date();

    return ok(undefined);
  }

  resend(resentBy: string): Result<void, string> {
    if (this.props.status === InvitationStatus.ACCEPTED) {
      return err('Cannot resend an accepted invitation');
    }

    if (this.props.status === InvitationStatus.CANCELLED) {
      return err('Cannot resend a cancelled invitation');
    }

    if (this.props.resentCount >= BeneficiaryInvitation.MAX_RESEND_COUNT) {
      return err(`Maximum resend limit of ${BeneficiaryInvitation.MAX_RESEND_COUNT} reached`);
    }

    // Generate new token for security
    this.props.token = BeneficiaryInvitation.generateToken();

    // Reset status to PENDING
    this.props.status = InvitationStatus.PENDING;
    this.props.viewedAt = null;

    // Extend expiry by 30 days from now
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + BeneficiaryInvitation.DEFAULT_EXPIRY_DAYS);
    this.props.expiresAt = newExpiresAt;

    // Track resend metadata
    this.props.resentBy = resentBy;
    this.props.resentAt = new Date();
    this.props.resentCount += 1;
    this._updatedAt = new Date();

    return ok(undefined);
  }

  cancel(): Result<void, string> {
    if (this.props.status === InvitationStatus.ACCEPTED) {
      return err('Cannot cancel an accepted invitation');
    }

    if (this.props.status === InvitationStatus.CANCELLED) {
      return err('Invitation is already cancelled');
    }

    this.props.status = InvitationStatus.CANCELLED;
    this._updatedAt = new Date();

    return ok(undefined);
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  canBeResent(): boolean {
    return (
      this.props.status !== InvitationStatus.ACCEPTED &&
      this.props.status !== InvitationStatus.CANCELLED &&
      this.props.resentCount < BeneficiaryInvitation.MAX_RESEND_COUNT
    );
  }

  get beneficiaryId(): string {
    return this.props.beneficiaryId;
  }

  get keepsakeId(): string {
    return this.props.keepsakeId;
  }

  get token(): string {
    return this.props.token;
  }

  get status(): InvitationStatus {
    return this.props.status;
  }

  get sentAt(): Date {
    return this.props.sentAt;
  }

  get viewedAt(): Date | null {
    return this.props.viewedAt ?? null;
  }

  get acceptedAt(): Date | null {
    return this.props.acceptedAt ?? null;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get resentBy(): string | null {
    return this.props.resentBy ?? null;
  }

  get resentAt(): Date | null {
    return this.props.resentAt ?? null;
  }

  get resentCount(): number {
    return this.props.resentCount;
  }

  get isPending(): boolean {
    return this.props.status === InvitationStatus.PENDING;
  }

  get isViewed(): boolean {
    return this.props.status === InvitationStatus.VIEWED;
  }

  get isAccepted(): boolean {
    return this.props.status === InvitationStatus.ACCEPTED;
  }

  get isCancelled(): boolean {
    return this.props.status === InvitationStatus.CANCELLED;
  }
}
