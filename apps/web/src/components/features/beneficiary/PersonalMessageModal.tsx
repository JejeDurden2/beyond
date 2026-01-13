'use client';

import { useTranslations } from 'next-intl';
import { X, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PersonalMessageModalProps {
  message: string;
  senderName: string;
  onClose: () => void;
  onContinue: () => void;
}

export function PersonalMessageModal({
  message,
  senderName,
  onClose,
  onContinue,
}: PersonalMessageModalProps) {
  const t = useTranslations('beneficiary.personalMessage');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t('close')}
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-2xl bg-warm-gray rounded-2xl shadow-2xl transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          boxShadow: `
            0 25px 50px -12px rgba(26, 54, 93, 0.25),
            0 0 0 1px rgba(184, 134, 11, 0.1)
          `,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-cream/80 text-navy-deep hover:bg-red-100 transition-colors z-10"
          aria-label={t('close')}
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Content */}
        <div className="p-6 md:p-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gold-heritage/10 flex items-center justify-center">
              <Heart className="w-7 h-7 md:w-8 md:h-8 text-gold-heritage" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-serif-brand text-display-sm md:text-display text-navy-deep text-center mb-2">
            {t('title')}
          </h2>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-slate text-center mb-8">
            {t('from', { senderName })}
          </p>

          {/* Message */}
          <div className="bg-cream rounded-xl p-6 md:p-8 mb-8 max-h-[50vh] overflow-y-auto">
            <div className="font-serif-brand text-base md:text-lg text-navy-deep/85 leading-relaxed whitespace-pre-wrap italic">
              {message.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Signature flourish */}
            <div className="mt-8 flex justify-end">
              <div className="text-right">
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-heritage/40 to-transparent mb-3" />
                <p className="text-sm text-slate italic">{senderName}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-warm-gray border border-navy-deep/10 text-navy-deep rounded-xl font-medium hover:bg-cream transition-colors"
            >
              {t('close')}
            </button>
            <button
              onClick={onContinue}
              className="flex-1 py-3 px-6 bg-gold-heritage text-cream rounded-xl font-medium hover:bg-gold-soft transition-colors"
            >
              {t('continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
