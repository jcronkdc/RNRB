import { cn } from '@cronkwaters/ui';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  subtitle,
  actions,
  className 
}: PageHeaderProps) {
  const displayDescription = description || subtitle;
  
  return (
    <div className={cn('mb-8 flex items-start justify-between', className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {displayDescription && (
          <p className="text-muted-foreground">{displayDescription}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
export default PageHeader;
