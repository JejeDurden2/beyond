export type LegacyItemType = 'text' | 'letter' | 'photo' | 'video' | 'wish' | 'scheduled_action';

export interface LegacyItem {
  id: string;
  vaultId: string;
  type: LegacyItemType;
  title: string;
  encryptedContent: string;
  contentIV: string;
  revealDelay: number | null;
  revealDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLegacyItemRequest {
  type: LegacyItemType;
  title: string;
  encryptedContent: string;
  contentIV: string;
  revealDelay?: number;
  revealDate?: string;
  beneficiaryIds?: string[];
}

export interface UpdateLegacyItemRequest {
  title?: string;
  encryptedContent?: string;
  contentIV?: string;
  revealDelay?: number | null;
  revealDate?: string | null;
}
