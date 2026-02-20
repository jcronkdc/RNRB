import { redirect } from 'next/navigation';

// /feed consolidates to /social which has the working posts-based feed
export default function FeedPage() {
  redirect('/social');
}
