'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  GitBranch,
  Calendar,
  Users,
  Tag,
  ChevronRight,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectManagementFeaturePage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-6xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2">
              <FolderOpen className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Smart Project Management</span>
            </div>

            <h1 className="font-display mb-6 text-5xl font-bold md:text-6xl">
              Organize Your Music Like a Pro
            </h1>
            <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              Manage songs, albums, EPs, and collaborations all in one place. Version control,
              metadata management, and team permissions built specifically for musicians.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                  Start Organizing
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button className="rnrb-button-secondary rounded-xl px-8 py-4 text-lg font-semibold">
                  See Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="rnrb-container max-w-7xl px-4 py-20">
        <h2 className="font-display mb-12 text-center text-4xl font-bold">
          Everything You Need to Stay Organized
        </h2>

        <div className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FolderOpen,
              color: 'green-400',
              title: 'Project Hierarchy',
              description:
                'Organize songs into albums, EPs, and singles. Nest projects within larger releases for clean structure.',
              features: ['Unlimited nesting', 'Drag-and-drop sorting', 'Custom folders'],
            },
            {
              icon: GitBranch,
              color: 'blue-400',
              title: 'Version Control',
              description:
                'Track every revision of your songs. Compare versions, restore old mixes, and never lose progress.',
              features: ['Automatic versioning', 'Side-by-side comparison', 'Rollback capability'],
            },
            {
              icon: Tag,
              color: 'purple-400',
              title: 'Smart Metadata',
              description:
                'Store credits, BPM, key, genre, and custom fields. Search and filter your catalog instantly.',
              features: ['Customizable fields', 'Batch editing', 'Advanced search'],
            },
            {
              icon: Users,
              color: 'orange-400',
              title: 'Team Permissions',
              description:
                'Control who can view, edit, or manage each project. Perfect for bands, labels, and studios.',
              features: ['Role-based access', 'Invite-only projects', 'Activity logging'],
            },
            {
              icon: Calendar,
              color: 'pink-400',
              title: 'Timeline & Milestones',
              description:
                'Track release dates, recording sessions, and deadlines. Visualize your music pipeline.',
              features: ['Gantt chart view', 'Reminder notifications', 'Status tracking'],
            },
            {
              icon: FolderOpen,
              color: 'brand-primary',
              title: 'Cloud Storage',
              description:
                'Upload audio, stems, artwork, and docs. Everything backed up and accessible from anywhere.',
              features: ['5GB - 1TB storage', 'File versioning', 'Quick previews'],
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="rnrb-card h-full p-6">
                <div
                  className={`bg- mb-4 flex h-12 w-12 items-center justify-center rounded-lg${feature.color.split('-')[0]}-500/10`}
                >
                  <feature.icon className={`text- h-6 w-6${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="text-brand-primary h-4 w-4 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Workflow */}
        <div className="border-border/50 border-t pt-20">
          <h2 className="font-display mb-12 text-center text-4xl font-bold">
            Your Workflow, Streamlined
          </h2>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
            {[
              {
                step: 1,
                title: 'Create Project',
                description:
                  'Start a new song, album, or EP. Set metadata, invite collaborators, and define roles.',
              },
              {
                step: 2,
                title: 'Upload & Organize',
                description:
                  'Add audio files, stems, lyrics, and artwork. Version control happens automatically.',
              },
              {
                step: 3,
                title: 'Collaborate',
                description:
                  'Team members see updates in real-time. Comments, tasks, and files sync instantly.',
              },
              {
                step: 4,
                title: 'Release & Archive',
                description:
                  'Mark projects as complete. Export metadata for distribution or archive for reference.',
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
                className="text-center"
              >
                <div className="border-brand-primary/30 bg-brand-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2">
                  <span className="font-display text-brand-primary text-3xl font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="border-border/50 bg-surface/30 border-t">
        <div className="rnrb-container max-w-6xl px-4 py-20">
          <h2 className="font-display mb-12 text-center text-4xl font-bold">Built For</h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                gradient: 'from-orange-500 to-red-500',
                title: 'Bands & Groups',
                description:
                  'Keep everyone on the same page. Share progress, assign tasks, and track album development from first demo to release.',
              },
              {
                icon: FolderOpen,
                gradient: 'from-green-500 to-emerald-500',
                title: 'Recording Studios',
                description:
                  'Manage client projects with professional tools. Track sessions, store files, and maintain clear records for billing.',
              },
              {
                icon: GitBranch,
                gradient: 'from-blue-500 to-cyan-500',
                title: 'Solo Artists',
                description:
                  "Stay organized even when it's just you. Track ideas, versions, and progress without spreadsheets or messy folders.",
              },
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="text-center"
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${useCase.gradient}`}
                >
                  <useCase.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-border/50 border-t">
        <div className="rnrb-container max-w-3xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display mb-4 text-4xl font-bold">Get Organized Today</h2>
            <p className="text-muted-foreground mb-8 text-xl">
              Free plan includes 3 projects and 5GB storage. Upgrade for unlimited projects and more
              space.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                Start Your First Project
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
