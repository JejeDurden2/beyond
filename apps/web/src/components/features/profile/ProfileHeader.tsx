'use client';

import { useRef, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Camera } from 'lucide-react';
import { getAvatarUploadUrl } from '@/lib/api/users';
import { useAuth } from '@/hooks/use-auth';

interface ProfileHeaderProps {
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
  onAvatarChange?: () => void;
}

export function ProfileHeader({
  firstName,
  lastName,
  email,
  avatarUrl,
  memberSince,
  onAvatarChange,
}: ProfileHeaderProps) {
  const t = useTranslations('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const fullName =
    firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || email;

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    return email[0].toUpperCase();
  };

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        const { uploadUrl } = await getAvatarUploadUrl(file.name, file.type);
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });
        await refreshUser();
        onAvatarChange?.();
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    [refreshUser, onAvatarChange],
  );

  const displayAvatar = previewUrl || avatarUrl;

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center text-2xl font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-70"
          >
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayAvatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials()}</span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-navy-deep border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-navy-deep rounded-full flex items-center justify-center text-white shadow-soft opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Camera className="w-4 h-4" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Info */}
        <div>
          <h2 className="text-xl font-medium text-foreground">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('memberSince', { date: memberSince })}
          </p>
        </div>
      </div>
    </div>
  );
}
