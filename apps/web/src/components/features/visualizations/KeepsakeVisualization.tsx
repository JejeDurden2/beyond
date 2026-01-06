'use client';

import { useEffect } from 'react';
import type { KeepsakeType } from '@/types';
import { TextVisualization } from './TextVisualization';
import { LetterVisualization } from './LetterVisualization';
import { WishVisualization } from './WishVisualization';

interface KeepsakeVisualizationProps {
  type: KeepsakeType;
  title: string;
  content: string;
  onEdit: () => void;
  onClose: () => void;
}

export function KeepsakeVisualization({
  type,
  title,
  content,
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

  // Only text-based keepsakes have visualization
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
    default:
      // For non-text keepsakes (photo, video, scheduled_action), go directly to edit
      onEdit();
      return null;
  }
}

// Hook to manage visualization state
export function useKeepsakeVisualization() {
  // This hook can be extended for more complex state management if needed
  return {
    isTextBased: (type: KeepsakeType) => ['text', 'letter', 'wish'].includes(type),
  };
}
