'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Disc,
  Radio,
  Settings,
  Shield,
  Zap,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from '@/components/ui/custom-icons';

export default function RecordingGuidePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <Link href="/dashboard" className="group mb-8 inline-block">
              <Image
                src="/images/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={60}
                height={60}
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
            <h1
              className="mb-4 text-5xl font-bold"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
            >
              Professional Recording Studio
            </h1>
            <p className="mx-auto max-w-3xl text-xl" style={{ color: 'var(--muted)' }}>
              Everything you need to know about our advanced recording, streaming, and collaboration
              features
            </p>
          </div>

          {/* Overview Section */}
          <div
            className="mb-8 rounded-xl p-8"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <h2
              className="mb-6 text-3xl font-bold"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
            >
              Studio Features Overview
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h3
                  className="mb-2 flex items-center gap-2 text-lg font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Disc className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  Cloud Recording
                </h3>
                <p style={{ color: 'var(--muted)' }}>
                  HD video & audio recording in MP4/HLS format with custom layouts
                </p>
              </div>
              <div>
                <h3
                  className="mb-2 flex items-center gap-2 text-lg font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Radio className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  Live Streaming
                </h3>
                <p style={{ color: 'var(--muted)' }}>
                  Stream to YouTube, Twitch, Facebook, or custom RTMP endpoints
                </p>
              </div>
              <div>
                <h3
                  className="mb-2 flex items-center gap-2 text-lg font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  Collaboration
                </h3>
                <p style={{ color: 'var(--muted)' }}>
                  Multi-participant sessions with screen sharing and real-time chat
                </p>
              </div>
            </div>
          </div>

          {/* Recording Features Detail */}
          <div className="mb-12 space-y-8">
            <div
              className="rounded-xl p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2
                className="mb-6 flex items-center gap-3 text-2xl font-bold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
              >
                <Disc className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                Recording Capabilities
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Cloud Recording
                  </h3>
                  <ul className="space-y-2" style={{ color: 'var(--text)' }}>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>HD Quality:</strong> Records in 1080p HD with crystal-clear audio
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Format Options:</strong> MP4 for compatibility or HLS for streaming
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Custom Layouts:</strong> Grid view, active speaker, or custom
                        compositions
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Storage Options:</strong> Daily cloud storage or your own AWS S3
                        bucket
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Individual Track Recording
                  </h3>
                  <ul className="space-y-2" style={{ color: 'var(--text)' }}>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Separate Tracks:</strong> Individual audio/video tracks for each
                        participant
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Post-Production Ready:</strong> Perfect for professional editing and
                        mixing
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>AI Integration:</strong> Ideal for transcription and content
                        analysis
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Recording Controls
                  </h3>
                  <ul className="space-y-2" style={{ color: 'var(--text)' }}>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Pause/Resume:</strong> Take breaks without creating multiple files
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Quality Settings:</strong> Choose bitrate from 1-3 Mbps for video
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5" style={{ color: 'var(--success)' }} />
                      <div>
                        <strong>Real-time Status:</strong> Live indicators and duration tracking
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Live Streaming Features */}
            <div
              className="rounded-xl p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2
                className="mb-6 flex items-center gap-3 text-2xl font-bold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
              >
                <Radio className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                Live Streaming Features
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Supported Platforms
                  </h3>
                  <ul className="space-y-2" style={{ color: 'var(--text)' }}>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      YouTube Live (RTMP)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      Twitch Streaming
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      Facebook Live (RTMPS)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      Custom RTMP Endpoints
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Streaming Features
                  </h3>
                  <ul className="space-y-2" style={{ color: 'var(--text)' }}>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      Up to 4K streaming quality
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      Real-time viewer analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      Chat integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      Stream health monitoring
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div
              className="rounded-xl p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2
                className="mb-6 flex items-center gap-3 text-2xl font-bold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
              >
                <Settings className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                Technical Specifications
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Video Specifications
                  </h3>
                  <table className="w-full text-sm" style={{ color: 'var(--text)' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Resolution</td>
                        <td className="py-2 text-right">Up to 1920x1080 (1080p)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Frame Rate</td>
                        <td className="py-2 text-right">30 fps</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Video Codec</td>
                        <td className="py-2 text-right">H.264</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Bitrate</td>
                        <td className="py-2 text-right">500 Kbps - 3 Mbps</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Audio Specifications
                  </h3>
                  <table className="w-full text-sm" style={{ color: 'var(--text)' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Sample Rate</td>
                        <td className="py-2 text-right">48 kHz</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Channels</td>
                        <td className="py-2 text-right">Stereo</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Audio Codec</td>
                        <td className="py-2 text-right">AAC</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2">Bitrate</td>
                        <td className="py-2 text-right">128 Kbps</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div
              className="rounded-xl p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2
                className="mb-6 flex items-center gap-3 text-2xl font-bold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
              >
                <Zap className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                How It Works
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    1. Starting a Session
                  </h3>
                  <ol
                    className="list-inside list-decimal space-y-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    <li>Click "Start Recording" or "Go Live" from the Studio page</li>
                    <li>A secure room is automatically created with unique credentials</li>
                    <li>Grant camera and microphone permissions when prompted</li>
                    <li>Invite collaborators by sharing the session link</li>
                  </ol>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    2. During the Session
                  </h3>
                  <ol
                    className="list-inside list-decimal space-y-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    <li>Use the control bar to manage video, audio, and screen sharing</li>
                    <li>Start/stop recording or streaming as needed</li>
                    <li>Monitor participant status and connection quality</li>
                    <li>Use chat for text communication during the session</li>
                  </ol>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    3. After Recording
                  </h3>
                  <ol
                    className="list-inside list-decimal space-y-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    <li>Recordings are automatically processed and stored</li>
                    <li>Access recordings from your dashboard within minutes</li>
                    <li>Download files or share via secure links</li>
                    <li>Integrate with your DAW for post-production</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Security & Privacy */}
            <div
              className="rounded-xl p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2
                className="mb-6 flex items-center gap-3 text-2xl font-bold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
              >
                <Shield className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                Security & Privacy
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Data Protection
                  </h3>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text)' }}>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      End-to-end encryption for all sessions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      GDPR and CCPA compliant
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      Secure token-based authentication
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      Automatic data retention policies
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Access Control
                  </h3>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text)' }}>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      Role-based permissions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      Session passwords optional
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      Waiting room for approval
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--success)' }} />
                      Ability to remove participants
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div
            className="rounded-xl p-8"
            style={{
              background: 'rgba(232, 93, 59, 0.05)',
              border: '2px solid rgba(232, 93, 59, 0.2)',
            }}
          >
            <h2
              className="mb-6 flex items-center gap-3 text-2xl font-bold"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
            >
              <DollarSign className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              Cost Breakdown
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  Recording Costs
                </h3>
                <table className="w-full" style={{ color: 'var(--text)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="py-2 text-left">Feature</th>
                      <th className="py-2 text-right">Cost</th>
                      <th className="py-2 text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">Cloud Recording</td>
                      <td className="py-3 text-right font-mono">$0.0135/min</td>
                      <td className="py-3 text-right text-sm" style={{ color: 'var(--muted)' }}>
                        ~$0.81/hour
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">Storage (after 30 days)</td>
                      <td className="py-3 text-right font-mono">$0.003/min</td>
                      <td className="py-3 text-right text-sm" style={{ color: 'var(--muted)' }}>
                        ~$0.18/hour stored
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">Individual Tracks</td>
                      <td className="py-3 text-right font-mono">+20%</td>
                      <td className="py-3 text-right text-sm" style={{ color: 'var(--muted)' }}>
                        Added to base recording
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  Streaming Costs
                </h3>
                <table className="w-full" style={{ color: 'var(--text)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="py-2 text-left">Feature</th>
                      <th className="py-2 text-right">Cost</th>
                      <th className="py-2 text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">RTMP Streaming</td>
                      <td className="py-3 text-right font-mono">$0.015/min</td>
                      <td className="py-3 text-right text-sm" style={{ color: 'var(--muted)' }}>
                        ~$0.90/hour
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">HLS Streaming</td>
                      <td className="py-3 text-right font-mono">$0.03/min</td>
                      <td className="py-3 text-right text-sm" style={{ color: 'var(--muted)' }}>
                        ~$1.80/hour
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  Video Call Costs
                </h3>
                <table className="w-full" style={{ color: 'var(--text)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="py-2 text-left">Feature</th>
                      <th className="py-2 text-right">Cost</th>
                      <th className="py-2 text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">Participant Minutes</td>
                      <td className="py-3 text-right font-mono">$0.004/min</td>
                      <td className="py-3 text-right text-sm" style={{ color: 'var(--muted)' }}>
                        Per participant
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">Free Tier</td>
                      <td className="py-3 text-right font-mono">10,000 min/mo</td>
                      <td className="py-3 text-right text-sm" style={{ color: 'var(--muted)' }}>
                        ~166 hours
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-lg p-4" style={{ background: 'rgba(232, 93, 59, 0.1)' }}>
                <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--text)' }}>
                  <AlertCircle className="mt-0.5 h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <span>
                    <strong>Note:</strong> Costs shown are base rates. Volume discounts available
                    for high usage. Actual costs will be reflected in your subscription tier
                    pricing.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div
            className="mt-8 rounded-xl p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2
              className="mb-6 text-2xl font-bold"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
            >
              Pro Tips
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                  Recording Best Practices
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <li>• Use a stable internet connection (5+ Mbps upload)</li>
                  <li>• Close unnecessary applications to free up resources</li>
                  <li>• Use headphones to prevent audio feedback</li>
                  <li>• Test your setup before important sessions</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                  Streaming Tips
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <li>• Schedule streams in advance for better reach</li>
                  <li>• Monitor chat for audience engagement</li>
                  <li>• Use lower quality settings for unstable connections</li>
                  <li>• Have a backup streaming key ready</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
