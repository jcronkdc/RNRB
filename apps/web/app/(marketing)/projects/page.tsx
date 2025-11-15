'use client';

import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  GitBranch, 
  Users, 
  Cloud, 
  Lock, 
  Zap,
  Music,
  FileText,
  Share2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Track every change, revert to any version, never lose your work.'
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with your team, see changes instantly.'
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Access your projects from anywhere, automatic backups included.'
  },
  {
    icon: Lock,
    title: 'Secure Sharing',
    description: 'Control who sees what with granular permission settings.'
  }
];

const projectTypes = [
  {
    title: 'Albums',
    description: 'Organize full-length releases with artwork, metadata, and distribution.',
    icon: Music,
    color: 'from-purple-600 to-pink-600'
  },
  {
    title: 'Singles',
    description: 'Quick releases for individual tracks with all the professional tools.',
    icon: Zap,
    color: 'from-blue-600 to-cyan-600'
  },
  {
    title: 'Collaborations',
    description: 'Joint projects with split management and shared workspaces.',
    icon: Share2,
    color: 'from-green-600 to-emerald-600'
  },
  {
    title: 'Demos',
    description: 'Work-in-progress ideas with feedback tools and iteration tracking.',
    icon: FileText,
    color: 'from-orange-600 to-red-600'
  }
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface">
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20">
              <FolderOpen className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Creative Studio
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your musical canvas awaits. Create, collaborate, and craft your sonic masterpieces
            with professional tools designed for modern artists.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
            >
              Start Creating
            </Link>
            <Link
              href="/guide"
              className="px-8 py-4 border border-border hover:border-purple-600/50 rounded-2xl font-semibold transition-all"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-muted-foreground">
              Professional features that grow with your career
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-600/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="px-6 py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Create Any Type of Project
            </h2>
            <p className="text-xl text-muted-foreground">
              From singles to full albums, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {projectTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface to-background p-8 hover:shadow-2xl transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <type.icon className="w-12 h-12 text-foreground mb-4" />
                <h3 className="text-2xl font-bold mb-3">{type.title}</h3>
                <p className="text-muted-foreground mb-4">{type.description}</p>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-600/20"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of artists creating their best work on CronkWaters
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
