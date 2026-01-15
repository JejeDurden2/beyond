import { CheckCircle2 } from 'lucide-react';

interface LegalSectionProps {
  title: string;
  content?: string;
  items?: string[];
}

export function LegalSection({ title, content, items }: LegalSectionProps): React.ReactElement {
  return (
    <section className="pb-8 border-b border-border/30 last:border-b-0 last:pb-0">
      <h2 className="font-serif-brand text-xl md:text-2xl font-medium text-navy-deep mb-4">
        {title}
      </h2>

      {content && <p className="text-slate leading-relaxed">{content}</p>}

      {items && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gold-heritage flex-shrink-0 mt-0.5" />
              <span className="text-slate leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
