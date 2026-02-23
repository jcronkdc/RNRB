import { prisma } from '@cronkwaters/db';
import { Button } from '@cronkwaters/ui';
import { Mail, CheckCircle2, XCircle, Clock } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

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
            <div className="bg-danger/20 flex h-16 w-16 items-center justify-center rounded-full">
              <XCircle className="text-danger h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-(--text)">Invitation Not Found</h1>
          <p className="mt-2 text-sm text-(--muted)">
            This invitation link is invalid or has been removed.
          </p>
          <Link href="/dashboard">
            <Button className="mt-6">Go to Dashboard</Button>
          </Link>
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
            <div className="bg-warning/20 flex h-16 w-16 items-center justify-center rounded-full">
              <Clock className="text-warning h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-(--text)">Invitation Expired</h1>
          <p className="mt-2 text-sm text-(--muted)">
            This invitation has expired. Please request a new invitation from the organization.
          </p>
          <Link href="/dashboard">
            <Button className="mt-6">Go to Dashboard</Button>
          </Link>
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
            <div className="bg-success/20 flex h-16 w-16 items-center justify-center rounded-full">
              <CheckCircle2 className="text-success h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-(--text)">Already Accepted</h1>
          <p className="mt-2 text-sm text-(--muted)">You've already accepted this invitation.</p>
          <Link href="/dashboard">
            <Button className="mt-6">Go to Dashboard</Button>
          </Link>
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
            <div className="bg-warning/20 flex h-16 w-16 items-center justify-center rounded-full">
              <XCircle className="text-warning h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-(--text)">Email Mismatch</h1>
          <p className="mt-2 text-sm text-(--muted)">
            This invitation was sent to <strong>{invitation.email}</strong>, but you're signed in as{' '}
            <strong>{session.user.email}</strong>.
          </p>
          <p className="mt-4 text-sm text-(--muted)">
            Please sign in with the correct email address to accept this invitation.
          </p>
        </div>
      </main>
    );
  }

  // Accept invitation
  async function acceptInvitation() {
    'use server';

    if (!invitation) {
      throw new Error('Invitation not found');
    }

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
        <div className="shadow-soft rounded-3xl border border-(--border) bg-(--surface) p-8">
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/20 flex h-16 w-16 items-center justify-center rounded-full">
              <Mail className="text-primary h-8 w-8" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-semibold text-(--text)">You've Been Invited!</h1>

          <div className="mt-6 space-y-4">
            <div className="bg-muted/50 rounded-2xl border border-(--border) p-4">
              <p className="text-sm text-(--muted)">
                <strong className="text-(--text)">
                  {invitation.sender.name || invitation.sender.email}
                </strong>{' '}
                has invited you to join:
              </p>
              <p className="mt-2 text-lg font-semibold text-(--text)">
                {invitation.org?.name || invitation.project?.name}
              </p>
              {invitation.project && (
                <p className="text-sm text-(--muted)">in {invitation.project.org.name}</p>
              )}
              <p className="text-primary mt-2 text-sm">as {invitation.role}</p>
            </div>

            <form action={acceptInvitation}>
              <Button type="submit" variant="solid" size="lg" className="w-full gap-2 rounded-2xl">
                <CheckCircle2 className="h-5 w-5" />
                Accept Invitation
              </Button>
            </form>

            <p className="text-center text-xs text-(--muted)">
              By accepting, you agree to collaborate with other members and follow the
              organization's guidelines.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
