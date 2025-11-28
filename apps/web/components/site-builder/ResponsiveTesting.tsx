'use client';

import { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Maximize2,
  RotateCw,
  Ruler,
  Zap,
  Eye,
  Grid3x3,
  ImageIcon,
} from 'lucide-react';

interface ResponsiveTestingProps {
  url: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'custom';
type Orientation = 'portrait' | 'landscape';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  type: DeviceType;
  icon: typeof Smartphone;
  userAgent: string;
}

const devicePresets: DevicePreset[] = [
  {
    name: 'Desktop 1920',
    width: 1920,
    height: 1080,
    type: 'desktop',
    icon: Monitor,
    userAgent: 'Desktop',
  },
  {
    name: 'Desktop 1440',
    width: 1440,
    height: 900,
    type: 'desktop',
    icon: Monitor,
    userAgent: 'Desktop',
  },
  {
    name: 'MacBook Pro',
    width: 1512,
    height: 982,
    type: 'desktop',
    icon: Monitor,
    userAgent: 'Desktop',
  },
  {
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    type: 'tablet',
    icon: Tablet,
    userAgent: 'iPad',
  },
  {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    type: 'tablet',
    icon: Tablet,
    userAgent: 'iPad',
  },
  {
    name: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
    type: 'mobile',
    icon: Smartphone,
    userAgent: 'iPhone',
  },
  {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    type: 'mobile',
    icon: Smartphone,
    userAgent: 'iPhone',
  },
  {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    type: 'mobile',
    icon: Smartphone,
    userAgent: 'iPhone',
  },
  {
    name: 'Galaxy S23',
    width: 360,
    height: 780,
    type: 'mobile',
    icon: Smartphone,
    userAgent: 'Android',
  },
];

