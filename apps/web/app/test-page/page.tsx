export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>CronkWaters Test Page</h1>
      <p>If you can see this, the Next.js app is working!</p>
      <hr />
      <h2>Debug Info:</h2>
      <ul>
        <li>NODE_ENV: {process.env.NODE_ENV}</li>
        <li>Deployment URL: {process.env.VERCEL_URL || 'Not on Vercel'}</li>
        <li>Time: {new Date().toISOString()}</li>
      </ul>
    </div>
  );
}
