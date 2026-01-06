import {
  Keepsake as PrismaKeepsake,
  KeepsakeType as PrismaKeepsakeType,
  KeepsakeStatus as PrismaKeepsakeStatus,
  TriggerCondition as PrismaTriggerCondition,
  KeepsakeMedia as PrismaKeepsakeMedia,
  MediaType as PrismaMediaType,
} from '@prisma/client';
import {
  Keepsake,
  KeepsakeType,
  KeepsakeStatus,
  TriggerCondition,
} from '../../domain/entities/keepsake.entity';
import { KeepsakeMedia, MediaType } from '../../domain/entities/keepsake-media.entity';
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

  private static readonly statusToDomain: Record<PrismaKeepsakeStatus, KeepsakeStatus> = {
    draft: KeepsakeStatus.DRAFT,
    scheduled: KeepsakeStatus.SCHEDULED,
    delivered: KeepsakeStatus.DELIVERED,
  };

  private static readonly statusToPersistence: Record<KeepsakeStatus, PrismaKeepsakeStatus> = {
    [KeepsakeStatus.DRAFT]: 'draft',
    [KeepsakeStatus.SCHEDULED]: 'scheduled',
    [KeepsakeStatus.DELIVERED]: 'delivered',
  };

  private static readonly triggerToDomain: Record<PrismaTriggerCondition, TriggerCondition> = {
    on_death: TriggerCondition.ON_DEATH,
    on_date: TriggerCondition.ON_DATE,
    manual: TriggerCondition.MANUAL,
  };

  private static readonly triggerToPersistence: Record<TriggerCondition, PrismaTriggerCondition> = {
    [TriggerCondition.ON_DEATH]: 'on_death',
    [TriggerCondition.ON_DATE]: 'on_date',
    [TriggerCondition.MANUAL]: 'manual',
  };

  static toDomain(raw: PrismaKeepsake): Keepsake {
    const encryptedContent = EncryptedContent.fromPersistence(raw.encryptedContent, raw.contentIV);

    return Keepsake.reconstitute({
      id: raw.id,
      vaultId: raw.vaultId,
      type: this.typeToDomain[raw.type],
      title: raw.title,
      encryptedContent,
      status: this.statusToDomain[raw.status],
      triggerCondition: this.triggerToDomain[raw.triggerCondition],
      revealDelay: raw.revealDelay,
      revealDate: raw.revealDate,
      scheduledAt: raw.scheduledAt,
      deliveredAt: raw.deliveredAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
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
      status: this.statusToPersistence[keepsake.status],
      triggerCondition: this.triggerToPersistence[keepsake.triggerCondition],
      revealDelay: keepsake.revealDelay,
      revealDate: keepsake.revealDate,
      scheduledAt: keepsake.scheduledAt,
      deliveredAt: keepsake.deliveredAt,
      deletedAt: keepsake.deletedAt,
    };
  }
}

export class KeepsakeMediaMapper {
  private static readonly mediaTypeToDomain: Record<PrismaMediaType, MediaType> = {
    image: MediaType.IMAGE,
    video: MediaType.VIDEO,
    document: MediaType.DOCUMENT,
  };

  private static readonly mediaTypeToPersistence: Record<MediaType, PrismaMediaType> = {
    [MediaType.IMAGE]: 'image',
    [MediaType.VIDEO]: 'video',
    [MediaType.DOCUMENT]: 'document',
  };

  static toDomain(raw: PrismaKeepsakeMedia): KeepsakeMedia {
    return KeepsakeMedia.reconstitute({
      id: raw.id,
      keepsakeId: raw.keepsakeId,
      type: this.mediaTypeToDomain[raw.type],
      key: raw.key,
      filename: raw.filename,
      mimeType: raw.mimeType,
      size: raw.size,
      order: raw.order,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(media: KeepsakeMedia): Omit<PrismaKeepsakeMedia, 'createdAt'> {
    return {
      id: media.id,
      keepsakeId: media.keepsakeId,
      type: this.mediaTypeToPersistence[media.type],
      key: media.key,
      filename: media.filename,
      mimeType: media.mimeType,
      size: media.size,
      order: media.order,
    };
  }
}
