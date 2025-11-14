'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cronkwaters/ui'
import { Button } from '@cronkwaters/ui'
import { Progress } from '@cronkwaters/ui'
import { ChevronRight, CheckCircle, Circle, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface ChecklistItem {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
}

interface OnboardingChecklistProps {
  items: ChecklistItem[]
  onDismiss?: () => void
}

export function OnboardingChecklist({ items, onDismiss }: OnboardingChecklistProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  const completedCount = items.filter(item => item.completed).length
  const progressPercentage = (completedCount / items.length) * 100
  const allCompleted = completedCount === items.length

  useEffect(() => {
    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('onboarding-dismissed')
    if (dismissed === 'true' || allCompleted) {
      setIsDismissed(true)
    }
  }, [allCompleted])

  const handleDismiss = () => {
    localStorage.setItem('onboarding-dismissed', 'true')
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
      >
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${isMinimized ? '' : 'rotate-90'}`} 
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!isMinimized && (
              <CardDescription className="text-xs">
                Complete these steps to get the most out of CronkWaters
              </CardDescription>
            )}
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">{completedCount} of {items.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block group ${item.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="mt-0.5">
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className={`text-sm font-medium leading-none ${
                          item.completed ? 'line-through' : ''
                        }`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>

              {allCompleted ? (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    🎉 Congratulations! You're all set up!
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t">
                  <Link href="/welcome">
                    <Button size="sm" className="w-full">
                      View Full Checklist
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
