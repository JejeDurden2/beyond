'use client';

import { useTranslations } from 'next-intl';
import { Heart, Calendar, Send } from 'lucide-react';
import type { TriggerCondition } from '@/types';

interface DeliveryConfigProps {
  triggerCondition: TriggerCondition;
  scheduledAt: string | null;
  onChange: (trigger: TriggerCondition, date: string | null) => void;
  disabled?: boolean;
}

interface TriggerOptionProps {
  value: TriggerCondition;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

function TriggerOption({
  value,
  selected,
  onSelect,
  icon,
  label,
  description,
  disabled,
  children,
}: TriggerOptionProps): React.ReactElement {
  return (
    <label
      className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
        selected
          ? 'border-gold-heritage bg-gold-heritage/5'
          : 'border-border hover:border-border/80 hover:bg-muted/30'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <input
        type="radio"
        name="triggerCondition"
        value={value}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex flex-1 items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
            selected ? 'bg-gold-heritage/10 text-gold-heritage' : 'bg-muted text-muted-foreground'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{label}</span>
            {selected && (
              <span className="h-2 w-2 rounded-full bg-gold-heritage" aria-hidden="true" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          {children && selected && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </label>
  );
}

export function DeliveryConfig({
  triggerCondition,
  scheduledAt,
  onChange,
  disabled = false,
}: DeliveryConfigProps): React.ReactElement {
  const t = useTranslations('keepsakes.delivery');

  const handleTriggerChange = (trigger: TriggerCondition): void => {
    if (trigger === 'on_date') {
      // Keep existing date or set to null
      onChange(trigger, scheduledAt);
    } else {
      onChange(trigger, null);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange('on_date', e.target.value || null);
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{t('title')}</h3>

      <div className="space-y-2">
        <TriggerOption
          value="on_death"
          selected={triggerCondition === 'on_death'}
          onSelect={() => handleTriggerChange('on_death')}
          icon={<Heart className="h-5 w-5" />}
          label={t('onDeath')}
          description={t('onDeathHelp')}
          disabled={disabled}
        />

        <TriggerOption
          value="on_date"
          selected={triggerCondition === 'on_date'}
          onSelect={() => handleTriggerChange('on_date')}
          icon={<Calendar className="h-5 w-5" />}
          label={t('onDate')}
          description={t('onDateHelp')}
          disabled={disabled}
        >
          <input
            type="date"
            value={scheduledAt || ''}
            onChange={handleDateChange}
            min={minDate}
            disabled={disabled}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold-heritage focus:outline-none focus:ring-2 focus:ring-gold-heritage/20"
          />
        </TriggerOption>

        <TriggerOption
          value="manual"
          selected={triggerCondition === 'manual'}
          onSelect={() => handleTriggerChange('manual')}
          icon={<Send className="h-5 w-5" />}
          label={t('manual')}
          description={t('manualHelp')}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
