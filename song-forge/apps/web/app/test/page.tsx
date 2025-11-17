export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>CronkWaters Test Page</h1>
      <p>If you can see this, Next.js routing is working!</p>
      <p>Environment: production</p>
      <p>Build Time: {new Date().toISOString()}</p>
      <hr />
      <p>
        <a href="/api/health" style={{ color: 'blue', textDecoration: 'underline' }}>
          Check API Health Status →
        </a>
      </p>
    </div>
  );
}
