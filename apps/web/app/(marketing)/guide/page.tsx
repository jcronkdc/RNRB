'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Users, 
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FolderOpen,
  GitBranch,
  BarChart3,
  Radio,
  DollarSign,
  FileText,
  Mic2,
  Target,
  Zap,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type QuizQuestion = {
  id: string;
  question: string;
  description?: string;
  options: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tags: string[];
  }[];
};

type FeatureRecommendation = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  color: string;
  priority: number;
};

const quizQuestions: QuizQuestion[] = [
  {
    id: 'stage',
    question: 'Where are you in your music journey?',
    description: 'This helps us understand your current needs',
    options: [
      { 
        id: 'beginner', 
        label: 'Just starting out', 
        icon: Sparkles,
        tags: ['projects', 'learn', 'community']
      },
      { 
        id: 'developing', 
        label: 'Building my catalog', 
        icon: FolderOpen,
        tags: ['projects', 'assets', 'splits']
      },
      { 
        id: 'established', 
        label: 'Growing my audience', 
        icon: TrendingUp,
        tags: ['analytics', 'sessions', 'community', 'foundation']
      },
      { 
        id: 'professional', 
        label: 'Professional career', 
        icon: Target,
        tags: ['splits', 'licenses', 'analytics', 'foundation']
      }
    ]
  },
  {
    id: 'goals',
    question: "What's your biggest goal right now?",
    options: [
      { 
        id: 'organize', 
        label: 'Get organized', 
        icon: FolderOpen,
        tags: ['projects', 'assets']
      },
      { 
        id: 'collaborate', 
        label: 'Work with others', 
        icon: Users,
        tags: ['projects', 'splits', 'licenses', 'sessions']
      },
      { 
        id: 'grow', 
        label: 'Build my fanbase', 
        icon: Heart,
        tags: ['community', 'sessions', 'analytics', 'foundation']
      },
      { 
        id: 'monetize', 
        label: 'Make money from music', 
        icon: DollarSign,
        tags: ['splits', 'licenses', 'foundation']
      }
    ]
  },
  {
    id: 'challenges',
    question: "What's your biggest frustration?",
    options: [
      { 
        id: 'files', 
        label: 'Files everywhere, no organization', 
        icon: FolderOpen,
        tags: ['projects', 'assets']
      },
      { 
        id: 'money', 
        label: 'Unclear money splits with collaborators', 
        icon: GitBranch,
        tags: ['splits', 'licenses']
      },
      { 
        id: 'audience', 
        label: "Don't know who's listening", 
        icon: BarChart3,
        tags: ['analytics', 'community']
      },
      { 
        id: 'connection', 
        label: "Can't connect with fans", 
        icon: Heart,
        tags: ['sessions', 'community', 'foundation']
      }
    ]
  },
  {
    id: 'work',
    question: 'How do you usually work?',
    options: [
      { 
        id: 'solo', 
        label: 'Mostly solo', 
        icon: Music,
        tags: ['projects', 'assets', 'analytics']
      },
      { 
        id: 'collab', 
        label: 'Frequent collaborations', 
        icon: Users,
        tags: ['projects', 'splits', 'licenses', 'sessions']
      },
      { 
        id: 'band', 
        label: 'In a band/group', 
        icon: Mic2,
        tags: ['projects', 'splits', 'community', 'sessions']
      },
      { 
        id: 'producer', 
        label: 'Producer/engineer for others', 
        icon: Zap,
        tags: ['projects', 'assets', 'splits', 'licenses']
      }
    ]
  }
];

const featureDatabase: FeatureRecommendation[] = [
  {
    id: 'projects',
    title: 'Project Organization',
    description: 'Keep all your songs, files, and collaborators in one organized workspace.',
    icon: FolderOpen,
    link: '/projects',
    color: 'from-purple-600 to-pink-600',
    priority: 0
  },
  {
    id: 'splits',
    title: 'Split Sheets',
    description: 'Track revenue splits and royalties with your collaborators transparently.',
    icon: GitBranch,
    link: '/splits',
    color: 'from-green-600 to-emerald-600',
    priority: 0
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Understand your audience with detailed insights and growth metrics.',
    icon: BarChart3,
    link: '/analytics',
    color: 'from-blue-600 to-cyan-600',
    priority: 0
  },
  {
    id: 'assets',
    title: 'Asset Management',
    description: 'Store, organize, and access all your audio files, stems, and artwork.',
    icon: FileText,
    link: '/assets',
    color: 'from-orange-600 to-red-600',
    priority: 0
  },
  {
    id: 'sessions',
    title: 'Live Sessions',
    description: 'Host listening parties, jam sessions, and connect with fans in real-time.',
    icon: Radio,
    link: '/sessions',
    color: 'from-cyan-600 to-teal-600',
    priority: 0
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Build and engage your fanbase with integrated community tools.',
    icon: Users,
    link: '/community',
    color: 'from-pink-600 to-rose-600',
    priority: 0
  },
  {
    id: 'foundation',
    title: 'Crowdfunding',
    description: 'Get support from your fans with donations and crowdfunding campaigns.',
    icon: Heart,
    link: '/foundation',
    color: 'from-red-600 to-pink-600',
    priority: 0
  },
  {
    id: 'licenses',
    title: 'Licensing',
    description: 'Create and manage collaboration agreements and usage licenses.',
    icon: FileText,
    link: '/guide',
    color: 'from-indigo-600 to-purple-600',
    priority: 0
  }
];

