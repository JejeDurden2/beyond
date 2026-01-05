import {
  Keepsake as PrismaKeepsake,
  KeepsakeType as PrismaKeepsakeType,
} from '@prisma/client';
import { Keepsake, KeepsakeType } from '../../domain/entities/keepsake.entity';
import { EncryptedContent } from '../../domain/value-objects/encrypted-content.value-object';

export class KeepsakeMapper {
  private static readonly typeToDomain: Record<PrismaKeepsakeType, KeepsakeType> = {
    text: KeepsakeType.TEXT,
    letter: KeepsakeType.LETTER,
    photo: KeepsakeType.PHOTO,
    video: KeepsakeType.VIDEO,
    wish: KeepsakeType.WISH,
    scheduled_action: KeepsakeType.SCHEDULED_ACTION,
  };

  private static readonly typeToPersistence: Record<KeepsakeType, PrismaKeepsakeType> = {
    [KeepsakeType.TEXT]: 'text',
    [KeepsakeType.LETTER]: 'letter',
    [KeepsakeType.PHOTO]: 'photo',
    [KeepsakeType.VIDEO]: 'video',
    [KeepsakeType.WISH]: 'wish',
    [KeepsakeType.SCHEDULED_ACTION]: 'scheduled_action',
  };

  static toDomain(raw: PrismaKeepsake): Keepsake {
    const encryptedContent = EncryptedContent.fromPersistence(
      raw.encryptedContent,
      raw.contentIV,
    );

    return Keepsake.reconstitute({
      id: raw.id,
      vaultId: raw.vaultId,
      type: this.typeToDomain[raw.type],
      title: raw.title,
      encryptedContent,
      revealDelay: raw.revealDelay,
      revealDate: raw.revealDate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(keepsake: Keepsake): Omit<PrismaKeepsake, 'createdAt' | 'updatedAt'> {
    return {
      id: keepsake.id,
      vaultId: keepsake.vaultId,
      type: this.typeToPersistence[keepsake.type],
      title: keepsake.title,
      encryptedContent: keepsake.encryptedContent.encryptedData,
      contentIV: keepsake.encryptedContent.iv,
      revealDelay: keepsake.revealDelay,
      revealDate: keepsake.revealDate,
    };
  }
}
