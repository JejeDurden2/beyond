import { DomainEvent } from '@/shared/domain/domain-event.base';

export class DeathDeclaredEvent extends DomainEvent {
  private constructor(
    public readonly vaultId: string,
    public readonly trustedContactId: string,
  ) {
    super(vaultId);
  }

  static create(vaultId: string, trustedContactId: string): DeathDeclaredEvent {
    return new DeathDeclaredEvent(vaultId, trustedContactId);
  }
}
