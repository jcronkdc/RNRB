"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Button,
  Progress,
} from "@cronkwaters/ui";
import { CheckCircle2, Clock, AlertCircle, FileText, Download, Send } from "lucide-react";
import { format } from "date-fns";

export function SplitDetailsDialog({ 
  children, 
  split 
}: { 
  children: React.ReactNode;
  split: any;
}) {
  const [open, setOpen] = useState(false);

  const handleExport = (format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting split as ${format}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{split.song.title}</DialogTitle>
              <DialogDescription>
                {split.song.project.name} • Created {format(new Date(split.song.createdAt), 'MMM dd, yyyy')}
              </DialogDescription>
            </div>
            <Badge
              variant={
                split.status === 'confirmed' 
                  ? 'success' 
                  : split.status === 'pending' 
                  ? 'warning' 
                  : 'secondary'
              }
            >
              {split.status === 'confirmed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {split.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {split.status === 'draft' && <AlertCircle className="w-3 h-3 mr-1" />}
              {split.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Progress Overview */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Ownership Distribution</span>
              <span className={split.totalPercentage === 100 ? 'text-green-600' : 'text-orange-600'}>
                {split.totalPercentage}% allocated
              </span>
            </div>
            <Progress 
              value={split.totalPercentage} 
              className={split.totalPercentage === 100 ? '' : 'bg-orange-100'}
            />
          </div>

          {/* Contributors List */}
          <div>
            <h3 className="font-medium mb-3">Contributors</h3>
            <div className="space-y-3">
              {split.splits.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {s.user.name ? s.user.name[0].toUpperCase() : s.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{s.user.name || s.user.email}</p>
                      <p className="text-sm text-muted-foreground">{s.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold">{s.percentage}%</span>
                    <div className="flex items-center gap-1">
                      {s.confirmed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600">Confirmed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-orange-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div>
            <h3 className="font-medium mb-3">Audit Trail</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Agreement Created</span>
                <span>{format(new Date(split.song.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              {split.splits.filter((s: any) => s.confirmed).map((s: any) => (
                <div key={s.id} className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{s.user.name || s.user.email} confirmed</span>
                  <span>{format(new Date(s.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            {split.status === 'pending' && (
              <Button variant="outline" className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
            )}
          </div>

          {/* Revenue Information */}
          {split.revenue > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-3">Revenue Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">${(split.revenue / 100).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t space-y-1">
                  {split.splits.map((s: any) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span>{s.user.name || s.user.email}</span>
                      <span>${((split.revenue * s.percentage / 100) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
