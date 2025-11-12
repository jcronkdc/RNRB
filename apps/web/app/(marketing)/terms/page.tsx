import { Card, CardContent } from '@cronkwaters/ui';
import { Shield, FileText, Users, AlertCircle, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function TermsPage() {
  const effectiveDate = '2025-01-01';
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: FileText,
      content: [
        'By accessing or using SongForge, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.',
        'You must be at least 13 years old to use this service. If you are between 13 and 18, you must have parental consent.'
      ]
    },
    {
      id: 'license',
      title: '2. License & Usage',
      icon: Shield,
      content: [
        'SongForge grants you a personal, non-exclusive license to use the platform for music production.',
        'You may use the service for both personal and commercial projects.',
        'You retain all rights to your original content.',
        'You may not reverse engineer, decompile, or attempt to extract source code.'
      ]
    },
    {
      id: 'content',
      title: '3. User Content & Rights',
      icon: Users,
      content: [
        'You retain ownership of all content you create or upload to SongForge.',
        'By uploading content, you grant us a limited license to store, process, and display it solely for providing the service.',
        'You are responsible for securing necessary rights for any third-party content you use.',
        'We do not claim ownership of your music, lyrics, or creative works.'
      ]
    },
    {
      id: 'prohibited',
      title: '4. Prohibited Uses',
      icon: AlertCircle,
      content: [
        'You may not use the service for illegal activities or to violate any laws.',
        'You may not upload malicious code, viruses, or harmful content.',
        'You may not harass, abuse, or harm other users.',
        'You may not attempt to gain unauthorized access to any part of the service.',
        'You may not use the service to infringe on intellectual property rights.'
      ]
    }
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-brand-foreground">Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          Effective Date: {effectiveDate}
        </p>
      </header>

      <Card>
        <CardContent className="p-8">
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            {sections.map((section) => (
              <section key={section.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <section.icon className="h-5 w-5 text-brand-primary" />
                  <h2 className="text-2xl font-semibold text-brand-foreground">{section.title}</h2>
                </div>
                <div className="space-y-3">
                  {section.content.map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-brand-foreground">5. Collaboration & Split Agreements</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  When using collaborative features:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>All split agreements created on the platform are binding between parties</li>
                  <li>You must honor royalty arrangements and ownership percentages</li>
                  <li>Disputes between collaborators must be resolved independently</li>
                  <li>SongForge is not responsible for enforcing split agreements</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-brand-foreground">6. Privacy & Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of SongForge is also governed by our Privacy Policy. We take data protection seriously
                and implement industry-standard security measures to protect your content and personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-brand-foreground">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                SongForge is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Loss of data or content</li>
                <li>Service interruptions or downtime</li>
                <li>Indirect or consequential damages</li>
                <li>Actions of third parties or other users</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-brand-foreground">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms.
                You may delete your account at any time through account settings.
                Upon termination, your right to use the service ceases immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-brand-foreground">9. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these terms periodically. Material changes will be notified via email or platform 
                notification. Continued use after changes constitutes acceptance of new terms.
              </p>
            </section>

            <section className="space-y-4 border-t pt-8">
              <h2 className="text-2xl font-semibold text-brand-foreground flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="font-mono text-sm">legal@songforge.app</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    SongForge Legal Department<br />
                    Response time: 1-3 business days
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
