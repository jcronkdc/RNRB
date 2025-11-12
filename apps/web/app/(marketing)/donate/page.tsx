/**
 * Donation Page - Fully functional donation system
 * No more placeholders - real payment processing ready
 */

import { Button } from '@cronkwaters/ui';
import Link from 'next/link';
import { DonationWidget } from './DonationWidget';
import { auth } from '@cronkwaters/auth';
import { getDonationStats } from './actions';
import { Heart, Users, Trophy, TrendingUp } from 'lucide-react';

const WHY_POINTS = [
  {
    title: 'Fuel emerging artists',
    copy: 'Help us fund residencies, mentorship, and studio time for creators pushing culture forward.',
    icon: Heart
  },
  {
    title: 'Expand community access',
    copy: 'Your support powers inclusive programming, workshops, and resources for underrepresented voices.',
    icon: Users
  },
  {
    title: 'Keep tools open-source',
    copy: 'Donations sustain our open tooling so independent teams can build without compromise.',
    icon: Trophy
  }
];

const FUND_USAGE = [
  { percentage: 60, label: 'Grants, residencies, and artist stipends', color: 'bg-purple-500' },
  { percentage: 25, label: 'Community programming & accessibility initiatives', color: 'bg-blue-500' },
  { percentage: 10, label: 'Open-source platform maintenance', color: 'bg-green-500' },
  { percentage: 5, label: 'Operational reserves & compliance', color: 'bg-gray-500' }
];

export const dynamic = 'force-dynamic';

export default async function DonatePage() {
  const session = await auth();
  const stats = await getDonationStats();

  return (
    <main id="main-content" className="bg-background">
      <section className="motion-safe:animate-fade-in mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col gap-10 px-6 py-20">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-brand-muted-foreground">CronkWaters Foundation</p>
          <h1 className="mt-4 text-4xl font-semibold text-brand-foreground">Support the Foundation</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Invest in the musicians, technologists, and storytellers who keep our creative future vibrant. Every
            contribution amplifies community-driven artistry.
          </p>
          
          {/* Donation Progress */}
          <div className="mt-8 mx-auto max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Goal Progress</span>
              <span className="font-semibold">${stats.raised.toLocaleString()} / ${stats.goal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((stats.raised / stats.goal) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-lg">{stats.donors}</p>
                <p className="text-muted-foreground">Donors</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">{stats.daysLeft}</p>
                <p className="text-muted-foreground">Days Left</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">{((stats.raised / stats.goal) * 100).toFixed(0)}%</p>
                <p className="text-muted-foreground">Funded</p>
              </div>
            </div>
          </div>
        </header>

        {/* Donation Widget - FUNCTIONAL */}
        <section className="rounded-3xl border border-border/60 bg-surface/90 p-10 shadow-soft">
          <h2 className="text-2xl font-semibold text-brand-foreground text-center mb-8">
            Make Your Contribution
          </h2>
          <DonationWidget userId={session?.user?.id} />
        </section>

        <section aria-labelledby="why-donate" className="rounded-3xl border border-border/60 bg-surface/90 p-10 shadow-soft">
          <h2 id="why-donate" className="text-2xl font-semibold text-brand-foreground">
            Why donate
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {WHY_POINTS.map((point) => (
              <article
                key={point.title}
                className="rounded-2xl border border-border/50 bg-surface px-6 py-6 text-left shadow-soft hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <point.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-foreground">{point.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{point.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="fund-usage" className="rounded-3xl border border-border/60 bg-surface/90 p-10 shadow-soft">
          <h2 id="fund-usage" className="text-2xl font-semibold text-brand-foreground mb-6">
            How funds are used
          </h2>
          
          {/* Visual Fund Distribution */}
          <div className="mb-8">
            <div className="flex h-8 overflow-hidden rounded-full">
              {FUND_USAGE.map((item, index) => (
                <div
                  key={index}
                  className={`${item.color} transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.percentage}%: ${item.label}`}
                />
              ))}
            </div>
          </div>

          <ul className="space-y-3 text-left text-sm leading-relaxed">
            {FUND_USAGE.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full ${item.color}`} aria-hidden="true" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-brand-foreground">{item.percentage}%:</span> {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent Donors */}
        <section className="rounded-3xl border border-border/60 bg-surface/90 p-10 shadow-soft">
          <h2 className="text-2xl font-semibold text-brand-foreground mb-6">Recent Supporters</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.recentDonors.map((donor, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                  {donor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{donor.name}</p>
                  <p className="text-sm text-muted-foreground">{donor.timeAgo}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">${donor.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-semibold text-brand-foreground mb-4">
            Join our community of supporters
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Your donation makes a real difference. Join hundreds of supporters who believe in 
            empowering artists and keeping creative tools accessible to all.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate now
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}