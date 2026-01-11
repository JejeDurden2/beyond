'use client';

import { useEffect } from 'react';
import type { KeepsakeType, KeepsakeMedia } from '@/types';
import { TextVisualization } from './TextVisualization';
import { LetterVisualization } from './LetterVisualization';
import { WishVisualization } from './WishVisualization';
import { PhotoVisualization } from './PhotoVisualization';

interface KeepsakeVisualizationProps {
  type: KeepsakeType;
  title: string;
  content: string;
  media?: KeepsakeMedia[];
  onEdit: () => void;
  onClose: () => void;
}

export function KeepsakeVisualization({
  type,
  title,
  content,
  media = [],
  onEdit,
  onClose,
}: KeepsakeVisualizationProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    case 'text':
      return (
        <TextVisualization title={title} content={content} onEdit={onEdit} onClose={onClose} />
      );
    case 'letter':
      return (
        <LetterVisualization title={title} content={content} onEdit={onEdit} onClose={onClose} />
      );
    case 'wish':
      return (
        <WishVisualization title={title} content={content} onEdit={onEdit} onClose={onClose} />
      );
    case 'photo':
      return <PhotoVisualization title={title} media={media} onEdit={onEdit} onClose={onClose} />;
    default:
      // For non-visualizable keepsakes (video, scheduled_action), go directly to edit
      onEdit();
      return null;
  }
}

// Hook to manage visualization state
export function useKeepsakeVisualization() {
  return {
    hasVisualization: (type: KeepsakeType) => ['text', 'letter', 'wish', 'photo'].includes(type),
    isTextBased: (type: KeepsakeType) => ['text', 'letter', 'wish'].includes(type),
    isMediaBased: (type: KeepsakeType) => ['photo', 'video'].includes(type),
  };
}
