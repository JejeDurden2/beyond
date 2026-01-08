'use client';

import { useState, useCallback } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface ProfileFieldProps {
  label: string;
  value: string;
  masked?: boolean;
  onEdit?: (value: string) => Promise<void>;
  actionLabel?: string;
  onAction?: () => void;
}

export function ProfileField({
  label,
  value,
  masked = false,
  onEdit,
  actionLabel,
  onAction,
}: ProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!onEdit) return;
    setIsSaving(true);
    try {
      await onEdit(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editValue, onEdit]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const displayValue = masked ? '••••••••••••' : value;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 last:border-b-0">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-1 rounded-lg border border-border bg-background text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 rounded-lg bg-gold-heritage text-white hover:bg-gold-heritage/90 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-foreground mt-1">{displayValue || '—'}</p>
        )}
      </div>

      {!isEditing && (
        <div>
          {onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 text-sm text-navy-deep hover:text-navy-deep/80 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
