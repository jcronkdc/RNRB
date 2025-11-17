import { LoadingState } from '@/components/LoadingState';

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-10 w-1/3 bg-muted/20 rounded-lg mb-4" />
        <div className="h-6 w-1/2 bg-muted/20 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-border/50 rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-6 w-2/3 bg-muted/20 rounded-lg" />
            <div className="h-4 w-full bg-muted/20 rounded-lg" />
            <div className="h-4 w-4/5 bg-muted/20 rounded-lg" />
            <div className="flex gap-2 mt-4">
              <div className="h-8 w-20 bg-muted/20 rounded-lg" />
              <div className="h-8 w-20 bg-muted/20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}