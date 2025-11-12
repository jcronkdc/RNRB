export default function SimpleTest() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, Next.js routing is working!</p>
      <hr />
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
