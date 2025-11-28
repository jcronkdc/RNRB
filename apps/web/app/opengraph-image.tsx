import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B0B0C 0%, #1e1e1e 100%)',
        position: 'relative',
      }}
    >
      {/* Accent gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 30% 50%, rgba(255, 99, 71, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Logo and branding */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          zIndex: 10,
        }}
      >
        {/* Main Title */}
        <h1
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '1000px',
            background: 'linear-gradient(to right, #ffffff 0%, #ff6347 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Rock N' Roll Basement
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: '32px',
            color: '#a0a0a0',
            margin: 0,
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          The All-In-One Platform for Modern Musicians
        </p>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '24px',
            fontSize: '20px',
            color: '#d0d0d0',
          }}
        >
          <span>🎵 AI Songwriting</span>
          <span>🎥 Video Collaboration</span>
          <span>🗺️ Tour Management</span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          fontSize: '18px',
          color: '#808080',
        }}
      >
        cronkwaters.com
      </div>
    </div>,
    {
      ...size,
    }
  );
}
