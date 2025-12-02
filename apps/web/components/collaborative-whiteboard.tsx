'use client';

import { Button } from '@cronkwaters/ui';
import type { RealtimeChannel } from 'ably';
import { Trash2, Download, Palette, Square, Circle, Minus } from '@/components/ui/custom-icons';
import { useEffect, useRef, useState } from 'react';

import { useAblyClient } from '@/hooks/use-ably-client';

interface CollaborativeWhiteboardProps {
  channelName: string;
  currentUser: {
    userId: string;
    userName: string;
  };
  width?: number;
  height?: number;
}

type DrawingElement = {
  id: string;
  type: 'line' | 'rect' | 'circle' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  userId: string;
  userName: string;
};

export function CollaborativeWhiteboard({
  channelName,
  currentUser,
  width = 800,
  height = 500,
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentColor, setCurrentColor] = useState('#ff6b35');
  const [currentTool, setCurrentTool] = useState<'pen' | 'rect' | 'circle' | 'text'>('pen');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [tempLine, setTempLine] = useState<number[]>([]);

  // Use shared Ably client from AblyProvider (NO separate connections!)
  const { client: ablyClient, isConnected } = useAblyClient(currentUser.userId);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Initialize channel when shared client is ready
  useEffect(() => {
    if (!ablyClient || !isConnected) return;

    let mounted = true;

    const initChannel = async () => {
      try {
        const whiteboardChannel = ablyClient.channels.get(channelName);
        channelRef.current = whiteboardChannel;

        // Subscribe to drawing events
        whiteboardChannel.subscribe('draw', (message) => {
          if (!mounted) return;
          const element: DrawingElement = message.data;
          setElements((prev) => [...prev, element]);
        });

        whiteboardChannel.subscribe('clear', () => {
          if (!mounted) return;
          setElements([]);
        });

        // Get drawing history
        const result = await whiteboardChannel.history({ limit: 100 });
        if (mounted && result) {
          const historicalElements: DrawingElement[] = result.items
            .reverse()
            .filter((msg: any) => msg.name === 'draw')
            .map((msg: any) => msg.data);

          setElements(historicalElements);
        }
      } catch (error) {
        console.error('Whiteboard initialization error:', error);
      }
    };

    initChannel();

    // Cleanup - only unsubscribe, don't close shared client
    return () => {
      mounted = false;
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
    };
  }, [channelName, ablyClient, isConnected]);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw all elements
    elements.forEach((element) => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (element.type === 'line' && element.points) {
        ctx.beginPath();
        for (let i = 0; i < element.points.length; i += 2) {
          if (i === 0) {
            ctx.moveTo(element.points[i], element.points[i + 1]);
          } else {
            ctx.lineTo(element.points[i], element.points[i + 1]);
          }
        }
        ctx.stroke();
      } else if (element.type === 'rect' && element.x !== undefined && element.y !== undefined) {
        ctx.strokeRect(element.x, element.y, element.width || 0, element.height || 0);
      } else if (element.type === 'circle' && element.x !== undefined && element.y !== undefined) {
        ctx.beginPath();
        const radius = Math.sqrt(
          Math.pow(element.width || 0, 2) + Math.pow(element.height || 0, 2)
        );
        ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw temporary line while drawing
    if (tempLine.length > 0) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      for (let i = 0; i < tempLine.length; i += 2) {
        if (i === 0) {
          ctx.moveTo(tempLine[i], tempLine[i + 1]);
        } else {
          ctx.lineTo(tempLine[i], tempLine[i + 1]);
        }
      }
      ctx.stroke();
    }
  }, [elements, tempLine, currentColor, strokeWidth, width, height]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setTempLine([x, y]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTempLine((prev) => [...prev, x, y]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !channelRef.current || tempLine.length < 2) {
      setIsDrawing(false);
      setTempLine([]);
      return;
    }

    const element: DrawingElement = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'line',
      points: tempLine,
      color: currentColor,
      strokeWidth: strokeWidth,
      userId: currentUser.userId,
      userName: currentUser.userName,
    };

    // Publish to Ably
    channelRef.current.publish('draw', element);

    // Add locally
    setElements((prev) => [...prev, element]);
    setIsDrawing(false);
    setTempLine([]);
  };

  const handleClear = () => {
    if (!channelRef.current) return;
    channelRef.current.publish('clear', {});
    setElements([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = ['#ff6b35', '#f7931e', '#fdc82f', '#8ac926', '#1982c4', '#6a4c93', '#ffffff'];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-muted p-4">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant={currentTool === 'pen' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentTool('pen')}
            className="h-10 w-10 p-0"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'rect' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentTool('rect')}
            className="h-10 w-10 p-0"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'circle' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentTool('circle')}
            className="h-10 w-10 p-0"
          >
            <Circle className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Colors */}
        <div className="flex items-center gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`h-8 w-8 rounded-full border-2 ${
                currentColor === color ? 'scale-110 border-brand-primary' : 'border-border'
              } transition-transform`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Stroke Width */}
        <div className="flex items-center gap-2">
          <Minus className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-24"
          />
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button variant="secondary" size="sm" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Canvas */}
      <div className="overflow-hidden rounded-xl border-2 border-border">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair"
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        All team members can see your drawings in real-time • Changes sync via Ably
      </p>
    </div>
  );
}
