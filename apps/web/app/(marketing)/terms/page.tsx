import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service | Rock N' Roll Basement",
  description: "Terms of service for using Rock N' Roll Basement platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-orange-500">Terms of Service</h1>
        <div className="space-y-8 text-gray-300">
          <section>
            <p className="mb-8 text-sm text-gray-400">Last Updated: November 18, 2025</p>
            <p className="text-lg">
              Welcome to Rock N' Roll Basement. By accessing or using our platform, you agree to be
              bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using our services, you agree to these Terms of Service and
              our Privacy Policy. If you do not agree to these terms, please do not use our
              platform.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              2. Description of Service
            </h2>
            <p>
              Rock N' Roll Basement provides a collaborative platform for musicians to create,
              share, and collaborate on music projects. Our services include:
            </p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>Project management and organization tools</li>
              <li>Real-time collaboration features (chat, video, screen sharing)</li>
              <li>AI-powered songwriting and music generation tools</li>
              <li>Cloud storage for audio files and project data</li>
              <li>Team collaboration and invite systems</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              3. Intellectual Property Rights
            </h2>
            <p className="mb-2 font-semibold text-white">YOU OWN YOUR MUSIC. ALWAYS.</p>
            <p>
              You retain all rights, title, and interest in and to any content you create, upload,
              or share through our platform. We do not claim any ownership rights to your music,
              lyrics, recordings, or creative works.
            </p>
            <p className="mt-4">
              By uploading content to our platform, you grant us a limited, non-exclusive license to
              store, process, and display your content solely for the purpose of providing our
              services to you and your collaborators.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">4. User Accounts</h2>
            <p>You are responsible for:</p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring your account information is accurate and up-to-date</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="ml-4 mt-4 list-inside list-disc space-y-2">
              <li>Upload content that infringes on others' intellectual property rights</li>
              <li>Share or distribute copyrighted material without permission</li>
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Distribute malware, viruses, or malicious code</li>
              <li>Scrape, data mine, or extract data without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">6. Privacy and Data</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we
              collect, use, and protect your data. We use end-to-end encryption for sensitive
              communications and implement industry-standard security measures.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              7. Payment and Subscriptions
            </h2>
            <p>
              Paid features are billed on a recurring basis. You may cancel your subscription at any
              time. Refunds are provided in accordance with our refund policy. Prices are subject to
              change with notice.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              8. Content Storage and Backup
            </h2>
            <p>
              While we implement robust backup systems, you are responsible for maintaining your own
              backups of important content. We are not liable for any loss of data due to system
              failures, user error, or other circumstances.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. You
              may close your account at any time. Upon termination, you retain ownership of your
              content, and we will provide reasonable access to export your data.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">10. Disclaimers</h2>
            <p>
              Our platform is provided "AS IS" without warranties of any kind. We do not guarantee
              uninterrupted access, and we are not responsible for third-party integrations
              (Daily.co, Ably, OpenAI, etc.).
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              11. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Rock N' Roll Basement shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, including loss
              of profits, data, or other intangibles.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">12. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. We will notify users of material changes via
              email or platform notifications. Continued use of the platform after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">13. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at:{' '}
              <a
                href="mailto:legal@rnrb.app"
                className="text-orange-500 underline hover:text-orange-400"
              >
                legal@rnrb.app
              </a>
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
