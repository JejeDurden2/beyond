'use client';

import { useEffect } from 'react';
import type { KeepsakeType, KeepsakeMedia } from '@/types';
import { LetterVisualization } from './LetterVisualization';
import { WishVisualization } from './WishVisualization';
import { PhotoVisualization } from './PhotoVisualization';
import { DocumentVisualization } from './DocumentVisualization';

interface KeepsakeVisualizationProps {
  type: KeepsakeType;
  title: string;
  content: string;
  media?: KeepsakeMedia[];
  recipientName?: string;
  personalMessage?: string;
  onEdit?: () => void;
  onClose: () => void;
}

export function KeepsakeVisualization({
  type,
  title,
  content,
  media = [],
  recipientName,
  personalMessage,
  onEdit,
  onClose,
}: KeepsakeVisualizationProps): React.ReactElement | null {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  switch (type) {
    case 'document':
      return (
        <DocumentVisualization title={title} media={media} onEdit={onEdit} onClose={onClose} />
      );
    case 'letter':
      return (
        <LetterVisualization
          title={title}
          content={content}
          recipientName={recipientName}
          personalMessage={personalMessage}
          onEdit={onEdit}
          onClose={onClose}
        />
      );
    case 'wish':
      return (
        <WishVisualization
          title={title}
          content={content}
          recipientName={recipientName}
          personalMessage={personalMessage}
          onEdit={onEdit}
          onClose={onClose}
        />
      );
    case 'photo':
      return <PhotoVisualization title={title} media={media} onEdit={onEdit} onClose={onClose} />;
    default:
      // For non-visualizable keepsakes (video, scheduled_action), close
      onClose();
      return null;
  }
}

const VISUALIZABLE_TYPES: KeepsakeType[] = ['document', 'letter', 'wish', 'photo'];
const TEXT_BASED_TYPES: KeepsakeType[] = ['letter', 'wish'];
const MEDIA_BASED_TYPES: KeepsakeType[] = ['document', 'photo', 'video'];

export function useKeepsakeVisualization() {
  return {
    hasVisualization: (type: KeepsakeType) => VISUALIZABLE_TYPES.includes(type),
    isTextBased: (type: KeepsakeType) => TEXT_BASED_TYPES.includes(type),
    isMediaBased: (type: KeepsakeType) => MEDIA_BASED_TYPES.includes(type),
  };
}
