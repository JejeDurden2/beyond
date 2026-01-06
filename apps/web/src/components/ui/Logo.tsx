import { cn } from '@/lib/utils';

export type LogoVariant = 'full' | 'symbol' | 'text';

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
}

export function Logo({ className, variant = 'full' }: LogoProps): React.ReactElement {
  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 80 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-10 w-auto', className)}
        aria-label="Beyond"
      >
        <defs>
          <linearGradient id="goldAccentSymbol" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#D4A84B" />
          </linearGradient>
        </defs>
        <g transform="translate(5, 10)">
          <path
            d="M 0 25 Q 20 0, 40 25"
            stroke="#1a365d"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 25 Q 45 50, 65 25"
            stroke="url(#goldAccentSymbol)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="32" cy="25" r="4" fill="#1a365d" />
        </g>
      </svg>
    );
  }

  if (variant === 'text') {
    return (
      <svg
        viewBox="0 0 260 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-8 w-auto', className)}
        aria-label="Beyond"
      >
        <defs>
          <linearGradient id="goldAccentText" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#D4A84B" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="35"
          fontFamily="Georgia, serif"
          fontSize="42"
          fontWeight="400"
          letterSpacing="8"
          fill="#1a365d"
        >
          BEYOND
        </text>
        <line x1="0" y1="45" x2="245" y2="45" stroke="url(#goldAccentText)" strokeWidth="1" />
      </svg>
    );
  }

  // Full variant (default)
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-12 w-auto', className)}
      aria-label="Beyond"
    >
      <defs>
        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#D4A84B" />
        </linearGradient>
      </defs>
      <g transform="translate(20, 35)">
        <path
          d="M 0 25 Q 20 0, 40 25"
          stroke="#1a365d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 25 25 Q 45 50, 65 25"
          stroke="url(#goldAccent)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="32" cy="25" r="4" fill="#1a365d" />
      </g>
      <text
        x="110"
        y="72"
        fontFamily="Georgia, serif"
        fontSize="42"
        fontWeight="400"
        letterSpacing="8"
        fill="#1a365d"
      >
        BEYOND
      </text>
      <line x1="110" y1="82" x2="355" y2="82" stroke="url(#goldAccent)" strokeWidth="1" />
    </svg>
  );
}
