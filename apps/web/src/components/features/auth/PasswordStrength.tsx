'use client';

import { useTranslations } from 'next-intl';

interface PasswordStrengthProps {
  password: string;
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

function getStrength(password: string): {
  score: number;
  level: StrengthLevel | null;
  color: string;
} {
  if (!password) return { score: 0, level: null, color: 'bg-muted' };

  let score = 0;

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Normalize to 0-4 scale
  const normalizedScore = Math.min(Math.floor(score / 2), 4);

  const levels: (StrengthLevel | null)[] = [null, 'weak', 'fair', 'good', 'strong'];
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500'];

  return {
    score: normalizedScore,
    level: levels[normalizedScore],
    color: colors[normalizedScore],
  };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const t = useTranslations('auth.passwordStrength');
  const { score, level, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= score ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      {level && <p className="text-xs text-muted-foreground">{t(level)}</p>}
    </div>
  );
}
