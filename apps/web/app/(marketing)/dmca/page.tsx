import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "DMCA Policy | Rock N' Roll Basement",
  description:
    "Digital Millennium Copyright Act (DMCA) policy for Rock N' Roll Basement platform. Learn how to submit takedown notices and counter-notifications.",
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-orange-500">DMCA Policy</h1>
        <div className="space-y-8 text-gray-300">
          <section>
            <p className="mb-8 text-sm text-gray-400">Last Updated: December 2, 2025</p>
            <p className="text-lg">
              Rock N' Roll Basement respects the intellectual property rights of others and expects
              our users to do the same. In accordance with the Digital Millennium Copyright Act of
              1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement that
              are reported to our designated copyright agent.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              1. Designated DMCA Agent
            </h2>
            <p className="mb-4">
              Our designated agent to receive notifications of claimed infringement under the DMCA
              is:
            </p>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <p className="font-semibold text-white">DMCA Agent</p>
              <p>Cronkwaters, LLC</p>
              <p className="mt-2">
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:dmca@cronkwaters.com"
                  className="text-orange-500 underline hover:text-orange-400"
                >
                  dmca@cronkwaters.com
                </a>
              </p>
              <p className="mt-4 text-sm text-gray-400">
                Please use this contact information only for DMCA-related matters. For general
                inquiries, please contact{' '}
                <a
                  href="mailto:support@cronkwaters.com"
                  className="text-orange-500 underline hover:text-orange-400"
                >
                  support@cronkwaters.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              2. Filing a DMCA Takedown Notice
            </h2>
            <p className="mb-4">
              If you believe that content on our platform infringes your copyright, you may submit a
              written notification to our DMCA Agent. To be effective, the notification must include
              the following information as required by 17 U.S.C. § 512(c)(3):
            </p>
            <ol className="ml-4 list-inside list-decimal space-y-3">
              <li>
                <strong className="text-white">Physical or electronic signature</strong> of the
                copyright owner or a person authorized to act on their behalf.
              </li>
              <li>
                <strong className="text-white">Identification of the copyrighted work</strong>{' '}
                claimed to have been infringed. If multiple works are covered, a representative list
                of such works.
              </li>
              <li>
                <strong className="text-white">Identification of the infringing material</strong>{' '}
                and information reasonably sufficient to permit us to locate the material (e.g.,
                direct URL or project name).
              </li>
              <li>
                <strong className="text-white">Your contact information</strong> including address,
                telephone number, and email address.
              </li>
              <li>
                <strong className="text-white">A statement</strong> that you have a good faith
                belief that use of the material in the manner complained of is not authorized by the
                copyright owner, its agent, or the law.
              </li>
              <li>
                <strong className="text-white">A statement</strong> that the information in the
                notification is accurate, and under penalty of perjury, that you are authorized to
                act on behalf of the copyright owner.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              3. Counter-Notification Procedure
            </h2>
            <p className="mb-4">
              If you believe that your content was removed or disabled by mistake or
              misidentification, you may submit a counter-notification to our DMCA Agent. Your
              counter-notification must include:
            </p>
            <ol className="ml-4 list-inside list-decimal space-y-3">
              <li>Your physical or electronic signature.</li>
              <li>
                Identification of the material that has been removed or to which access has been
                disabled, and the location at which the material appeared before it was removed.
              </li>
              <li>
                A statement under penalty of perjury that you have a good faith belief that the
                material was removed or disabled as a result of mistake or misidentification.
              </li>
              <li>
                Your name, address, and telephone number, and a statement that you consent to the
                jurisdiction of the Federal District Court for the judicial district in which your
                address is located (or any judicial district in which Cronkwaters, LLC may be found
                if your address is outside the United States), and that you will accept service of
                process from the person who provided the original notification.
              </li>
            </ol>
            <p className="mt-4">
              Upon receipt of a valid counter-notification, we will forward it to the original
              complaining party. If we do not receive notice that the original complaining party has
              filed a court action seeking to restrain the allegedly infringing activity within
              10-14 business days, we may restore the removed content.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              4. Repeat Infringer Policy
            </h2>
            <p>
              In accordance with the DMCA and other applicable laws, we have adopted a policy of
              terminating, in appropriate circumstances and at our sole discretion, users who are
              deemed to be repeat infringers. We may also limit access to the platform or terminate
              accounts of users who infringe the intellectual property rights of others, whether or
              not there is any repeat infringement.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              5. Good Faith Requirements
            </h2>
            <p className="mb-4">
              We take intellectual property rights seriously. Please consider the following before
              submitting a takedown notice:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2">
              <li>
                <strong className="text-white">Fair Use:</strong> Before sending a DMCA notice,
                please consider whether the use of your copyrighted work may be protected under fair
                use doctrine. Fair use permits limited use of copyrighted material without requiring
                permission.
              </li>
              <li>
                <strong className="text-white">Ownership:</strong> Ensure you are the copyright
                owner or are authorized to act on behalf of the owner.
              </li>
              <li>
                <strong className="text-white">Specificity:</strong> Provide specific information
                about the allegedly infringing content to help us locate it quickly.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">6. False Claims Warning</h2>
            <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-6">
              <p className="font-semibold text-red-400">⚠ Important Notice</p>
              <p className="mt-2">
                Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents
                that material or activity is infringing may be subject to liability for damages,
                including costs and attorneys' fees incurred by the alleged infringer, by any
                copyright owner or copyright owner's authorized licensee, or by a service provider,
                who is injured by such misrepresentation.
              </p>
              <p className="mt-2">
                Please submit DMCA notices only if you have a good faith belief that the material
                infringes your copyright. Misuse of the DMCA process may result in legal
                consequences.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              7. What Happens After a Takedown
            </h2>
            <ol className="ml-4 list-inside list-decimal space-y-3">
              <li>
                We will review your notification for completeness and compliance with DMCA
                requirements.
              </li>
              <li>
                If the notification is complete, we will promptly remove or disable access to the
                allegedly infringing material.
              </li>
              <li>
                We will notify the user who posted the material about the takedown and provide them
                with a copy of the notification.
              </li>
              <li>
                The affected user may submit a counter-notification if they believe the takedown was
                in error.
              </li>
              <li>
                If a counter-notification is received, we will forward it to you and await your
                response before taking further action.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              8. Protecting Your Music on Our Platform
            </h2>
            <p className="mb-4">
              As a platform built for musicians, we understand the importance of protecting creative
              works. Here are some features we provide to help protect your content:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2">
              <li>
                <strong className="text-white">Copyright Registration Tools:</strong> We provide
                tools to help you document and register your creative works.
              </li>
              <li>
                <strong className="text-white">Project Privacy Controls:</strong> You control who
                can access and view your projects.
              </li>
              <li>
                <strong className="text-white">Timestamped Versions:</strong> Our version history
                creates a record of when your content was created and modified.
              </li>
              <li>
                <strong className="text-white">Split Sheet Management:</strong> Clear documentation
                of ownership percentages among collaborators.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              9. International Considerations
            </h2>
            <p>
              While this policy specifically addresses procedures under the U.S. DMCA, we are
              committed to responding to copyright concerns from users worldwide. If you are located
              outside the United States and have concerns about copyright infringement, please
              contact our DMCA Agent with the relevant details, and we will work to address your
              concerns in accordance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">10. Contact Information</h2>
            <p>For DMCA-related inquiries or to submit a takedown notice, please contact:</p>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:dmca@cronkwaters.com"
                  className="text-orange-500 underline hover:text-orange-400"
                >
                  dmca@cronkwaters.com
                </a>
              </p>
              <p>
                <strong>Subject Line:</strong> "DMCA Takedown Notice" or "DMCA Counter-Notification"
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              For general legal questions, please contact{' '}
              <a
                href="mailto:legal@cronkwaters.com"
                className="text-orange-500 underline hover:text-orange-400"
              >
                legal@cronkwaters.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-orange-400">
              11. Changes to This Policy
            </h2>
            <p>
              We reserve the right to modify this DMCA Policy at any time. Any changes will be
              posted on this page with an updated "Last Updated" date. Your continued use of the
              platform after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500">
              Rock N' Roll Basement is operated by Cronkwaters, LLC. © 2024-2025. All rights
              reserved.
            </p>
            <p className="mt-2 text-xs text-gray-600">
              This DMCA Policy is provided for informational purposes only and does not constitute
              legal advice. Please consult with a qualified attorney for specific legal questions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
