import { redirect } from 'next/navigation';

// Redirect legacy /signup route to the main auth page
export default function SignUpPage() {
  redirect('/auth');
}





