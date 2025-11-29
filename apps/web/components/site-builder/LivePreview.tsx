'use client';

import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LivePreviewProps {
  subdomain: string;
  refreshKey?: number;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceType, { width: number; height: number; label: string }> = {
  desktop: { width: 1280, height: 800, label: 'Desktop' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  mobile: { width: 375, height: 667, label: 'Mobile' },
};

export function LivePreview({ subdomain, refreshKey = 0 }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = `/s/${subdomain}?preview=true&t=${refreshKey}`;

  // Calculate scale to fit preview in container
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 48; // padding
      const containerHeight = container.clientHeight - 100; // header + padding
      const deviceSize = deviceSizes[device];

      const scaleX = containerWidth / deviceSize.width;
      const scaleY = containerHeight / deviceSize.height;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [device]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const deviceSize = deviceSizes[device];

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col overflow-hidden rounded-xl"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      {/* Preview Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Live Preview
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {deviceSize.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Toggle */}
          <div
            className="flex rounded-lg p-1"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            {(Object.keys(deviceSizes) as DeviceType[]).map((d) => {
              const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`rounded-md p-2 transition-colors ${
                    device === d ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                  style={{ color: device === d ? 'var(--accent)' : 'var(--muted)' }}
                  title={deviceSizes[d].label}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
            title="Refresh Preview"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Open in New Tab */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
            title="Open in New Tab"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Preview Frame Container */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        {/* Device Frame */}
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-300"
          style={{
            width: deviceSize.width * scale,
            height: deviceSize.height * scale,
            background: '#fff',
            border: device !== 'desktop' ? '8px solid #1a1a1a' : 'none',
            borderRadius: device === 'mobile' ? '32px' : device === 'tablet' ? '24px' : '8px',
          }}
        >
          {/* Notch for mobile */}
          {device === 'mobile' && (
            <div
              className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl"
              style={{ background: '#1a1a1a' }}
            />
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="h-full w-full"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: deviceSize.width,
              height: deviceSize.height,
            }}
            title="Site Preview"
          />
        </div>

        {/* Dimensions Label */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs"
          style={{ background: 'var(--panel)', color: 'var(--muted)' }}
        >
          {deviceSize.width} × {deviceSize.height}
        </div>
      </div>
    </div>
  );
}
