'use client';

import { useChannel, usePresence } from 'ably/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Users, Music, Mic, Square, Play, Pause } from 'lucide-react';

interface Message {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: number;
  clientId: string;
  userName?: string;
  type: 'text' | 'voice';
}

interface SongChatProps {
  channelName: string;
  songTitle: string;
  userName?: string;
}

export default function SongChat({ channelName, songTitle, userName = 'Anonymous' }: SongChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();

  const { channel } = useChannel(channelName, (message) => {
    setMessages((prev) => [...prev, {
      id: message.id || Date.now().toString(),
      text: message.data.text,
      audioUrl: message.data.audioUrl,
      audioDuration: message.data.audioDuration,
      type: message.data.type || 'text',
      timestamp: message.timestamp || Date.now(),
      clientId: message.clientId || 'unknown',
      userName: message.data.userName || message.clientId
    }]);
  });

  const { presenceData } = usePresence(channelName, {
    userName,
    status: 'writing'
  });

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    channel.publish('song-chat', {
      text: inputText,
      userName,
    });
    
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      setRecordingTime(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Update recording time every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    // Convert to base64 for transmission (temporary - will use proper storage later)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      channel.publish('song-chat', {
        type: 'voice',
        audioUrl: base64Audio,
        audioDuration: recordingTime,
        userName,
      });
      
      setRecordingTime(0);
    };
    reader.readAsDataURL(audioBlob);
  };

  return (
    <div className="flex h-[600px] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-brand-primary" />
          <h3 className="text-lg font-semibold">{songTitle}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 text-green-500" />
          <span>{presenceData?.length || 0} writing</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg bg-muted/50 p-3 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-brand-primary">
                {msg.userName || msg.clientId}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {msg.type === 'voice' && msg.audioUrl ? (
              <div className="flex items-center gap-3 p-2 bg-brand-primary/5 rounded border border-brand-primary/20">
                <Mic className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <audio controls className="flex-1" src={msg.audioUrl} />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {msg.audioDuration}s
                </span>
              </div>
            ) : (
              <p className="text-sm">{msg.text}</p>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <Music className="w-12 h-12 mx-auto opacity-20" />
              <p className="text-sm font-medium">Discuss this song here</p>
              <p className="text-xs">
                Talk about lyrics, melody ideas, arrangement thoughts...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-muted/30">
        {isRecording ? (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-sm font-semibold">
                Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              STOP & SEND
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={startRecording}
                className="px-4 py-2 border border-border hover:border-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                title="Record voice message"
              >
                <Mic className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type message or record voice note..."
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="rounded-lg bg-brand-primary px-4 py-2 text-brand-primary-foreground transition hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Focused on "{songTitle}" - Text or voice messages • Press Enter to send
            </p>
          </>
        )}
      </div>
    </div>
  );
}

