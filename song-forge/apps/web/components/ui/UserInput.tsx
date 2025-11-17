import { sanitizeUserInput } from "../../lib/sanitization";

interface UserInputDisplayProps {
  content: string | null | undefined;
  allowHtml?: boolean;
  className?: string;
}

export function UserInputDisplay({ content, allowHtml = false, className }: UserInputDisplayProps) {
  if (!content) return null;

  // SECURITY: Always sanitize user input before display
  const sanitizedContent = allowHtml ? sanitizeUserInput(content) : sanitizeUserInput(content);

  return <div className={className}>{sanitizedContent}</div>;
}
