'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Mic, 
  Guitar, 
  Headphones, 
  Radio,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "What's your primary creative focus?",
    options: [
      { text: "Songwriting & Lyrics", value: "songwriter", icon: Music },
      { text: "Production & Mixing", value: "producer", icon: Radio },
      { text: "Performance & Live Shows", value: "performer", icon: Mic },
      { text: "Collaboration & Networking", value: "collaborator", icon: Users },
    ]
  },
  {
    id: 2,
    question: "What's your biggest challenge right now?",
    options: [
      { text: "Finding collaborators", value: "collaboration", icon: Users },
      { text: "Managing revenue splits", value: "revenue", icon: TrendingUp },
      { text: "Organizing my projects", value: "organization", icon: Music },
      { text: "Getting my music heard", value: "exposure", icon: Radio },
    ]
  },
  {
    id: 3,
    question: "What would help you most?",
    options: [
      { text: "AI-powered creative tools", value: "ai", icon: Zap },
      { text: "Fair royalty tracking", value: "royalties", icon: TrendingUp },
      { text: "Real-time collaboration", value: "collab", icon: Users },
      { text: "Direct fan connection", value: "fans", icon: Headphones },
    ]
  }
];

const results = {
  songwriter: {
    title: "The Wordsmith",
    description: "Your lyrics deserve a platform that understands the craft. CronkWaters gives you AI-powered lyric tools, collaboration spaces, and fair revenue tracking—all designed for songwriters.",
    features: ["AI Lyric Generation", "Collaboration Tools", "Revenue Splits", "Project Organization"],
    cta: "Start Writing"
  },
  producer: {
    title: "The Sound Architect",
    description: "Build your sonic empire with tools that scale. From stem management to AI mastering, CronkWaters empowers producers to create without limits.",
    features: ["Stem Management", "AI Mastering", "Version Control", "Asset Library"],
    cta: "Start Producing"
  },
  performer: {
    title: "The Stage Master",
    description: "Connect with your audience like never before. Live streaming, fan engagement, and direct monetization—all in one platform built for performers.",
    features: ["Live Streaming", "Fan Engagement", "Direct Payouts", "Performance Analytics"],
    cta: "Go Live"
  },
  collaborator: {
    title: "The Network Builder",
    description: "Your collaborative hub awaits. Find artists, manage projects, track contributions, and split revenue fairly—all transparently.",
    features: ["Artist Discovery", "Project Collaboration", "Fair Splits", "Team Management"],
    cta: "Start Collaborating"
  }
};

export function ArtistQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<keyof typeof results | null>(null);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Calculate result based on answers
      const answerValues = Object.values(newAnswers);
      const primaryFocus = answerValues[0] || 'collaborator';
      setResult(primaryFocus as keyof typeof results);
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setResult(null);
  };

  if (showResult && result) {
    const resultData = results[result];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-surface/80 to-background border border-border/50 backdrop-blur"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-3xl font-bold mb-2">{resultData.title}</h3>
          <p className="text-lg text-muted-foreground">{resultData.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {resultData.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-surface/50 border border-border/30"
            >
              <CheckCircle className="w-5 h-5 text-brand-primary flex-shrink-0" />
              <span className="text-sm font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link href="/auth">
            <Button size="lg" className="bg-gradient-to-r from-brand-primary to-brand-secondary">
              {resultData.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" onClick={resetQuiz}>
            Retake Quiz
          </Button>
        </div>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-brand-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {question.question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => {
              const Icon = option.icon || Music;
              const isSelected = answers[currentQuestion] === option.value;
              
              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-brand-primary bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 shadow-lg shadow-brand-primary/20' 
                      : 'border-border/50 bg-surface/50 hover:border-brand-primary/50 hover:bg-surface/80'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isSelected 
                        ? 'bg-gradient-to-br from-brand-primary to-brand-secondary' 
                        : 'bg-surface border border-border'
                      }
                    `}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold block ${isSelected ? 'text-brand-primary' : 'text-foreground'}`}>
                        {option.text}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

