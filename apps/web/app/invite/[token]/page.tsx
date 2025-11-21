import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { redirect } from 'next/navigation';
import { Button } from '@cronkwaters/ui';
import { Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    // Redirect to sign in with return URL
    redirect(`/auth?callbackUrl=/invite/${token}`);
  }

  // Find invitation
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      org: true,
      project: {
        include: {
          org: true,
        },
      },
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/20">
              <XCircle className="h-8 w-8 text-danger" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Invitation Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invitation link is invalid or has been removed.
          </p>
          <Button href="/dashboard" className="mt-6">
            Go to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  // Check if expired
  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'expired' },
    });

    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/20">
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Invitation Expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invitation has expired. Please request a new invitation from the organization.
          </p>
          <Button href="/dashboard" className="mt-6">
            Go to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  // Check if already accepted
  if (invitation.status === 'accepted') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Already Accepted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You've already accepted this invitation.
          </p>
          <Button href="/dashboard" className="mt-6">
            Go to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  // Check if email matches
  if (invitation.email !== session.user.email) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/20">
              <XCircle className="h-8 w-8 text-warning" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Email Mismatch</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invitation was sent to <strong>{invitation.email}</strong>, but you're signed in as{' '}
            <strong>{session.user.email}</strong>.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Please sign in with the correct email address to accept this invitation.
          </p>
        </div>
      </main>
    );
  }

  // Accept invitation
  async function acceptInvitation() {
    'use server';

    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Add to org or project
    if (invitation.orgId) {
      await prisma.membership.create({
        data: {
          userId: user.id,
          orgId: invitation.orgId,
          role: invitation.role as 'owner' | 'admin' | 'member',
        },
      });
    }

    if (invitation.projectId) {
      await prisma.projectMember.create({
        data: {
          userId: user.id,
          projectId: invitation.projectId,
          role: invitation.role as 'owner' | 'admin' | 'collaborator' | 'viewer',
        },
      });
    }

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        receiverId: user.id,
      },
    });

    // Redirect to appropriate page
    if (invitation.projectId) {
      redirect(`/projects/${invitation.project?.slug}`);
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-semibold text-foreground">
            You've Been Invited!
          </h1>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{invitation.sender.name || invitation.sender.email}</strong> has
                invited you to join:
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {invitation.org?.name || invitation.project?.name}
              </p>
              {invitation.project && (
                <p className="text-sm text-muted-foreground">
                  in {invitation.project.org.name}
                </p>
              )}
              <p className="mt-2 text-sm text-primary">
                as {invitation.role}
              </p>
            </div>

            <form action={acceptInvitation}>
              <Button
                type="submit"
                variant="solid"
                size="lg"
                className="w-full rounded-2xl gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Accept Invitation
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              By accepting, you agree to collaborate with other members and follow the organization's guidelines.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}








