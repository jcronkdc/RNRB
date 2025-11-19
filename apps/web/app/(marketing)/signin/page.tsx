import { redirect } from 'next/navigation';

export default function SignInPage() {
  // Redirect to the main auth page
  redirect('/auth');
}

