'use client';

import { motion } from 'framer-motion';
import { 
  Coins, 
  PieChart, 
  Shield, 
  Calculator,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Calculator,
    title: 'Automatic Calculations',
    description: 'Set percentages once, calculations happen automatically forever.'
  },
  {
    icon: Shield,
    title: 'Legally Binding',
    description: 'Professional split sheets that hold up to industry standards.'
  },
  {
    icon: Users,
    title: 'Easy Collaboration',
    description: 'Invite collaborators, get signatures, manage everything in one place.'
  },
  {
    icon: TrendingUp,
    title: 'Real-time Tracking',
    description: 'See earnings update in real-time as your music generates revenue.'
  }
];

const splitTypes = [
  {
    title: 'Writer Splits',
    description: 'Divide songwriting credits fairly among all contributors.',
    percentage: '50/25/25',
    icon: FileText
  },
  {
    title: 'Producer Points',
    description: 'Allocate production royalties with transparent agreements.',
    percentage: '3-5%',
    icon: PieChart
  },
  {
    title: 'Feature Splits',
    description: 'Define guest artist shares with clear terms.',
    percentage: 'Custom',
    icon: Users
  },
  {
    title: 'Label Shares',
    description: 'Manage label and distribution partner percentages.',
    percentage: 'Negotiable',
    icon: DollarSign
  }
];

export default function SplitsPage() {
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-green-600/20">
              <Coins className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Revenue Symphony
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Orchestrate your earnings with transparent split management and royalty tracking.
            Never miss a payment or dispute a percentage again.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
            >
              Start Managing Splits
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 border border-border hover:border-emerald-600/50 rounded-2xl font-semibold transition-all"
            >
              See Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
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
              Fair Splits Made Simple
            </h2>
            <p className="text-xl text-muted-foreground">
              Professional tools that protect everyone's interests
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
                className="p-6 rounded-2xl bg-surface border border-border hover:border-emerald-600/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-emerald-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Types */}
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
              Every Type of Split Covered
            </h2>
            <p className="text-xl text-muted-foreground">
              From simple 50/50 to complex multi-party agreements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {splitTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-gradient-to-br from-surface to-background hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <type.icon className="w-10 h-10 text-emerald-600" />
                  <span className="text-2xl font-bold text-emerald-600">{type.percentage}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                <p className="text-muted-foreground">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Tracking */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Track Every Penny
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Connect your PROs, distributors, and streaming platforms.
                See exactly where your money comes from and where it goes.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Automated payment distribution</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Real-time revenue analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Detailed earning statements</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-600/10 to-green-600/10 flex items-center justify-center">
                <DollarSign className="w-32 h-32 text-emerald-600/20" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-emerald-600/10 to-green-600/10 border border-emerald-600/20"
        >
          <h2 className="text-4xl font-bold mb-4">
            Stop Leaving Money on the Table
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get everyone paid fairly and on time, every time
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
          >
            Create Your First Split
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
