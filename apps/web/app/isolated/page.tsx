export default function IsolatedPage() {
  return (
    <div>
      <h1>Isolated Test Page</h1>
      <p>This page bypasses all providers and components</p>
      <hr />
      <p>Time: {new Date().toISOString()}</p>
      <p>If you see this, the issue is with the root layout components</p>
    </div>
  );
}
