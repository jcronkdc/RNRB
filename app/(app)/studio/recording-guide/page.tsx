'use client';

import { motion } from 'framer-motion';
import { 
  Disc, 
  Video, 
  Mic, 
  MonitorUp, 
  Radio, 
  Download,
  Cloud,
  HardDrive,
  Settings,
  Shield,
  Zap,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '@cronkwaters/ui';

export default function RecordingGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Professional Recording Studio</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about our advanced recording, streaming, and collaboration features
          </p>
        </div>

        {/* Overview Section */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-red-500/10 to-purple-500/10">
          <h2 className="text-3xl font-bold mb-6">🎙️ Studio Features Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Disc className="h-5 w-5 text-red-500" />
                Cloud Recording
              </h3>
              <p className="text-muted-foreground">
                HD video & audio recording in MP4/HLS format with custom layouts
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Radio className="h-5 w-5 text-blue-500" />
                Live Streaming
              </h3>
              <p className="text-muted-foreground">
                Stream to YouTube, Twitch, Facebook, or custom RTMP endpoints
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Collaboration
              </h3>
              <p className="text-muted-foreground">
                Multi-participant sessions with screen sharing and real-time chat
              </p>
            </div>
          </div>
        </Card>

        {/* Recording Features Detail */}
        <div className="space-y-8 mb-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Disc className="h-6 w-6" />
              Recording Capabilities
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Cloud Recording</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>HD Quality:</strong> Records in 1080p HD with crystal-clear audio
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Format Options:</strong> MP4 for compatibility or HLS for streaming
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Custom Layouts:</strong> Grid view, active speaker, or custom compositions
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Storage Options:</strong> Daily cloud storage or your own AWS S3 bucket
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Individual Track Recording</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Separate Tracks:</strong> Individual audio/video tracks for each participant
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Post-Production Ready:</strong> Perfect for professional editing and mixing
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>AI Integration:</strong> Ideal for transcription and content analysis
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Recording Controls</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Pause/Resume:</strong> Take breaks without creating multiple files
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Quality Settings:</strong> Choose bitrate from 1-3 Mbps for video
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Real-time Status:</strong> Live indicators and duration tracking
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Live Streaming Features */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Radio className="h-6 w-6" />
              Live Streaming Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Supported Platforms</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    YouTube Live (RTMP)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Twitch Streaming
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Facebook Live (RTMPS)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom RTMP Endpoints
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Streaming Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Up to 4K streaming quality
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time viewer analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Chat integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Stream health monitoring
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Technical Specifications */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Settings className="h-6 w-6" />
              Technical Specifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Video Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Resolution</td>
                      <td className="py-2 text-right">Up to 1920x1080 (1080p)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Frame Rate</td>
                      <td className="py-2 text-right">30 fps</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Video Codec</td>
                      <td className="py-2 text-right">H.264</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Bitrate</td>
                      <td className="py-2 text-right">500 Kbps - 3 Mbps</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Audio Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Sample Rate</td>
                      <td className="py-2 text-right">48 kHz</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Channels</td>
                      <td className="py-2 text-right">Stereo</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Audio Codec</td>
                      <td className="py-2 text-right">AAC</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Bitrate</td>
                      <td className="py-2 text-right">128 Kbps</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* How It Works */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Zap className="h-6 w-6" />
              How It Works
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. Starting a Session</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Click "Start Recording" or "Go Live" from the Studio page</li>
                  <li>A secure room is automatically created with unique credentials</li>
                  <li>Grant camera and microphone permissions when prompted</li>
                  <li>Invite collaborators by sharing the session link</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2. During the Session</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Use the control bar to manage video, audio, and screen sharing</li>
                  <li>Start/stop recording or streaming as needed</li>
                  <li>Monitor participant status and connection quality</li>
                  <li>Use chat for text communication during the session</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. After Recording</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Recordings are automatically processed and stored</li>
                  <li>Access recordings from your dashboard within minutes</li>
                  <li>Download files or share via secure links</li>
                  <li>Integrate with your DAW for post-production</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Security & Privacy */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6" />
              Security & Privacy
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Data Protection</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    End-to-end encryption for all sessions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    GDPR and CCPA compliant
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Secure token-based authentication
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Automatic data retention policies
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Access Control</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Role-based permissions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Session passwords optional
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Waiting room for approval
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Ability to remove participants
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Cost Breakdown */}
        <Card className="p-8 border-2 border-yellow-500/20 bg-yellow-500/5">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-yellow-500" />
            Cost Breakdown
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Recording Costs</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-right py-2">Cost</th>
                    <th className="text-right py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">Cloud Recording</td>
                    <td className="py-3 text-right font-mono">$0.0135/min</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">~$0.81/hour</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Storage (after 30 days)</td>
                    <td className="py-3 text-right font-mono">$0.003/min</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">~$0.18/hour stored</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Individual Tracks</td>
                    <td className="py-3 text-right font-mono">+20%</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">Added to base recording</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Streaming Costs</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-right py-2">Cost</th>
                    <th className="text-right py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">RTMP Streaming</td>
                    <td className="py-3 text-right font-mono">$0.015/min</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">~$0.90/hour</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">HLS Streaming</td>
                    <td className="py-3 text-right font-mono">$0.03/min</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">~$1.80/hour</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Video Call Costs</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-right py-2">Cost</th>
                    <th className="text-right py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">Participant Minutes</td>
                    <td className="py-3 text-right font-mono">$0.004/min</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">Per participant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Free Tier</td>
                    <td className="py-3 text-right font-mono">10,000 min/mo</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">~166 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>
                  <strong>Note:</strong> Costs shown are base rates. Volume discounts available for high usage.
                  Actual costs will be reflected in your subscription tier pricing.
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Tips */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">💡 Pro Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Recording Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use a stable internet connection (5+ Mbps upload)</li>
                <li>• Close unnecessary applications to free up resources</li>
                <li>• Use headphones to prevent audio feedback</li>
                <li>• Test your setup before important sessions</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Streaming Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Schedule streams in advance for better reach</li>
                <li>• Monitor chat for audience engagement</li>
                <li>• Use lower quality settings for unstable connections</li>
                <li>• Have a backup streaming key ready</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
