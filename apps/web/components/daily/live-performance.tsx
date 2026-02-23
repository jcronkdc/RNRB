'use client';

import { Card, Button } from '@cronkwaters/ui';
import {
  useLiveStreaming,
  useDaily,
  useParticipantCounts,
  useLocalParticipant,
  DailyVideo,
} from '@daily-co/daily-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  X,
  Users,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Settings,
  AlertCircle,
  Wifi,
  WifiOff,
} from '@/components/ui/custom-icons';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

import { formatDateTime, formatNumber } from '@/lib/format-date';

interface LivePerformanceProps {
  performanceName: string;
  description?: string;
  scheduledTime?: Date;
  ticketUrl?: string;
}

export function LivePerformance({
  performanceName,
  description,
  scheduledTime,
  ticketUrl,
}: LivePerformanceProps) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantCounts = useParticipantCounts();
  const { isLiveStreaming, startLiveStreaming, stopLiveStreaming, updateLiveStreaming, errorMsg } =
    useLiveStreaming();

  const [streamConfig, setStreamConfig] = useState({
    rtmpUrl: '',
    streamKey: '',
    platform: 'youtube' as 'youtube' | 'twitch' | 'facebook' | 'custom',
    quality: 'high' as 'low' | 'medium' | 'high' | 'ultra',
    showChat: true,
    recordStream: true,
  });

  const [viewerCount, setViewerCount] = useState(0);
  const [streamStartTime, setStreamStartTime] = useState<Date | null>(null);
  const [streamDuration, setStreamDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; user: string; message: string; timestamp: Date }>
  >([]);

  // Use refs to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const viewerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, []);

  // Simulate viewer count updates - Optimized with cleanup
  useEffect(() => {
    if (!isLiveStreaming) {
      if (viewerIntervalRef.current) {
        clearInterval(viewerIntervalRef.current);
        viewerIntervalRef.current = null;
      }
      return;
    }

    viewerIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      setViewerCount((prev) => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(0, prev + change);
      });
    }, 5000);

    return () => {
      if (viewerIntervalRef.current) {
        clearInterval(viewerIntervalRef.current);
        viewerIntervalRef.current = null;
      }
    };
  }, [isLiveStreaming]);

  // Calculate stream duration - Optimized with cleanup
  useEffect(() => {
    if (!isLiveStreaming || !streamStartTime) {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setStreamDuration(0);
      return;
    }

    durationIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      const now = new Date();
      const duration = Math.floor((now.getTime() - streamStartTime.getTime()) / 1000);
      setStreamDuration(duration);
    }, 1000);

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isLiveStreaming, streamStartTime]);

  // Format duration - Memoized
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoize formatted values
  const formattedDuration = useMemo(
    () => formatDuration(streamDuration),
    [streamDuration, formatDuration]
  );
  const formattedViewerCount = useMemo(() => formatNumber(viewerCount), [viewerCount]);
  const formattedPeakViewers = useMemo(
    () => formatNumber(Math.max(viewerCount, Math.floor(viewerCount * 1.3))),
    [viewerCount]
  );
  const formattedReactions = useMemo(
    () => formatNumber(Math.floor(viewerCount * 8.2)),
    [viewerCount]
  );
  const formattedHearts = useMemo(() => formatNumber(Math.floor(viewerCount * 2.5)), [viewerCount]);

  // Get platform-specific RTMP URL - Memoized
  const getPlatformUrl = useCallback(
    (platform: string) => {
      switch (platform) {
        case 'youtube':
          return 'rtmp://a.rtmp.youtube.com/live2';
        case 'twitch':
          return 'rtmp://live.twitch.tv/app';
        case 'facebook':
          return 'rtmps://live-api-s.facebook.com:443/rtmp';
        default:
          return streamConfig.rtmpUrl;
      }
    },
    [streamConfig.rtmpUrl]
  );

  // Memoize video bitrate calculation
  const videoBitrate = useMemo(() => {
    switch (streamConfig.quality) {
      case 'ultra':
        return 3000;
      case 'high':
        return 2000;
      case 'medium':
        return 1000;
      case 'low':
        return 500;
      default:
        return 2000;
    }
  }, [streamConfig.quality]);

  // Start live stream - Memoized
  const handleStartStream = useCallback(async () => {
    if (!streamConfig.streamKey.trim() && streamConfig.platform !== 'custom') {
      alert('Please enter your stream key');
      return;
    }

    const rtmpUrl =
      streamConfig.platform === 'custom'
        ? streamConfig.rtmpUrl
        : `${getPlatformUrl(streamConfig.platform)}/${streamConfig.streamKey}`;

    try {
      await startLiveStreaming({
        rtmpUrl,
        layout: {
          preset: 'default',
        },
        videoBitrate,
        audioBitrate: 128,
      });

      setStreamStartTime(new Date());
      setStreamDuration(0);
      setViewerCount(Math.floor(Math.random() * 50) + 10);
    } catch (err) {
      console.error('Failed to start streaming:', err);
    }
  }, [
    startLiveStreaming,
    streamConfig.streamKey,
    streamConfig.platform,
    streamConfig.rtmpUrl,
    getPlatformUrl,
    videoBitrate,
  ]);

  // Stop live stream - Memoized
  const handleStopStream = useCallback(async () => {
    try {
      await stopLiveStreaming();
      setStreamStartTime(null);
      setStreamDuration(0);
      setViewerCount(0);
    } catch (err) {
      console.error('Failed to stop streaming:', err);
    }
  }, [stopLiveStreaming]);

  // Memoize config update handlers
  const updatePlatform = useCallback((value: string) => {
    setStreamConfig((prev) => ({ ...prev, platform: value as any }));
  }, []);

  const updateStreamKey = useCallback((value: string) => {
    setStreamConfig((prev) => ({ ...prev, streamKey: value }));
  }, []);

  const updateRtmpUrl = useCallback((value: string) => {
    setStreamConfig((prev) => ({ ...prev, rtmpUrl: value }));
  }, []);

  const updateQuality = useCallback((value: string) => {
    setStreamConfig((prev) => ({ ...prev, quality: value as any }));
  }, []);

  const updateShowChat = useCallback((checked: boolean) => {
    setStreamConfig((prev) => ({ ...prev, showChat: checked }));
  }, []);

  const updateRecordStream = useCallback((checked: boolean) => {
    setStreamConfig((prev) => ({ ...prev, recordStream: checked }));
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  // Memoized chat message handler
  const handleChatMessage = useCallback((message: string) => {
    if (!message.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: 'Artist',
        message: message.trim(),
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Performance Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold">{performanceName}</h2>
            {description && <p className="mb-4 text-muted-foreground">{description}</p>}
            {scheduledTime && !isLiveStreaming && (
              <p className="text-sm">Scheduled for: {formatDateTime(scheduledTime)}</p>
            )}
          </div>

          {ticketUrl && !isLiveStreaming && (
            <Button variant="default" onClick={() => window.open(ticketUrl, '_blank')}>
              Get Tickets
            </Button>
          )}
        </div>

        {/* Live Status */}
        {isLiveStreaming && (
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-red-500" />
              </div>
              <span className="font-semibold text-red-500">LIVE</span>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{formattedViewerCount} viewers</span>
            </div>

            <div className="flex items-center gap-2">
              {connectionQuality === 'good' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : connectionQuality === 'fair' ? (
                <Wifi className="h-4 w-4 text-yellow-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{formattedDuration}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Video/Stream Preview */}
        <div className="space-y-4 lg:col-span-2">
          {/* Video Container */}
          <Card className="relative aspect-video overflow-hidden bg-black">
            {localParticipant ? (
              <DailyVideo
                sessionId={localParticipant.session_id}
                type="video"
                mirror={false}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-white/50">Camera preview will appear here</p>
              </div>
            )}

            {/* Overlay Stats */}
            {isLiveStreaming && (
              <div className="absolute right-4 top-4 rounded-lg bg-black/70 px-3 py-2 text-white">
                <p className="text-xs">Stream Health</p>
                <p className="font-mono text-sm">{connectionQuality.toUpperCase()}</p>
              </div>
            )}
          </Card>

          {/* Stream Controls */}
          <Card className="p-4">
            {!isLiveStreaming ? (
              <div className="space-y-4">
                {/* Platform Selection */}
                <div className="flex items-center gap-4">
                  <select
                    value={streamConfig.platform}
                    onChange={(e) => updatePlatform(e.target.value)}
                    className="flex-1 rounded-md border px-3 py-2"
                  >
                    <option value="youtube">YouTube Live</option>
                    <option value="twitch">Twitch</option>
                    <option value="facebook">Facebook Live</option>
                    <option value="custom">Custom RTMP</option>
                  </select>

                  <Button variant="ghost" size="icon" onClick={toggleSettings}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stream Key Input */}
                {streamConfig.platform !== 'custom' ? (
                  <input
                    type="password"
                    placeholder="Enter your stream key"
                    value={streamConfig.streamKey}
                    onChange={(e) => updateStreamKey(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Enter RTMP URL"
                    value={streamConfig.rtmpUrl}
                    onChange={(e) => updateRtmpUrl(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  />
                )}

                {/* Settings Panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 border-t pt-4">
                        <div>
                          <label className="text-sm font-medium">Stream Quality</label>
                          <select
                            value={streamConfig.quality}
                            onChange={(e) => updateQuality(e.target.value)}
                            className="mt-1 w-full rounded-md border px-3 py-2"
                          >
                            <option value="low">Low (480p)</option>
                            <option value="medium">Medium (720p)</option>
                            <option value="high">High (1080p)</option>
                            <option value="ultra">Ultra (4K)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={streamConfig.showChat}
                              onChange={(e) => updateShowChat(e.target.checked)}
                            />
                            <span className="text-sm">Enable chat</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={streamConfig.recordStream}
                              onChange={(e) => updateRecordStream(e.target.checked)}
                            />
                            <span className="text-sm">Record stream</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Start Button */}
                <Button
                  onClick={handleStartStream}
                  className="w-full gap-2"
                  size="lg"
                  disabled={!localParticipant}
                >
                  <Radio className="h-5 w-5" />
                  Go Live
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="destructive" onClick={handleStopStream} className="gap-2">
                    <X className="h-4 w-4" />
                    End Stream
                  </Button>

                  <Button variant="secondary" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">{formattedHearts}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Chat/Interaction Panel */}
        <div className="space-y-4">
          {/* Viewer Engagement */}
          <Card className="p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4" />
              Audience Engagement
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Viewers</span>
                <span className="font-semibold">{formattedPeakViewers}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chat Messages</span>
                <span className="font-semibold">{chatMessages.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reactions</span>
                <span className="font-semibold">{formattedReactions}</span>
              </div>
            </div>
          </Card>

          {/* Live Chat */}
          {streamConfig.showChat && isLiveStreaming && (
            <Card className="p-4">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </h3>

              <div className="mb-4 h-64 space-y-2 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-semibold">{msg.user}:</span>{' '}
                    <span className="text-muted-foreground">{msg.message}</span>
                  </div>
                ))}
              </div>

              <input
                type="text"
                placeholder="Type a message..."
                className="w-full rounded-md border px-3 py-2 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleChatMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
