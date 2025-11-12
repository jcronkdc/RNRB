'use client';

import { useState } from 'react';
import { 
  Heart, 
  Users, 
  DollarSign,
  Shield,
  Award,
  BarChart3,
  Globe,
  Sparkles,
  HandHeart,
  Building
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { Card } from '@cronkwaters/ui';
import { Badge } from '@cronkwaters/ui';
import { Progress } from '@cronkwaters/ui';
import { PageHeader } from '@/components/app/PageHeader';

export function FoundationPageClient() {
  const [selectedDonationAmount, setSelectedDonationAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  // Mock data for foundation stats
  const stats = {
    totalRaised: 125000,
    monthlyDonors: 342,
    artistsSupported: 1247,
    grantsAwarded: 23,
  };

  const currentCampaigns = [
    {
      title: 'Music Education for Underserved Communities',
      goal: 50000,
      raised: 32500,
      supporters: 156,
      daysLeft: 22,
      description: 'Bringing music education and instruments to schools in need.',
    },
    {
      title: 'Artist Emergency Relief Fund',
      goal: 100000,
      raised: 78000,
      supporters: 423,
      daysLeft: 45,
      description: 'Supporting musicians facing financial hardship due to unexpected circumstances.',
    },
  ];

  const impactStories = [
    {
      name: 'Sarah\'s Music School',
      location: 'Detroit, MI',
      impact: 'Provided instruments and lessons to 150 students',
      quote: 'CronkWaters Foundation gave our kids the chance to discover their musical talents.',
    },
    {
      name: 'Hurricane Relief for Musicians',
      location: 'New Orleans, LA',
      impact: 'Helped 45 musicians replace lost instruments',
      quote: 'When we lost everything, the foundation helped us get back to making music.',
    },
  ];

  const governanceMembers = [
    { name: 'Maya Patel', role: 'Board Chair', background: 'Grammy-winning producer' },
    { name: 'James Wilson', role: 'Treasurer', background: 'Former CFO, Music Industry' },
    { name: 'Lisa Chen', role: 'Secretary', background: 'Music Education Advocate' },
    { name: 'Marcus Davis', role: 'Board Member', background: 'Independent Artist' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="CronkWaters Foundation"
        description="Supporting musicians and music education worldwide through community-driven initiatives"
        actions={
          <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
            <Heart className="mr-2 h-5 w-5" />
            Donate Now
          </Button>
        }
      />

      {/* Mission Statement */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-8">
        <div className="mx-auto max-w-3xl text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            The CronkWaters Foundation is a nonprofit organization dedicated to empowering musicians, 
            fostering music education, and building a sustainable ecosystem where artists can thrive. 
            We believe music has the power to transform lives and communities.
          </p>
        </div>
      </Card>

      {/* Impact Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Total Raised', value: `$${stats.totalRaised.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
          { label: 'Monthly Donors', value: stats.monthlyDonors.toLocaleString(), icon: Users, color: 'text-blue-500' },
          { label: 'Artists Supported', value: stats.artistsSupported.toLocaleString(), icon: Award, color: 'text-purple-500' },
          { label: 'Grants Awarded', value: stats.grantsAwarded, icon: HandHeart, color: 'text-pink-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`h-10 w-10 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Current Campaigns */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Active Campaigns</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {currentCampaigns.map((campaign, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20" />
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold">{campaign.title}</h3>
                <p className="mb-4 text-muted-foreground">{campaign.description}</p>
                
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>${campaign.raised.toLocaleString()} raised</span>
                    <span>${campaign.goal.toLocaleString()} goal</span>
                  </div>
                  <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{campaign.supporters} supporters</span>
                  <span>{campaign.daysLeft} days left</span>
                </div>

                <Button className="mt-4 w-full">Support This Campaign</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Donation Section */}
      <Card className="p-8">
        <h2 className="mb-6 text-2xl font-bold">Make a Difference</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your donation helps us provide instruments, education, and support to musicians in need.
              Every contribution makes a real impact.
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {[25, 50, 100, 250, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant={selectedDonationAmount === amount ? 'default' : 'outline'}
                  onClick={() => setSelectedDonationAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Amount</label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedDonationAmount(null);
                  }}
                  className="flex-1 rounded-r-md border bg-background px-3 py-2"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <Button size="lg" className="w-full">
              <Heart className="mr-2 h-5 w-5" />
              Donate {selectedDonationAmount ? `$${selectedDonationAmount}` : customAmount ? `$${customAmount}` : ''}
            </Button>
          </div>

          <div className="space-y-4 rounded-lg bg-muted/50 p-6">
            <h3 className="font-semibold">Where Your Money Goes</h3>
            <div className="space-y-3">
              {[
                { category: 'Music Education Programs', percentage: 40 },
                { category: 'Artist Emergency Relief', percentage: 30 },
                { category: 'Community Instruments', percentage: 20 },
                { category: 'Operations & Admin', percentage: 10 },
              ].map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Impact Stories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Impact Stories</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {impactStories.map((story, index) => (
            <Card key={index} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{story.name}</h3>
                  <p className="text-sm text-muted-foreground">{story.location}</p>
                </div>
                <Badge variant="success">Success Story</Badge>
              </div>
              <p className="mb-4 font-medium text-primary">{story.impact}</p>
              <blockquote className="border-l-4 border-primary/20 pl-4 italic text-muted-foreground">
                "{story.quote}"
              </blockquote>
            </Card>
          ))}
        </div>
      </div>

      {/* Transparency & Governance */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Transparency & Governance</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <BarChart3 className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold">Financial Reports</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              View our detailed financial statements and annual reports.
            </p>
            <Button variant="outline" size="sm">View Reports</Button>
          </Card>

          <Card className="p-6">
            <Shield className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold">501(c)(3) Status</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Registered nonprofit organization. All donations are tax-deductible.
            </p>
            <Button variant="outline" size="sm">View Documents</Button>
          </Card>

          <Card className="p-6">
            <Globe className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold">Impact Report</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              See how your donations are making a difference worldwide.
            </p>
            <Button variant="outline" size="sm">Read Report</Button>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Board of Directors</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {governanceMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20" />
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.background}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-8 text-center">
        <Building className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h2 className="mb-4 text-2xl font-bold">Join Our Mission</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          Whether through donations, volunteering, or spreading the word, there are many ways to support 
          the CronkWaters Foundation and help us build a better future for musicians everywhere.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg">Become a Monthly Donor</Button>
          <Button size="lg" variant="outline">Volunteer With Us</Button>
        </div>
      </Card>
    </div>
  );
}
