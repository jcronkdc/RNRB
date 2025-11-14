import { redirect } from 'next/navigation';

// Redirect old signin route to the real auth page
export default function SignInPage() {
  redirect('/auth');
}

