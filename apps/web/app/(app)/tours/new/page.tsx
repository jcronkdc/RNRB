import { redirect } from 'next/navigation';

// /tours/new redirects to tours page where the create flow lives
export default function Page() {
  redirect('/tours?create=true');
}
