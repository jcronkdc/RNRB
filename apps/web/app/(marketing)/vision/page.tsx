'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Music, 
  Heart, 
  Users, 
  Sparkles, 
  Globe,
  Target,
  Gift,
  Building,
  Star,
  HandHeart,
  GraduationCap,
  Zap
} from 'lucide-react';

const milestones = [
  {
    year: "2003",
    event: "The Beginning",
    description: "Josh and Justin meet, forming a friendship that would span over 20 years"
  },
  {
    year: "2020s",
    event: "Grand Ole Opry",
    description: "Josh joins the Grand Ole Opry stage with Chris Janson"
  },
  {
    year: "Today",
    event: "Today Show & Beyond",
    description: "Josh performs on national television while continuing to tour"
  },
  {
    year: "2024",
    event: "The CronkWaters Project is Born",
    description: "A vision to democratize music creation becomes reality"
  }
];

const missionPoints = [
  {
    icon: Users,
    title: "Supporting Independent Musicians",
    description: "Providing the tools and community that independent artists need to thrive"
  },
  {
    icon: Gift,
    title: "Free & Low-Cost Creative Tools",
    description: "Breaking down barriers with accessible collaboration platforms"
  },
  {
    icon: GraduationCap,
    title: "Arts Education",
    description: "Promoting music education and creative development for all ages"
  },
  {
    icon: HandHeart,
    title: "Grants for Emerging Artists",
    description: "Financial support for the next generation of musical talent"
  }
];

// eslint-disable-next-line import/no-default-export
export default function VisionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/50 to-background">
      {/* Hero Section */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            The Vision Behind The CronkWaters Project
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Two friends. One mission. Endless possibilities for independent musicians.
          </p>
        </motion.div>

        {/* Founders Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-12 mb-24"
        >
          {/* Josh Waters */}
          <div className="rounded-3xl border border-border/50 bg-surface/80 backdrop-blur p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Music className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Josh Waters</h2>
                <p className="text-muted-foreground">Musician & Mentor</p>
              </div>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A road warrior who&apos;s graced the Grand Ole Opry stage with Chris Janson and performed on 
                the Today Show, Josh brings decades of professional music experience to The CronkWaters Project.
              </p>
              <p>
                Beyond the spotlight, Josh dedicates himself to helping musicians realize their dreams 
                through songwriting, production, and engineering mentorship. His journey from local 
                stages to national television embodies the spirit of what The CronkWaters Project stands for.
              </p>
              <div className="flex items-center gap-2 text-brand-primary">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Grand Ole Opry Member</span>
              </div>
            </div>
          </div>

          {/* Justin Cronk */}
          <div className="rounded-3xl border border-border/50 bg-surface/80 backdrop-blur p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Justin Cronk</h2>
                <p className="text-muted-foreground">Songwriter & Visionary</p>
              </div>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                With a lifelong passion for songwriting, Justin brings the creative soul to The CronkWaters Project. 
                Though his instruments may &ldquo;collect more dust than fingerprints&rdquo; these days, his 
                love for music and vision for supporting artists burns brighter than ever.
              </p>
              <p>
                Justin&apos;s dream is to create a platform where every musician, regardless of their 
                background or resources, can access the tools and community they need to share their 
                voice with the world.
              </p>
              <div className="flex items-center gap-2 text-brand-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Platform Visionary</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-brand-primary to-brand-secondary" />
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className="flex-1" />
                  <div className="w-4 h-4 bg-brand-primary rounded-full z-10" />
                  <div className="flex-1 px-8">
                    <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6">
                      <div className="text-brand-primary font-bold mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold mb-2">{milestone.event}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We&apos;re in the process of applying for 501(c) nonprofit designation to formalize our 
              commitment to supporting the music community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {missionPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6"
              >
                <point.icon className="w-12 h-12 text-brand-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                <p className="text-muted-foreground">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-24 rounded-3xl border border-border/50 bg-gradient-to-br from-surface/80 to-surface/60 backdrop-blur p-12"
        >
          <div className="text-center mb-8">
            <Building className="w-16 h-16 text-brand-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Sustainable Impact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every dollar we receive through donations, subscriptions, grants, and sponsorships 
              goes directly toward our mission of democratizing music creation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Target className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Platform Development</h3>
              <p className="text-sm text-muted-foreground">
                Continuously improving tools for creators
              </p>
            </div>
            <div>
              <Gift className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Artist Grants</h3>
              <p className="text-sm text-muted-foreground">
                Direct support for emerging musicians
              </p>
            </div>
            <div>
              <Globe className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community Programs</h3>
              <p className="text-sm text-muted-foreground">
                Workshops, mentorship, and education
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Join Our Vision</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you&apos;re an artist, a supporter, or someone who believes in the power of music, 
            there&apos;s a place for you in The CronkWaters Project community.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-semibold hover:shadow-xl transition-all"
            >
              Start Creating
            </Link>
            <Link 
              href="/membership"
              className="px-8 py-4 border-2 border-brand-primary text-brand-primary rounded-2xl font-semibold hover:bg-brand-primary/10 transition-all"
            >
              View Membership Options
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

