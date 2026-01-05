import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';
import {
  KeepsakeRepository,
  KEEPSAKE_REPOSITORY,
} from '../../domain/repositories/keepsake.repository';
import { Keepsake, KeepsakeType } from '../../domain/entities/keepsake.entity';
import { createHash } from 'crypto';

export interface CreateKeepsakeInput {
  userId: string;
  type: KeepsakeType;
  title: string;
  content: string;
  revealDelay?: number;
  revealDate?: Date;
}

export interface CreateKeepsakeOutput {
  id: string;
  type: KeepsakeType;
  title: string;
  revealDelay: number | null;
  revealDate: Date | null;
  createdAt: Date;
}

@Injectable()
export class CreateKeepsakeCommand {
  constructor(
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: CreateKeepsakeInput): Promise<CreateKeepsakeOutput> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      throw new ForbiddenException('User does not have a vault');
    }

    const encryptionKey = this.deriveEncryptionKey(vault.encryptionSalt.value);

    const keepsakeResult = Keepsake.create({
      vaultId: vault.id,
      type: input.type,
      title: input.title,
      content: input.content,
      encryptionKey,
      revealDelay: input.revealDelay,
      revealDate: input.revealDate,
    });

    if (keepsakeResult.isErr()) {
      throw new BadRequestException(keepsakeResult.error);
    }

    const keepsake = keepsakeResult.value;
    await this.keepsakeRepository.save(keepsake);

    return {
      id: keepsake.id,
      type: keepsake.type,
      title: keepsake.title,
      revealDelay: keepsake.revealDelay,
      revealDate: keepsake.revealDate,
      createdAt: keepsake.createdAt,
    };
  }

  private deriveEncryptionKey(salt: string): Buffer {
    return createHash('sha256').update(salt).digest();
  }
}
