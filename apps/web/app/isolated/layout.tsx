export default function IsolatedLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
