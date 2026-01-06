import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Beyond - Votre heritage numerique securise';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        background: '#FDFBF7',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Logo symbol */}
      <svg viewBox="0 0 80 60" width="120" height="90" fill="none" style={{ marginBottom: 40 }}>
        <g transform="translate(5, 10)">
          <path
            d="M 0 25 Q 20 0, 40 25"
            stroke="#1a365d"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 25 Q 45 50, 65 25"
            stroke="#D4A84B"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="32" cy="25" r="5" fill="#1a365d" />
        </g>
      </svg>

      {/* Brand name */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 400,
          color: '#1a365d',
          letterSpacing: '0.2em',
          marginBottom: 20,
        }}
      >
        BEYOND
      </div>

      {/* Gold underline */}
      <div
        style={{
          width: 300,
          height: 2,
          background: 'linear-gradient(90deg, #B8860B, #D4A84B)',
          marginBottom: 40,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: '#64748b',
        }}
      >
        Votre heritage, protege.
      </div>
    </div>,
    {
      ...size,
    },
  );
}
