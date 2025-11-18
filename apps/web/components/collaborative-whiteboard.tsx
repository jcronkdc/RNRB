'use client';

/**
 * Collaborative Whiteboard Component
 * 
 * Real-time drawing canvas synced via Ably
 * Use during Daily.co video calls for visual brainstorming
 * 
 * Features:
 * - Draw with mouse/touch
 * - Multiple colors and brush sizes
 * - Real-time sync across all participants
 * - Real-time collaborative cursors (see team members' cursors)
 * - Clear canvas, undo, redo
 * - Export as image
 * 
 * Perfect for: Chord diagrams, song structure sketches, setlist planning
 */

import { useEffect, useRef, useState } from 'react';
import { Realtime, Types } from 'ably';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Undo, 
  Redo, 
  Download,
  Palette,
  Circle
} from 'lucide-react';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { CursorOverlay } from '@/components/cursor-overlay';

type DrawingPoint = {
  x: number;
  y: number;
  color: string;
  size: number;
  userId: string;
};

type DrawingStroke = {
  id: string;
  points: DrawingPoint[];
  userId: string;
  userName: string;
  timestamp: number;
};

type CollaborativeWhiteboardProps = {
  channelName: string;
  currentUser: {
    userId: string;
    userName: string;
  };
  width?: number;
  height?: number;
};

export function CollaborativeWhiteboard({
  channelName,
  currentUser,
  width = 800,
  height = 600,
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6347');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [history, setHistory] = useState<DrawingStroke[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [ably, setAbly] = useState<Realtime | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Collaborative cursors
  const { remoteCursors } = useCollaborativeCursors({
    channelName: `${channelName}-cursors`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    enabled: true,
  });

  // Color palette
  const colors = [
    '#FF6347', // Tomato (brand color)
    '#000000', // Black
    '#FFFFFF', // White
    '#FF4500', // Orange Red
    '#FFD700', // Gold
    '#32CD32', // Lime Green
    '#1E90FF', // Dodger Blue
    '#FF69B4', // Hot Pink
    '#9370DB', // Medium Purple
  ];

  // Initialize Ably for real-time sync
  useEffect(() => {
    let mounted = true;
    let channel: Types.RealtimeChannelCallbacks | null = null;

    const initAbly = async () => {
      try {
        const ablyClient = new Realtime({ authUrl: '/api/ably/token' });
        if (!mounted) {
          ablyClient.close();
          return;
        }

        setAbly(ablyClient);
        channel = ablyClient.channels.get(channelName);

        // Subscribe to drawing events
        channel.subscribe('stroke', (message) => {
          if (!mounted) return;
          const stroke: DrawingStroke = message.data;
          
          // Don't add your own strokes (already added locally)
          if (stroke.userId !== currentUser.userId) {
            setStrokes(prev => [...prev, stroke]);
          }
        });

        // Subscribe to clear events
        channel.subscribe('clear', () => {
          if (!mounted) return;
          setStrokes([]);
        });

        setIsConnected(true);
      } catch (err) {
        console.error('Whiteboard Ably error:', err);
      }
    };

    initAbly();

    return () => {
      mounted = false;
      channel?.unsubscribe();
      ably?.close();
    };
  }, [channelName, currentUser.userId]);

  // Redraw canvas whenever strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw all strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke.points);
    });

    // Draw current stroke (in progress)
    if (currentStroke.length > 0) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke, width, height]);

  const drawStroke = (ctx: CanvasRenderingContext2D, points: DrawingPoint[]) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = point.color;
      ctx.lineWidth = point.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke([{
      x,
      y,
      color: tool === 'eraser' ? '#1a1a1a' : color,
      size: tool === 'eraser' ? 20 : brushSize,
      userId: currentUser.userId,
    }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke(prev => [...prev, {
      x,
      y,
      color: tool === 'eraser' ? '#1a1a1a' : color,
      size: tool === 'eraser' ? 20 : brushSize,
      userId: currentUser.userId,
    }]);
  };

  const stopDrawing = async () => {
    if (!isDrawing || currentStroke.length === 0) {
      setIsDrawing(false);
      return;
    }

    const newStroke: DrawingStroke = {
      id: `stroke_${Date.now()}_${currentUser.userId}`,
      points: currentStroke,
      userId: currentUser.userId,
      userName: currentUser.userName,
      timestamp: Date.now(),
    };

    // Add to local strokes
    setStrokes(prev => [...prev, newStroke]);

    // Broadcast to other users
    if (ably && isConnected) {
      const channel = ably.channels.get(channelName);
      await channel.publish('stroke', newStroke);
    }

    // Save to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...strokes, newStroke]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const clearCanvas = async () => {
    setStrokes([]);
    setCurrentStroke([]);
    setHistory([]);
    setHistoryIndex(-1);

    // Broadcast clear to other users
    if (ably && isConnected) {
      const channel = ably.channels.get(channelName);
      await channel.publish('clear', {});
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setStrokes(history[historyIndex - 1] || []);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setStrokes(history[historyIndex + 1] || []);
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        {/* Left: Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen' ? 'bg-brand-primary text-white' : 'hover:bg-muted'
            }`}
            title="Draw"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-brand-primary text-white' : 'hover:bg-muted'
            }`}
            title="Erase"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Color Picker */}
          <div className="flex items-center gap-1">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3" />
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-8">{brushSize}px</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={exportImage}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Export Image"
          >
            <Download className="w-4 h-4" />
          </button>

          {isConnected && (
            <div className="flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-card border border-border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair"
          style={{
            touchAction: 'none',
          }}
        />

        {/* Watermark */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-50 pointer-events-none">
          🎵 Rock N' Roll Basement
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {isConnected ? '✅ Synced in real-time' : '⏳ Connecting...'}
        </span>
        <span>
          {strokes.length} {strokes.length === 1 ? 'stroke' : 'strokes'}
        </span>
      </div>

      {/* Collaborative Cursors Overlay */}
      <CursorOverlay cursors={remoteCursors} />
    </div>
  );
}

