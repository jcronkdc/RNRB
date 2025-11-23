'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { Music, Users, Check, X, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InviteAcceptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectSlug = params?.projectSlug as string;
  const inviteEmail = searchParams?.get('email');

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'error'>('pending');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleAccept = async () => {
    if (!user) {
      // Redirect to auth with return URL
      router.push(`/auth?redirect=/invites/${projectSlug}?email=${inviteEmail}`);
      return;
    }

    // Check if invite email matches user email
    if (inviteEmail && user.email !== inviteEmail) {
      setStatus('error');
      setMessage(
        `This invite was sent to ${inviteEmail}, but you're signed in as ${user.email}. Please sign in with the invited email.`
      );
      return;
    }

    setAccepting(true);

    try {
      // Find the project in user's accessible projects
      const allProjects = user.user_metadata?.projects || [];
      const projectExists = allProjects.find((p: any) => p.slug === projectSlug);

      if (projectExists) {
        // Already a member
        setStatus('accepted');
        setMessage("You're already a member of this project!");
        setTimeout(() => router.push(`/projects/${projectSlug}`), 2000);
        return;
      }

      // Create a placeholder project entry (in real implementation, would fetch from database)
      const newProject = {
        id: `proj_${Date.now()}`,
        slug: projectSlug,
        name: projectSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        description: 'Collaborative music project',
        visibility: 'private',
        role: 'member',
        joined_at: new Date().toISOString(),
        song_count: 0,
        collaborator_count: 1,
        session_count: 0,
      };

      const updatedProjects = [...allProjects, newProject];

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects,
        },
      });

      if (error) throw error;

      setStatus('accepted');
      setMessage('Successfully joined the project!');
      setTimeout(() => router.push(`/projects/${projectSlug}`), 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push('/projects');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="rnrb-card p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)' }}
            >
              <Music className="h-10 w-10 text-white" />
            </div>
            <h1 className="font-display mb-2 text-3xl font-bold">Project Invitation</h1>
            <p className="text-muted-foreground">
              You've been invited to collaborate on a music project
            </p>
          </div>

          {/* Project Info */}
          <div className="mb-6 rounded-xl border border-border bg-surface-muted p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-brand-primary" />
              {projectSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Join this project to collaborate with your team using:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Real-time chat powered by Ably
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                HD video collaboration with Daily.co
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Collaborative songwriting tools
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Audio file sharing & version control
              </li>
            </ul>
            {inviteEmail && (
              <div className="mt-4 rounded-lg border border-border bg-surface p-3">
                <p className="text-xs text-muted-foreground">
                  Invited: <span className="font-medium text-foreground">{inviteEmail}</span>
                </p>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {status === 'accepted' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4"
            >
              <p className="flex items-center gap-2 text-sm text-green-400">
                <Check className="h-5 w-5" />
                {message}
              </p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4"
            >
              <p className="flex items-center gap-2 text-sm text-red-400">
                <X className="h-5 w-5" />
                {message}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          {status === 'pending' && (
            <div className="flex gap-4">
              <Button
                onClick={handleDecline}
                variant="secondary"
                className="flex-1"
                disabled={accepting}
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                className="rnrb-button-primary flex-1"
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : user ? (
                  <>
                    Accept & Join
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Sign In to Accept'
                )}
              </Button>
            </div>
          )}

          {status === 'accepted' && (
            <Link href={`/projects/${projectSlug}`}>
              <Button className="rnrb-button-primary w-full">
                Go to Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Rock N' Roll Basement • Collaborative Music Creation
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