export default function FeatureGuidePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers({ ...answers, [questionId]: answerId });
    
    if (currentStep < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 300);
    }
  };

  const getRecommendations = (): FeatureRecommendation[] => {
    const tagCounts: Record<string, number> = {};
    
    // Count tag occurrences from all answers
    Object.entries(answers).forEach(([questionId, answerId]) => {
      const question = quizQuestions.find(q => q.id === questionId);
      const option = question?.options.find(o => o.id === answerId);
      
      option?.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Calculate priority for each feature
    const featuresWithPriority = featureDatabase.map(feature => ({
      ...feature,
      priority: tagCounts[feature.id] || 0
    }));

    // Sort by priority and return top features
    return featuresWithPriority
      .sort((a, b) => b.priority - a.priority)
      .filter(f => f.priority > 0)
      .slice(0, 6);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = quizQuestions[currentStep];
  const selectedAnswer = answers[currentQuestion?.id];
  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/50 to-background">
      {/* Hero Section */}
      <section className="relative px-6 py-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6">
            <Lightbulb className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium text-brand-primary">Personalized Feature Guide</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Find Your Perfect Tools
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Answer a few quick questions and we'll recommend the CronkWaters features 
            that match your music journey.
          </p>
        </motion.div>

        {/* Progress Bar */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentStep + 1} of {quizQuestions.length}</span>
              <span>{Math.round(((currentStep + 1) / quizQuestions.length) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Quiz Content */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-surface/80 backdrop-blur rounded-3xl border border-border/50 p-8 md:p-12"
            >
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.description && (
                  <p className="text-muted-foreground">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleAnswer(currentQuestion.id, option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative p-6 rounded-2xl border-2 text-left transition-all
                        ${isSelected 
                          ? 'border-brand-primary bg-brand-primary/10' 
                          : 'border-border/50 hover:border-brand-primary/50 bg-surface/50'
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isSelected 
                            ? 'bg-brand-primary text-white' 
                            : 'bg-surface-muted text-muted-foreground'
                          }
                        `}>
                          <option.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{option.label}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goBack}
                  disabled={currentStep === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="text-sm text-muted-foreground">
                  Press an option to continue
                </div>
              </div>
            </motion.div>
          ) : (
            // Results
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Your Personalized Recommendations
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Based on your answers, here are the CronkWaters features that will help you most:
                </p>
              </div>

              {/* Recommendations */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {recommendations.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      href={feature.link}
                      className="block group h-full"
                    >
                      <div className="h-full rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6 hover:border-brand-primary/50 hover:shadow-xl transition-all">
                        {/* Priority Badge */}
                        {index === 0 && (
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-xs font-medium text-brand-primary mb-4">
                            <Target className="w-3 h-3" />
                            Best Match
                          </div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 group-hover:scale-110 transition-transform`}>
                            <div className="w-full h-full rounded-xl bg-surface/90 backdrop-blur flex items-center justify-center">
                              <feature.icon className="w-7 h-7 text-foreground" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-brand-primary transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-brand-primary">
                            Learn more
                          </span>
                          <ArrowRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* All Features Fallback */}
              {recommendations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    All CronkWaters features could be great for you!
                  </p>
                  <Link 
                    href="/#features"
                    className="inline-flex items-center gap-2 text-brand-primary font-medium hover:text-brand-secondary transition-colors"
                  >
                    Browse all features
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={resetQuiz}
                  className="px-8 py-4 border-2 border-border hover:border-brand-primary/50 rounded-2xl font-semibold transition-all"
                >
                  Retake Quiz
                </button>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-semibold hover:shadow-xl transition-all"
                >
                  Start Creating
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Why This Matters */}
      <section className="px-6 py-16 bg-surface/30 backdrop-blur border-y border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Why Personalized Recommendations Matter
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Every musician's journey is unique. Instead of overwhelming you with every feature, 
            we help you focus on the tools that solve <strong>your</strong> specific challenges right now.
          </p>
          <Link 
            href="/why"
            className="inline-flex items-center gap-2 text-brand-primary font-medium hover:text-brand-secondary transition-colors"
          >
            Learn about our philosophy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
