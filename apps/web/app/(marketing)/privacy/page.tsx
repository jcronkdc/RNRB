import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | Rock N' Roll Basement",
  description: "Privacy policy for Rock N' Roll Basement platform",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-orange-500">Privacy Policy</h1>
        <div className="space-y-8 text-gray-300">
          <section>
            <p className="mb-8 text-sm text-gray-400">Last Updated: November 18, 2025</p>
            <p className="text-lg">
              At Rock N' Roll Basement, we take your privacy seriously. This Privacy Policy explains
              how we collect, use, protect, and share your personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              1. Information We Collect
            </h2>
            <h3 className="mb-2 mt-4 text-xl font-semibold text-orange-300">Account Information</h3>
            <ul className="ml-4 list-inside list-disc space-y-2">
              <li>Email address (for authentication and communication)</li>
              <li>Name and profile information (if provided)</li>
              <li>Authentication tokens (from Google OAuth or email magic links)</li>
            </ul>

            <h3 className="mb-2 mt-4 text-xl font-semibold text-orange-300">
              Content and Usage Data
            </h3>
            <ul className="ml-4 list-inside list-disc space-y-2">
              <li>Music projects, songs, lyrics, and audio files you create or upload</li>
              <li>Collaboration data (chat messages, video sessions, comments)</li>
              <li>Usage analytics (features used, session duration, error logs)</li>
              <li>Device and browser information (IP address, user agent, device type)</li>
            </ul>

            <h3 className="mb-2 mt-4 text-xl font-semibold text-orange-300">
              Third-Party Service Data
            </h3>
            <p>We use the following third-party services that may collect data:</p>
            <ul className="ml-4 list-inside list-disc space-y-2">
              <li>Supabase (authentication and database)</li>
              <li>Vercel (hosting and analytics)</li>
              <li>Daily.co (video conferencing)</li>
              <li>Ably (real-time messaging)</li>
              <li>OpenAI (AI features)</li>
              <li>Google OAuth (optional sign-in)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              2. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>Provide and improve our platform services</li>
              <li>Enable real-time collaboration features</li>
              <li>Send important service updates and notifications</li>
              <li>Respond to support requests and troubleshoot issues</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">3. Data Security</h2>
            <p className="mb-2 font-semibold text-white">YOUR DATA IS PROTECTED</p>
            <p>We implement industry-standard security measures including:</p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>End-to-end encryption for sensitive communications</li>
              <li>Secure HTTPS connections for all data transmission</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Encrypted database storage</li>
              <li>Regular automated backups</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              4. Data Sharing and Disclosure
            </h2>
            <p>
              We do NOT sell your personal data. We may share your information only in these limited
              circumstances:
            </p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>
                <strong>With Collaborators:</strong> Project members you invite can see shared
                project content
              </li>
              <li>
                <strong>Service Providers:</strong> Third-party services necessary to operate the
                platform (hosting, video, messaging)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court order, or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale
                (with notice to users)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              5. Your Rights and Choices
            </h2>
            <p>You have the right to:</p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correct:</strong> Update inaccurate or incomplete information
              </li>
              <li>
                <strong>Delete:</strong> Request deletion of your account and associated data
              </li>
              <li>
                <strong>Export:</strong> Download your content in standard formats
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing emails (service emails may
                still be sent)
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Revoke permissions for data processing
              </li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{' '}
              <a
                href="mailto:privacy@rnrb.app"
                className="text-orange-500 underline hover:text-orange-400"
              >
                privacy@rnrb.app
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide
              services. When you delete your account:
            </p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>Your personal information is deleted within 30 days</li>
              <li>
                Content you created remains accessible to collaborators (unless you delete it first)
              </li>
              <li>Anonymized usage data may be retained for analytics</li>
              <li>Backups are purged within 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">7. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>Session management and authentication</li>
              <li>User preferences and settings</li>
              <li>Analytics and performance monitoring</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but some features may not work
              properly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">8. Children's Privacy</h2>
            <p>
              Our platform is not intended for users under the age of 13. We do not knowingly
              collect personal information from children. If we discover that a child has provided
              us with personal data, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              9. International Data Transfers
            </h2>
            <p>
              Your data may be stored and processed in the United States or other countries where
              our service providers operate. We ensure appropriate safeguards are in place to
              protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">10. Third-Party Links</h2>
            <p>
              Our platform may contain links to external websites or services. We are not
              responsible for the privacy practices of these third parties. Please review their
              privacy policies before providing any information.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes via email or platform notifications. Your continued use of the platform after
              changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">12. Contact Us</h2>
            <p>
              For questions, concerns, or requests regarding this Privacy Policy or your personal
              data, contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:privacy@rnrb.app"
                  className="text-orange-500 underline hover:text-orange-400"
                >
                  privacy@rnrb.app
                </a>
              </p>
              <p>
                <strong>Address:</strong> Cronkwaters, LLC (full address available upon request)
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              13. GDPR Compliance (EU Users)
            </h2>
            <p>
              If you are in the European Economic Area (EEA), you have additional rights under GDPR:
            </p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="mt-4">
              Our legal basis for processing your data is your consent, contract performance, and
              legitimate business interests.
            </p>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500">
              Rock N' Roll Basement is operated by Cronkwaters, LLC. © 2024-2025. All rights
              reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
