import { sanitizeText } from "../../lib/sanitization";

interface SongTitleProps {
  title: string | null | undefined;
  className?: string;
}

export function SongTitle({ title, className }: SongTitleProps) {
  if (!title) return null;

  // SECURITY: Sanitize text content before rendering
  const sanitizedTitle = sanitizeText(title);

  return <span className={className}>{sanitizedTitle}</span>;
}