export function ResponsiveTesting({ url }: ResponsiveTestingProps) {
  const [selectedDevice, setSelectedDevice] = useState(devicePresets[0]);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(800);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [zoom, setZoom] = useState(1);

  const width =
    selectedDevice.type === 'custom'
      ? customWidth
      : orientation === 'landscape'
        ? selectedDevice.height
        : selectedDevice.width;

  const height =
    selectedDevice.type === 'custom'
      ? customHeight
      : orientation === 'landscape'
        ? selectedDevice.width
        : selectedDevice.height;

  const canRotate = selectedDevice.type !== 'desktop' && selectedDevice.type !== 'custom';

  const handleRotate = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Controls Bar */}
      <div
        className="flex flex-wrap items-center gap-4 px-4 py-3"
        style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Device Presets */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDevice.name}
            onChange={(e) => {
              const device = devicePresets.find((d) => d.name === e.target.value);
              if (device) {
                setSelectedDevice(device);
                setOrientation('portrait');
              }
            }}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {devicePresets.map((device) => (
              <option key={device.name} value={device.name}>
                {device.name}
              </option>
            ))}
          </select>

          {/* Quick Device Type Buttons */}
          <div
            className="flex rounded-lg p-1"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setSelectedDevice(devicePresets[1])}
              className="rounded p-2 transition-colors hover:bg-white/10"
              style={{
                color: selectedDevice.type === 'desktop' ? 'var(--accent)' : 'var(--muted)',
              }}
              title="Desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setSelectedDevice(devicePresets[3])}
              className="rounded p-2 transition-colors hover:bg-white/10"
              style={{ color: selectedDevice.type === 'tablet' ? 'var(--accent)' : 'var(--muted)' }}
              title="Tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setSelectedDevice(devicePresets[5])}
              className="rounded p-2 transition-colors hover:bg-white/10"
              style={{ color: selectedDevice.type === 'mobile' ? 'var(--accent)' : 'var(--muted)' }}
              title="Mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        {/* Orientation */}
        {canRotate && (
          <button
            onClick={handleRotate}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10"
            style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
            title="Rotate device"
          >
            <RotateCw size={16} />
            {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
          </button>
        )}

        {/* Dimensions Display */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-sm"
          style={{ background: 'var(--bg)', color: 'var(--muted)' }}
        >
          <Ruler size={14} />
          {width} × {height}
        </div>

        {/* Divider */}
        <div className="h-6 w-px" style={{ background: 'var(--border)' }} />

        {/* Testing Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`rounded-lg p-2 text-sm transition-colors ${showGrid ? 'bg-white/10' : ''}`}
            style={{ color: showGrid ? 'var(--accent)' : 'var(--muted)' }}
            title="Toggle grid overlay"
          >
            <Grid3x3 size={16} />
          </button>

          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`rounded-lg p-2 text-sm transition-colors ${
              showRulers ? 'bg-white/10' : ''
            }`}
            style={{ color: showRulers ? 'var(--accent)' : 'var(--muted)' }}
            title="Toggle rulers"
          >
            <Ruler size={16} />
          </button>

          <button
            onClick={() => setTouchMode(!touchMode)}
            className={`rounded-lg p-2 text-sm transition-colors ${touchMode ? 'bg-white/10' : ''}`}
            style={{ color: touchMode ? 'var(--accent)' : 'var(--muted)' }}
            title="Simulate touch events"
          >
            <Zap size={16} />
          </button>
        </div>

        {/* Zoom Control */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            Zoom:
          </span>
          <input
            type="range"
            min="0.25"
            max="1"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24"
            style={{ accentColor: 'var(--accent)' }}
          />
          <span className="w-12 text-sm font-medium" style={{ color: 'var(--text)' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Preview Area */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-auto p-8"
        style={{ background: 'var(--bg)' }}
      >
        {/* Rulers */}
        {showRulers && (
          <>
            {/* Horizontal Ruler */}
            <div
              className="absolute left-0 top-0 h-6 w-full"
              style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}
            >
              {Array.from({ length: Math.ceil(width / 100) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${i * 100 * zoom}px`, color: 'var(--muted)' }}
                >
                  <div className="h-3 w-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs">{i * 100}</span>
                </div>
              ))}
            </div>

            {/* Vertical Ruler */}
            <div
              className="absolute left-0 top-0 h-full w-6"
              style={{ background: 'var(--panel)', borderRight: '1px solid var(--border)' }}
            >
              {Array.from({ length: Math.ceil(height / 100) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute flex items-center"
                  style={{ top: `${i * 100 * zoom}px`, color: 'var(--muted)' }}
                >
                  <div className="h-px w-3" style={{ background: 'var(--border)' }} />
                  <span className="text-xs" style={{ writingMode: 'vertical-lr' }}>
                    {i * 100}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Device Frame */}
        <div
          className="relative shadow-2xl transition-all"
          style={{
            width: width * zoom,
            height: height * zoom,
            marginLeft: showRulers ? '24px' : '0',
            marginTop: showRulers ? '24px' : '0',
          }}
        >
          {/* Device Frame Border (for mobile/tablet) */}
          {selectedDevice.type !== 'desktop' && (
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                border: '12px solid #1a1a1a',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {/* Notch for mobile */}
              {selectedDevice.type === 'mobile' && orientation === 'portrait' && (
                <div
                  className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl"
                  style={{ background: '#1a1a1a' }}
                />
              )}
            </div>
          )}

          {/* Grid Overlay */}
          {showGrid && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 49px, var(--accent) 49px, var(--accent) 50px),
                  repeating-linear-gradient(90deg, transparent, transparent 49px, var(--accent) 49px, var(--accent) 50px)
                `,
                opacity: 0.1,
                zIndex: 5,
              }}
            />
          )}

          {/* iframe Preview */}
          <iframe
            src={url}
            className="h-full w-full"
            style={{
              border: 'none',
              borderRadius: selectedDevice.type !== 'desktop' ? '12px' : '0',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: width,
              height: height,
            }}
            title={`Preview ${selectedDevice.name}`}
          />
        </div>

        {/* Device Info Badge */}
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <selectedDevice.icon size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--text)' }}>{selectedDevice.name}</span>
          <span style={{ color: 'var(--muted)' }}>•</span>
          <span style={{ color: 'var(--muted)' }}>
            {width} × {height}
          </span>
        </div>
      </div>

      {/* Testing Checklist */}
      <div
        className="px-4 py-3"
        style={{ background: 'var(--panel)', borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="font-medium" style={{ color: 'var(--text)' }}>
            Quick Test:
          </span>
          <span>✓ Text readable</span>
          <span>✓ Buttons tappable</span>
          <span>✓ Images load</span>
          <span>✓ No horizontal scroll</span>
          <span>✓ Forms usable</span>
        </div>
      </div>
    </div>
  );
}
