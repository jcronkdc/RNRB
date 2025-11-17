import Link from 'next/link';
import { Button, Input } from '@cronkwaters/ui';

export default function SignInPage() {
  const handleSubmit = async (formData: FormData) => {
    formData.get('email');
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16 sm:px-0">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Passwordless email, Google, and Apple sign-in will arrive soon. For now, this screen is a
          placeholder.
        </p>
      </header>
      <form
        action={handleSubmit}
        className="space-y-4 rounded-2xl border border-border/60 bg-surface px-6 py-6 shadow-soft"
      >
        <label className="space-y-2 text-sm text-brand-foreground" htmlFor="email">
          Email address
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
        </label>
        <Button type="submit" className="w-full" onClick={(event) => event.preventDefault()}>
          Send magic link
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-4 hover:text-brand-foreground">
          Return to homepage
        </Link>
      </p>
    </div>
  );
}

