interface DecorativeSealProps {
  className?: string;
}

export function DecorativeSeal({ className = '' }: DecorativeSealProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer decorative ring */}
      <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

      {/* Inner circle with subtle gradient */}
      <circle cx="60" cy="60" r="46" fill="currentColor" opacity="0.08" />

      {/* Decorative laurel wreath - left side */}
      <path
        d="M28 60 C28 45, 35 32, 45 25 C40 35, 38 48, 40 60 C38 72, 40 85, 45 95 C35 88, 28 75, 28 60"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M32 55 C34 48, 38 42, 44 38"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M32 65 C34 72, 38 78, 44 82"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Decorative laurel wreath - right side */}
      <path
        d="M92 60 C92 45, 85 32, 75 25 C80 35, 82 48, 80 60 C82 72, 80 85, 75 95 C85 88, 92 75, 92 60"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M88 55 C86 48, 82 42, 76 38"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M88 65 C86 72, 82 78, 76 82"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Central heart symbol */}
      <path
        d="M60 75
           C60 75, 45 62, 45 52
           C45 45, 50 42, 55 42
           C58 42, 60 44, 60 47
           C60 44, 62 42, 65 42
           C70 42, 75 45, 75 52
           C75 62, 60 75, 60 75 Z"
        fill="currentColor"
        opacity="0.7"
      />

      {/* Small decorative dots */}
      <circle cx="60" cy="28" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="60" cy="92" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="36" cy="36" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="84" cy="36" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="36" cy="84" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="84" cy="84" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
