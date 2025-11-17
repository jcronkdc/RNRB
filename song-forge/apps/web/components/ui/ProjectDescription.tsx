import { sanitizeHtml } from "../../lib/sanitization";

interface ProjectDescriptionProps {
  description: string | null | undefined;
  className?: string;
}

export function ProjectDescription({ description, className }: ProjectDescriptionProps) {
  if (!description) return null;

  // SECURITY: Sanitize HTML content before rendering
  const sanitizedContent = sanitizeHtml(description);

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
