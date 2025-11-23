'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, Palette, Square, Circle, Type as TypeIcon, Minus } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import Ably from 'ably';

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
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [tempLine, setTempLine] = useState<number[]>([]);

  // Initialize Ably
  useEffect(() => {
    const initAbly = async () => {
      const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
      if (!ablyKey) {
        console.warn('ABLY_API_KEY not configured');
        return;
      }

      const ably = new Ably.Realtime({
        key: ablyKey,
        clientId: currentUser.userId,
      });

      const whiteboardChannel = ably.channels.get(channelName);
      setChannel(whiteboardChannel);

      // Subscribe to drawing events
      whiteboardChannel.subscribe('draw', (message) => {
        const element: DrawingElement = message.data;
        setElements((prev) => [...prev, element]);
      });

      whiteboardChannel.subscribe('clear', () => {
        setElements([]);
      });

      // Get drawing history
      whiteboardChannel.history({ limit: 100 }, (err, resultPage) => {
        if (err || !resultPage) return;
        
        const historicalElements: DrawingElement[] = resultPage.items
          .reverse()
          .filter((msg) => msg.name === 'draw')
          .map((msg) => msg.data);
        
        setElements(historicalElements);
      });

      return () => {
        whiteboardChannel.unsubscribe();
        ably.close();
      };
    };

    initAbly();
  }, [channelName, currentUser.userId]);

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
    if (!isDrawing || !channel || tempLine.length < 2) {
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
    channel.publish('draw', element);

    // Add locally
    setElements((prev) => [...prev, element]);
    setIsDrawing(false);
    setTempLine([]);
  };

  const handleClear = () => {
    if (!channel) return;
    channel.publish('clear', {});
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
      <div className="flex items-center gap-4 p-4 bg-surface-muted border border-border rounded-xl">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant={currentTool === 'pen' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentTool('pen')}
            className="w-10 h-10 p-0"
          >
            <Palette className="w-4 h-4" />
          </Button>
          <Button
            variant={currentTool === 'rect' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentTool('rect')}
            className="w-10 h-10 p-0"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={currentTool === 'circle' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentTool('circle')}
            className="w-10 h-10 p-0"
          >
            <Circle className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Colors */}
        <div className="flex items-center gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                currentColor === color ? 'border-brand-primary scale-110' : 'border-border'
              } transition-transform`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Stroke Width */}
        <div className="flex items-center gap-2">
          <Minus className="w-4 h-4 text-muted-foreground" />
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
          <Download className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button variant="secondary" size="sm" onClick={handleClear}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Canvas */}
      <div className="border-2 border-border rounded-xl overflow-hidden">
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

      <p className="text-xs text-muted-foreground text-center">
        All team members can see your drawings in real-time • Changes sync via Ably
      </p>
    </div>
  );
}
