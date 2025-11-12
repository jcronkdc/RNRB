export const runtime = 'edge';
export const size = { width: 1200, height: 630 };

// Mock projects (should match page)
const MOCK_PROJECTS: Record<string, { name: string; tagline: string; credits: Array<{ name: string }> }> = {
  aurora: {
    name: 'Aurora Lines',
    tagline: 'A shimmering electro-pop journey inspired by arctic light.',
    credits: [
      { name: 'CronkWater Collective' },
      { name: 'Mae Rivera' },
      { name: 'Atlas Mastering' }
    ]
  },
  midnight: {
    name: 'Midnight Demo Sessions',
    tagline: 'Late-night sketches, raw vocals, and ambient experiments.',
    credits: [
      { name: 'Nocturne' },
      { name: 'Celia Harper' }
    ]
  },
  publicreel: {
    name: 'Public Reel 2025',
    tagline: 'A curated sampler of live takes and collaborations.',
    credits: [
      { name: 'CronkWater House Band' },
      { name: 'Open Scores Initiative' }
    ]
  }
};

function textClip(txt: string, max: number) {
  return txt.length > max ? txt.slice(0, max - 1) + '…' : txt;
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = MOCK_PROJECTS[slug as keyof typeof MOCK_PROJECTS];

  // Warm theme gradient
  const GRADIENT = 'linear-gradient(120deg, hsl(16,92%,54%) 0%, hsl(32,60%,96%) 100%)';
  // Fallback gradient
  const DEFAULT_GRAD = 'linear-gradient(120deg, #6245b7 0%, #ece9f7 100%)';

  const title = project?.name || 'Project';
  const tagline = project?.tagline || 'A Song Forge release.';
  let credits = 'Song Forge';
  if (project?.credits) {
    credits = project.credits.slice(0, 2).map((c) => c.name).join(' • ');
    if (project.credits.length > 2) credits += ` +${project.credits.length - 2} more`;
  }
  const { ImageResponse } = await import('next/server');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (ImageResponse as any)(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: project ? GRADIENT : DEFAULT_GRAD,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '64px',
          fontFamily: 'system-ui, Arial, sans-serif',
          color: '#22140c',
        }}
      >
        <div style={{
          fontWeight: 650,
          fontSize: 61,
          lineHeight: '1.14',
          marginBottom: 16,
          maxWidth: 940,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>{textClip(title, 40)}</div>
        <div style={{
          fontWeight: 400,
          fontSize: 34,
          marginBottom: 22,
          color: 'rgba(34,20,12,.82)',
          maxWidth: 860,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>{textClip(tagline, 60)}</div>
        <div style={{
          fontWeight: 500,
          fontSize: 21,
          color: '#7a450d',
          padding: '5px 18px',
          background: 'rgba(255, 246, 231, 0.7)',
          borderRadius: 13,
          marginBottom: 40,
        }}>{credits}</div>
        <div style={{ position: 'absolute', right: 54, bottom: 40, fontSize: 24, color: '#48290b', letterSpacing: '.16em', opacity: 0.7 }}>
          Song Forge
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
