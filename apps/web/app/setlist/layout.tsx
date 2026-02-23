/**
 * Public Setlist Layout
 *
 * VIRAL LOOP: Minimal layout for fan-facing setlist pages
 * No navigation - just the setlist content with RNRB branding
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Live Setlist | Rock N' Roll Basement",
  description: "View tonight's setlist - powered by Rock N' Roll Basement",
};

export default function SetlistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black">
      {children}
    </div>
  );
}
