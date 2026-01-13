'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FileText, Image, Mail, Heart, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface KeepsakeCardProps {
  id: string;
  type: 'letter' | 'photo' | 'document' | 'wish';
  title: string;
  senderName: string;
  deliveredAt: Date;
  hasPersonalMessage?: boolean;
}

const ICON_MAP = {
  letter: Mail,
  photo: Image,
  document: FileText,
  wish: Heart,
};

export function KeepsakeCard({
  id,
  type,
  title,
  senderName,
  deliveredAt,
  hasPersonalMessage = false,
}: KeepsakeCardProps) {
  const t = useTranslations('beneficiary.keepsakeCard');
  const locale = useLocale();
  const Icon = ICON_MAP[type];

  const dateLocale = locale === 'fr' ? fr : enUS;
  const formattedDate = format(deliveredAt, 'PPP', { locale: dateLocale });

  return (
    <Link href={`/portal/keepsakes/${id}`} className="block group">
      <div
        className="bg-warm-gray rounded-2xl p-4 md:p-6 transition-all duration-300 group-hover:shadow-soft group-hover:-translate-y-1"
        style={{
          boxShadow: '0 4px 6px -1px rgba(26, 54, 93, 0.05)',
        }}
      >
        {/* Icon and type */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gold-heritage/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-gold-heritage" />
          </div>

          {hasPersonalMessage && (
            <div className="flex items-center gap-1 text-xs text-navy-light bg-navy-deep/5 px-2 py-1 rounded-full">
              <Heart className="w-3 h-3" />
              <span className="hidden sm:inline">{t('hasPersonalMessage')}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif-brand text-lg md:text-xl text-navy-deep mb-2 line-clamp-2 group-hover:text-navy-light transition-colors">
          {title}
        </h3>

        {/* Metadata */}
        <div className="space-y-1 text-sm text-slate">
          <p className="flex items-center gap-2">
            <span className="text-gold-heritage">•</span>
            {t('from', { senderName })}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-slate/60" />
            {t('deliveredOn', { date: formattedDate })}
          </p>
        </div>

        {/* View CTA */}
        <div className="mt-4 pt-4 border-t border-navy-deep/5">
          <span className="text-sm text-navy-light group-hover:text-gold-heritage transition-colors font-medium">
            {t('view')} →
          </span>
        </div>
      </div>
    </Link>
  );
}
