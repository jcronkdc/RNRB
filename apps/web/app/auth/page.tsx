import { auth } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import LoginForm from './login-form';

export default async function AuthPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/projects');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(88,91,255,0.18),_transparent_55%)]" />
      <section className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface/80 p-10 shadow-soft backdrop-blur-xl">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back to CronkWaters</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your collaborative studio, AI co-creators, and release pipeline — all powered by NextAuth.
            </p>
          </div>
          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing you agree to the CronkWaters Terms and acknowledge the use of NextAuth for secure authentication.
        </p>
      </section>
    </main>
  );
}