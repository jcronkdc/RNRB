'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  useLiveStreaming,
  useDaily,
  useParticipantCounts,
  useLocalParticipant,
  DailyVideo,
  DailyAudio,
} from '@daily-co/daily-react';
import { 
  Radio, 
  X,
  Users,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Settings,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';

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
  ticketUrl
}: LivePerformanceProps) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantCounts = useParticipantCounts();
  const { 
    isLiveStreaming, 
    startLiveStreaming, 
    stopLiveStreaming,
    updateLiveStreaming,
    errorMsg 
  } = useLiveStreaming();

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
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, timestamp: Date}>>([]);

  // Simulate viewer count updates
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(0, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Calculate stream duration
  useEffect(() => {
    if (!isLiveStreaming || !streamStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - streamStartTime.getTime()) / 1000);
      setStreamDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, streamStartTime]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get platform-specific RTMP URL
  const getPlatformUrl = (platform: string) => {
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
  };

  // Start live stream
  const handleStartStream = useCallback(async () => {
    if (!streamConfig.streamKey && streamConfig.platform !== 'custom') {
      alert('Please enter your stream key');
      return;
    }

    const rtmpUrl = streamConfig.platform === 'custom' 
      ? streamConfig.rtmpUrl 
      : `${getPlatformUrl(streamConfig.platform)}/${streamConfig.streamKey}`;

    try {
      await startLiveStreaming({
        rtmpUrl,
        layout: {
          preset: 'default',
          composition_params: {
            showParticipantLabels: false,
          }
        },
        videoBitrate: streamConfig.quality === 'ultra' ? 3000 : 
                     streamConfig.quality === 'high' ? 2000 : 
                     streamConfig.quality === 'medium' ? 1000 : 500,
        audioBitrate: 128,
      });
      
      setStreamStartTime(new Date());
      setStreamDuration(0);
      setViewerCount(Math.floor(Math.random() * 50) + 10);
    } catch (err) {
      console.error('Failed to start streaming:', err);
    }
  }, [startLiveStreaming, streamConfig]);

  // Stop live stream
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

  return (
    <div className="space-y-6">
      {/* Performance Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{performanceName}</h2>
            {description && (
              <p className="text-muted-foreground mb-4">{description}</p>
            )}
            {scheduledTime && !isLiveStreaming && (
              <p className="text-sm">
                Scheduled for: {scheduledTime.toLocaleString()}
              </p>
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
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="font-semibold text-red-500">LIVE</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{viewerCount.toLocaleString()} viewers</span>
            </div>
            
            <div className="flex items-center gap-2">
              {connectionQuality === 'good' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : connectionQuality === 'fair' ? (
                <Wifi className="h-4 w-4 text-yellow-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{formatDuration(streamDuration)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video/Stream Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Container */}
          <Card className="aspect-video bg-black relative overflow-hidden">
            {localParticipant ? (
              <DailyVideo 
                sessionId={localParticipant.session_id} 
                type="video"
                mirror={false}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/50">Camera preview will appear here</p>
              </div>
            )}
            
            {/* Overlay Stats */}
            {isLiveStreaming && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                <p className="text-xs">Stream Health</p>
                <p className="text-sm font-mono">{connectionQuality.toUpperCase()}</p>
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
                    onChange={(e) => setStreamConfig({
                      ...streamConfig,
                      platform: e.target.value as any
                    })}
                    className="flex-1 px-3 py-2 border rounded-md"
                  >
                    <option value="youtube">YouTube Live</option>
                    <option value="twitch">Twitch</option>
                    <option value="facebook">Facebook Live</option>
                    <option value="custom">Custom RTMP</option>
                  </select>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stream Key Input */}
                {streamConfig.platform !== 'custom' ? (
                  <input
                    type="password"
                    placeholder="Enter your stream key"
                    value={streamConfig.streamKey}
                    onChange={(e) => setStreamConfig({
                      ...streamConfig,
                      streamKey: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Enter RTMP URL"
                    value={streamConfig.rtmpUrl}
                    onChange={(e) => setStreamConfig({
                      ...streamConfig,
                      rtmpUrl: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-md"
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
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <label className="text-sm font-medium">Stream Quality</label>
                          <select
                            value={streamConfig.quality}
                            onChange={(e) => setStreamConfig({
                              ...streamConfig,
                              quality: e.target.value as any
                            })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
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
                              onChange={(e) => setStreamConfig({
                                ...streamConfig,
                                showChat: e.target.checked
                              })}
                            />
                            <span className="text-sm">Enable chat</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={streamConfig.recordStream}
                              onChange={(e) => setStreamConfig({
                                ...streamConfig,
                                recordStream: e.target.checked
                              })}
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
                  <Button
                    variant="destructive"
                    onClick={handleStopStream}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    End Stream
                  </Button>
                  
                  <Button variant="secondary" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">
                    {Math.floor(viewerCount * 2.5).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {errorMsg}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Chat/Interaction Panel */}
        <div className="space-y-4">
          {/* Viewer Engagement */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Audience Engagement
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Viewers</span>
                <span className="font-semibold">
                  {Math.max(viewerCount, Math.floor(viewerCount * 1.3)).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chat Messages</span>
                <span className="font-semibold">{chatMessages.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reactions</span>
                <span className="font-semibold">
                  {Math.floor(viewerCount * 8.2).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Live Chat */}
          {streamConfig.showChat && isLiveStreaming && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </h3>
              
              <div className="h-64 overflow-y-auto space-y-2 mb-4">
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
                className="w-full px-3 py-2 border rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setChatMessages([...chatMessages, {
                      id: Date.now().toString(),
                      user: 'Artist',
                      message: e.currentTarget.value,
                      timestamp: new Date()
                    }]);
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
