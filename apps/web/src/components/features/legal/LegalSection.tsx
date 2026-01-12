interface LegalSectionProps {
  title: string;
  content?: string;
  items?: string[];
}

export function LegalSection({ title, content, items }: LegalSectionProps): React.ReactElement {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-serif-brand text-xl font-medium text-navy-deep">{title}</h2>

      {content && <p className="leading-relaxed text-slate">{content}</p>}

      {items && (
        <ul className="space-y-2 pl-6 text-slate">
          {items.map((item) => (
            <li key={item} className="list-disc leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
