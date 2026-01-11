import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: '#173C7F',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
      }}
    >
      <svg viewBox="0 0 24 16" width="24" height="16" fill="none">
        <path
          d="M 0 8 Q 6 0, 12 8"
          stroke="#FDFBF7"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 8 8 Q 14 16, 20 8"
          stroke="#D4A84B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="10" cy="8" r="2" fill="#FDFBF7" />
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
