import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: '#1a365d',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 36,
      }}
    >
      <svg viewBox="0 0 80 60" width="120" height="90" fill="none">
        <g transform="translate(5, 10)">
          <path
            d="M 0 25 Q 20 0, 40 25"
            stroke="#FDFBF7"
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
          <circle cx="32" cy="25" r="5" fill="#FDFBF7" />
        </g>
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
