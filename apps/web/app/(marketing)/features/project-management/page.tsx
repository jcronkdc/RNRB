'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FolderOpen, GitBranch, Calendar, Users, Tag, ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';

export default function ProjectManagementFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-6xl relative z-10 py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-green-500/10 border border-green-500/20">
              <FolderOpen className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Smart Project Management</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Organize Your Music Like a Pro
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Manage songs, albums, EPs, and collaborations all in one place. Version control, 
              metadata management, and team permissions built specifically for musicians.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2">
                  Start Organizing
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button className="rnrb-button-secondary px-8 py-4 rounded-xl text-lg font-semibold">
                  See Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="rnrb-container max-w-7xl py-20 px-4">
        <h2 className="text-4xl font-display font-bold text-center mb-12">
          Everything You Need to Stay Organized
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: FolderOpen,
              color: 'green-400',
              title: 'Project Hierarchy',
              description: 'Organize songs into albums, EPs, and singles. Nest projects within larger releases for clean structure.',
              features: ['Unlimited nesting', 'Drag-and-drop sorting', 'Custom folders']
            },
            {
              icon: GitBranch,
              color: 'blue-400',
              title: 'Version Control',
              description: 'Track every revision of your songs. Compare versions, restore old mixes, and never lose progress.',
              features: ['Automatic versioning', 'Side-by-side comparison', 'Rollback capability']
            },
            {
              icon: Tag,
              color: 'purple-400',
              title: 'Smart Metadata',
              description: 'Store credits, BPM, key, genre, and custom fields. Search and filter your catalog instantly.',
              features: ['Customizable fields', 'Batch editing', 'Advanced search']
            },
            {
              icon: Users,
              color: 'orange-400',
              title: 'Team Permissions',
              description: 'Control who can view, edit, or manage each project. Perfect for bands, labels, and studios.',
              features: ['Role-based access', 'Invite-only projects', 'Activity logging']
            },
            {
              icon: Calendar,
              color: 'pink-400',
              title: 'Timeline & Milestones',
              description: 'Track release dates, recording sessions, and deadlines. Visualize your music pipeline.',
              features: ['Gantt chart view', 'Reminder notifications', 'Status tracking']
            },
            {
              icon: FolderOpen,
              color: 'brand-primary',
              title: 'Cloud Storage',
              description: 'Upload audio, stems, artwork, and docs. Everything backed up and accessible from anywhere.',
              features: ['5GB - 1TB storage', 'File versioning', 'Quick previews']
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="p-6 rnrb-card h-full">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${feature.color.split('-')[0]}-500/10`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Workflow */}
        <div className="border-t border-border/50 pt-20">
          <h2 className="text-4xl font-display font-bold text-center mb-12">Your Workflow, Streamlined</h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: 1,
                title: 'Create Project',
                description: 'Start a new song, album, or EP. Set metadata, invite collaborators, and define roles.'
              },
              {
                step: 2,
                title: 'Upload & Organize',
                description: 'Add audio files, stems, lyrics, and artwork. Version control happens automatically.'
              },
              {
                step: 3,
                title: 'Collaborate',
                description: 'Team members see updates in real-time. Comments, tasks, and files sync instantly.'
              },
              {
                step: 4,
                title: 'Release & Archive',
                description: 'Mark projects as complete. Export metadata for distribution or archive for reference.'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-brand-primary/10 border-2 border-brand-primary/30">
                  <span className="text-3xl font-display font-bold text-brand-primary">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-6xl py-20 px-4">
          <h2 className="text-4xl font-display font-bold text-center mb-12">Built For</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                gradient: 'from-orange-500 to-red-500',
                title: 'Bands & Groups',
                description: 'Keep everyone on the same page. Share progress, assign tasks, and track album development from first demo to release.'
              },
              {
                icon: FolderOpen,
                gradient: 'from-green-500 to-emerald-500',
                title: 'Recording Studios',
                description: 'Manage client projects with professional tools. Track sessions, store files, and maintain clear records for billing.'
              },
              {
                icon: GitBranch,
                gradient: 'from-blue-500 to-cyan-500',
                title: 'Solo Artists',
                description: 'Stay organized even when it\'s just you. Track ideas, versions, and progress without spreadsheets or messy folders.'
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${useCase.gradient}`}>
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border/50">
        <div className="rnrb-container max-w-3xl py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-display font-bold mb-4">Get Organized Today</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Free plan includes 3 projects and 5GB storage. Upgrade for unlimited projects and more space.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2">
                Start Your First Project
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}




