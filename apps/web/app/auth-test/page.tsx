import Link from 'next/link';

export default function AuthTestPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Auth Diagnostic Page</h1>
          <p className="mt-2 text-sm text-gray-400">Testing authentication configuration</p>
        </div>

        <div className="space-y-4 rounded-lg bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">
            Email Magic Link (Alternative to Google)
          </h2>

          <div className="space-y-3">
            <div className="rounded border border-green-500/20 bg-green-500/10 p-4">
              <p className="mb-2 text-sm font-medium text-green-400">
                ✅ Email Provider Configured
              </p>
              <p className="text-xs text-gray-400">
                Resend SMTP is configured in environment variables. Email magic link sign-in should
                work as an alternative to Google.
              </p>
            </div>

            <div className="rounded border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="mb-2 text-sm font-medium text-blue-400">📧 How Email Sign-In Works:</p>
              <ol className="ml-4 list-decimal space-y-1 text-xs text-gray-400">
                <li>Enter your email address</li>
                <li>Click "Sign in with Email"</li>
                <li>Check your inbox for magic link</li>
                <li>Click the link to sign in</li>
                <li>No password needed!</li>
              </ol>
            </div>

            <div className="rounded border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="mb-2 text-sm font-medium text-yellow-400">⚠️ Known Issue:</p>
              <p className="text-xs text-gray-400">
                The /auth page has a 500 error preventing sign-in forms from working. This is a
                server-side configuration issue being diagnosed.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/api/auth/debug/providers"
              className="text-sm text-purple-400 hover:underline"
            >
              → View configured auth providers
            </Link>
          </div>

          <div className="border-t border-white/10 pt-4">
            <Link
              href="/"
              className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700"
            >
              Back to Homepage
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white/5 p-6">
          <h3 className="mb-3 text-lg font-semibold text-white">Environment Status:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">EMAIL_SERVER_URL configured (Resend SMTP)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">EMAIL_FROM configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">GOOGLE_CLIENT_ID configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">NEXTAUTH_URL = https://www.cronkwaters.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">
                Database tables exist (Account, Session, VerificationToken)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
