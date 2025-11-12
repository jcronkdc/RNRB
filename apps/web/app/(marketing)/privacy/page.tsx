import { Card, CardContent, CardHeader, CardTitle } from '@cronkwaters/ui';
import { Shield, Database, Eye, Lock, UserCheck, Globe, Mail, FileWarning } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  const lastUpdated = '2025-01-01';
  const dataCategories = [
    {
      title: 'Account Information',
      icon: UserCheck,
      items: ['Email address', 'Username', 'Profile picture', 'Authentication tokens']
    },
    {
      title: 'Content Data',
      icon: Database,
      items: ['Music files', 'Lyrics', 'Project metadata', 'Collaboration history']
    },
    {
      title: 'Usage Analytics',
      icon: Eye,
      items: ['Feature usage', 'Session duration', 'Error logs', 'Performance metrics']
    },
    {
      title: 'Security Data',
      icon: Lock,
      items: ['Login timestamps', 'IP addresses', 'Device information', 'Access logs']
    }
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-brand-foreground">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Last Updated: {lastUpdated}
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          At SongForge, we take your privacy seriously. This policy explains how we collect, use, and protect your data.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            Our Privacy Commitment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>We never sell your personal data to third parties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>Your music and creative content remains yours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>We use encryption to protect your data in transit and at rest</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>You can request data deletion at any time</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {dataCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <category.icon className="h-4 w-4 text-muted-foreground" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {category.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How We Use Your Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div className="space-y-3">
            <h3 className="font-semibold text-brand-foreground">Service Delivery</h3>
            <p>We use your data to provide core SongForge features including file storage, collaboration tools, and project management.</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-brand-foreground">Security & Safety</h3>
            <p>We monitor for suspicious activity, prevent abuse, and ensure platform stability through automated security measures.</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-brand-foreground">Product Improvement</h3>
            <p>Anonymous usage analytics help us understand feature adoption and identify areas for enhancement.</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-brand-foreground">Communication</h3>
            <p>We send essential service updates, collaboration notifications, and optional marketing emails (with your consent).</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            Data Sharing & Third Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>We share data only in these limited circumstances:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span><strong>Service Providers:</strong> Cloud storage (AWS/Cloudflare R2), payment processing (Stripe), and email delivery (SendGrid)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span><strong>Legal Requirements:</strong> When required by law, court order, or governmental request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span><strong>With Your Consent:</strong> When you explicitly authorize sharing, such as public project showcases</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-muted-foreground" />
            Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Under GDPR and CCPA, you have the right to:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold mb-1">Access Your Data</h4>
              <p className="text-sm">Request a copy of all data we have about you</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold mb-1">Correct Information</h4>
              <p className="text-sm">Update or fix any inaccurate data</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold mb-1">Delete Your Account</h4>
              <p className="text-sm">Request complete removal of your data</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold mb-1">Data Portability</h4>
              <p className="text-sm">Export your data in a machine-readable format</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>We retain different types of data for varying periods:</p>
          <ul className="space-y-2">
            <li>• <strong>Active account data:</strong> Retained while your account is active</li>
            <li>• <strong>Deleted content:</strong> Removed within 30 days from all backups</li>
            <li>• <strong>Security logs:</strong> Retained for 90 days for abuse prevention</li>
            <li>• <strong>Legal holds:</strong> Data may be retained longer if required by law</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>We use cookies and similar technologies for:</p>
          <ul className="space-y-2">
            <li>• <strong>Authentication:</strong> Keeping you logged in securely</li>
            <li>• <strong>Preferences:</strong> Remembering your settings and choices</li>
            <li>• <strong>Analytics:</strong> Understanding feature usage (anonymized)</li>
            <li>• <strong>Security:</strong> Preventing fraud and abuse</li>
          </ul>
          <p className="mt-4">You can control cookies through your browser settings, though some features may not work properly without them.</p>
        </CardContent>
      </Card>

      <Card className="border-brand-primary/20 bg-brand-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Our Privacy Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            For privacy questions, data requests, or concerns:
          </p>
          <div className="bg-background rounded-lg p-4">
            <p className="font-mono text-sm">privacy@songforge.app</p>
            <p className="text-sm text-muted-foreground mt-2">
              Privacy Team, SongForge<br />
              Response time: 1-3 business days<br />
              GDPR/CCPA requests: Within 30 days
            </p>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-sm text-muted-foreground">
        <p>This privacy policy is effective as of {lastUpdated} and will be updated as needed.</p>
        <p className="mt-2">By using SongForge, you agree to this Privacy Policy.</p>
      </footer>
    </main>
  );
}
