'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Users,
  Trash2,
} from '@/components/ui/custom-icons';
import { useEffect, useState } from 'react';

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  assignedTo: string[];
  dependencies: string[];
  blockingIssue: string | null;
  blockedSince: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
};

type MilestoneTimelineProps = {
  projectSlug: string;
  onMilestoneClick?: (milestoneId: string) => void;
};

export function MilestoneTimeline({ projectSlug, onMilestoneClick }: MilestoneTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMilestones();
  }, [projectSlug]);

  const loadMilestones = async () => {
    try {
      const response = await fetch(`/api/projects/${projectSlug}/milestones`);
      if (!response.ok) throw new Error('Failed to load milestones');
      const data = await response.json();
      setMilestones(data.milestones || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async () => {
    const title = prompt('Milestone title:');
    if (!title) return;

    const dueDateStr = prompt('Due date (YYYY-MM-DD):');
    if (!dueDateStr) return;

    const description = prompt('Description (optional):') || undefined;
    const priorityStr = prompt('Priority (low/medium/high/critical):') || 'medium';

    try {
      const response = await fetch(`/api/projects/${projectSlug}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dueDate: dueDateStr,
          description,
          priority: priorityStr,
        }),
      });

      if (!response.ok) throw new Error('Failed to create milestone');

      await loadMilestones();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>) => {
    try {
      const response = await fetch(`/api/projects/${projectSlug}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update milestone');

      await loadMilestones();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/projects/${projectSlug}/milestones/${milestoneId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete milestone');

      await loadMilestones();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 animate-pulse text-blue-500" />;
      case 'blocked':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/5';
      case 'in_progress':
        return 'border-blue-500 bg-blue-500/5';
      case 'blocked':
        return 'border-red-500 bg-red-500/5';
      default:
        return 'border-gray-800';
    }
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isOverdue = (dueDate: string, status: Milestone['status']) => {
    if (status === 'completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading timeline...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">Error: {error}</div>
      </Card>
    );
  }

  // Group milestones by status
  const grouped = {
    not_started: milestones.filter((m) => m.status === 'not_started'),
    in_progress: milestones.filter((m) => m.status === 'in_progress'),
    blocked: milestones.filter((m) => m.status === 'blocked'),
    completed: milestones.filter((m) => m.status === 'completed'),
  };

  const completionRate =
    milestones.length > 0 ? Math.round((grouped.completed.length / milestones.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-brand-primary" />
          <div>
            <h2 className="text-xl font-semibold">Project Roadmap</h2>
            <p className="text-sm text-muted-foreground">
              {completionRate}% complete • {grouped.in_progress.length} in progress
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreateMilestone}
          className="rnrb-button-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {/* Progress Bar */}
      {milestones.length > 0 && (
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{completionRate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-brand-primary"
            />
          </div>
        </Card>
      )}

      {/* Milestones */}
      {milestones.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="mb-2 text-muted-foreground">No milestones yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Create milestones to track your project's progress and deadlines
          </p>
          <Button onClick={handleCreateMilestone} className="rnrb-button-primary">
            <Plus className="mr-2 h-4 w-4" />
            Create First Milestone
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer p-4 transition-all hover:shadow-lg ${getStatusColor(milestone.status)}`}
                onClick={() => onMilestoneClick?.(milestone.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Status & Info */}
                  <div className="flex items-start gap-3">
                    {getStatusIcon(milestone.status)}

                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <div
                          className={`h-2 w-2 rounded-full ${getPriorityColor(milestone.priority)}`}
                        />
                      </div>

                      {milestone.description && (
                        <p className="mb-2 text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(milestone.dueDate).toLocaleDateString()}
                          {isOverdue(milestone.dueDate, milestone.status) && (
                            <span className="ml-1 text-red-500">(Overdue)</span>
                          )}
                          {isDueSoon(milestone.dueDate) && (
                            <span className="ml-1 text-orange-500">(Due soon)</span>
                          )}
                        </span>

                        {milestone.assignedTo.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {milestone.assignedTo.length} assigned
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {milestone.status === 'in_progress' && (
                        <div className="mt-2">
                          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {milestone.progress}% complete
                          </span>
                        </div>
                      )}

                      {/* Blocking Issue */}
                      {milestone.blockingIssue && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                          <p className="text-xs text-red-500">{milestone.blockingIssue}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {milestone.status !== 'completed' && (
                      <select
                        value={milestone.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateMilestone(milestone.id, {
                            status: e.target.value as Milestone['status'],
                          });
                        }}
                        className="rounded border border-border bg-surface px-2 py-1 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(milestone.id);
                      }}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
