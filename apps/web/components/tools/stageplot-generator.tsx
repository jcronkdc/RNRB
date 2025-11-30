'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Plus,
  Trash2,
  RotateCw,
  Move,
  Grid,
  Mic,
  Speaker,
  Piano,
  Guitar,
  Drum,
  Music,
  Monitor,
  Zap,
  Settings,
  Save,
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';

interface StageItem {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  color: string;
}

interface StagePreset {
  name: string;
  items: Omit<StageItem, 'id'>[];
}

const EQUIPMENT_TYPES = [
  { type: 'mic-stand', name: 'Mic Stand', icon: Mic, color: '#ef4444', width: 20, height: 20 },
  { type: 'vocal-mic', name: 'Vocal Mic', icon: Mic, color: '#f97316', width: 20, height: 20 },
  {
    type: 'monitor',
    name: 'Monitor Wedge',
    icon: Monitor,
    color: '#3b82f6',
    width: 40,
    height: 25,
  },
  {
    type: 'main-speaker',
    name: 'Main Speaker',
    icon: Speaker,
    color: '#1d4ed8',
    width: 35,
    height: 50,
  },
  { type: 'sub', name: 'Subwoofer', icon: Speaker, color: '#1e3a8a', width: 45, height: 45 },
  { type: 'guitar-amp', name: 'Guitar Amp', icon: Guitar, color: '#84cc16', width: 35, height: 35 },
  { type: 'bass-amp', name: 'Bass Amp', icon: Guitar, color: '#65a30d', width: 40, height: 40 },
  { type: 'drum-kit', name: 'Drum Kit', icon: Drum, color: '#eab308', width: 80, height: 70 },
  { type: 'keyboard', name: 'Keyboard', icon: Piano, color: '#a855f7', width: 70, height: 30 },
  {
    type: 'keyboard-stand',
    name: 'KB Stand',
    icon: Piano,
    color: '#9333ea',
    width: 60,
    height: 25,
  },
  { type: 'di-box', name: 'DI Box', icon: Zap, color: '#06b6d4', width: 15, height: 15 },
  { type: 'pedal-board', name: 'Pedal Board', icon: Grid, color: '#6366f1', width: 50, height: 20 },
  { type: 'iem-pack', name: 'IEM Pack', icon: Music, color: '#ec4899', width: 15, height: 15 },
  { type: 'power-strip', name: 'Power Strip', icon: Zap, color: '#f59e0b', width: 40, height: 10 },
];

const PRESETS: StagePreset[] = [
  {
    name: 'Solo Acoustic',
    items: [
      {
        type: 'vocal-mic',
        name: 'Vocal',
        x: 200,
        y: 150,
        rotation: 0,
        width: 20,
        height: 20,
        color: '#f97316',
      },
      {
        type: 'monitor',
        name: 'Mon L',
        x: 150,
        y: 200,
        rotation: -30,
        width: 40,
        height: 25,
        color: '#3b82f6',
      },
      {
        type: 'di-box',
        name: 'DI',
        x: 220,
        y: 200,
        rotation: 0,
        width: 15,
        height: 15,
        color: '#06b6d4',
      },
    ],
  },
  {
    name: '3-Piece Rock',
    items: [
      {
        type: 'vocal-mic',
        name: 'Lead Vox',
        x: 200,
        y: 120,
        rotation: 0,
        width: 20,
        height: 20,
        color: '#f97316',
      },
      {
        type: 'drum-kit',
        name: 'Drums',
        x: 200,
        y: 280,
        rotation: 0,
        width: 80,
        height: 70,
        color: '#eab308',
      },
      {
        type: 'guitar-amp',
        name: 'Guitar',
        x: 80,
        y: 200,
        rotation: 0,
        width: 35,
        height: 35,
        color: '#84cc16',
      },
      {
        type: 'bass-amp',
        name: 'Bass',
        x: 320,
        y: 200,
        rotation: 0,
        width: 40,
        height: 40,
        color: '#65a30d',
      },
      {
        type: 'monitor',
        name: 'Mon L',
        x: 120,
        y: 150,
        rotation: -20,
        width: 40,
        height: 25,
        color: '#3b82f6',
      },
      {
        type: 'monitor',
        name: 'Mon R',
        x: 280,
        y: 150,
        rotation: 20,
        width: 40,
        height: 25,
        color: '#3b82f6',
      },
      {
        type: 'monitor',
        name: 'Drum Mon',
        x: 200,
        y: 320,
        rotation: 180,
        width: 40,
        height: 25,
        color: '#3b82f6',
      },
    ],
  },
  {
    name: '5-Piece Band',
    items: [
      {
        type: 'vocal-mic',
        name: 'Lead Vox',
        x: 200,
        y: 100,
        rotation: 0,
        width: 20,
        height: 20,
        color: '#f97316',
      },
      {
        type: 'mic-stand',
        name: 'BG Vox L',
        x: 120,
        y: 130,
        rotation: 0,
        width: 20,
        height: 20,
        color: '#ef4444',
      },
      {
        type: 'mic-stand',
        name: 'BG Vox R',
        x: 280,
        y: 130,
        rotation: 0,
        width: 20,
        height: 20,
        color: '#ef4444',
      },
      {
        type: 'drum-kit',
        name: 'Drums',
        x: 200,
        y: 320,
        rotation: 0,
        width: 80,
        height: 70,
        color: '#eab308',
      },
      {
        type: 'guitar-amp',
        name: 'Guitar 1',
        x: 50,
        y: 200,
        rotation: 0,
        width: 35,
        height: 35,
        color: '#84cc16',
      },
      {
        type: 'guitar-amp',
        name: 'Guitar 2',
        x: 350,
        y: 200,
        rotation: 0,
        width: 35,
        height: 35,
        color: '#84cc16',
      },
      {
        type: 'bass-amp',
        name: 'Bass',
        x: 350,
        y: 280,
        rotation: 0,
        width: 40,
        height: 40,
        color: '#65a30d',
      },
      {
        type: 'keyboard',
        name: 'Keys',
        x: 50,
        y: 280,
        rotation: 0,
        width: 70,
        height: 30,
        color: '#a855f7',
      },
    ],
  },
];

export function StageplotGenerator() {
  const [items, setItems] = useState<StageItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [stageName, setStageName] = useState('My Stage Plot');
  const [stageWidth] = useState(400);
  const [stageDepth] = useState(400);
  const [showGrid, setShowGrid] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Add item to stage
  const addItem = (equipType: (typeof EQUIPMENT_TYPES)[0]) => {
    const newItem: StageItem = {
      id: `item-${Date.now()}`,
      type: equipType.type,
      name: equipType.name,
      x: stageWidth / 2,
      y: stageDepth / 2,
      rotation: 0,
      width: equipType.width,
      height: equipType.height,
      color: equipType.color,
    };
    setItems([...items, newItem]);
    setSelectedItem(newItem.id);
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    if (selectedItem === id) setSelectedItem(null);
  };

  // Update item position
  const updateItemPosition = useCallback((id: string, x: number, y: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, x, y } : item)));
  }, []);

  // Rotate item
  const rotateItem = (id: string, degrees: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, rotation: (item.rotation + degrees) % 360 } : item
      )
    );
  };

  // Load preset
  const loadPreset = (preset: StagePreset) => {
    const newItems: StageItem[] = preset.items.map((item, i) => ({
      ...item,
      id: `item-${Date.now()}-${i}`,
    }));
    setItems(newItems);
  };

  // Handle drag on stage
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedItem || !stageRef.current) return;

      const rect = stageRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(stageWidth, e.clientX - rect.left));
      const y = Math.max(0, Math.min(stageDepth, e.clientY - rect.top));

      updateItemPosition(draggedItem, x, y);
    },
    [draggedItem, stageWidth, stageDepth, updateItemPosition]
  );

  // Export as PNG
  const exportAsPNG = async () => {
    if (!stageRef.current) return;

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(stageRef.current, {
      backgroundColor: '#1e1e1e',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `${stageName.replace(/\s+/g, '-').toLowerCase()}-stageplot.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Get equipment icon
  const getIcon = (type: string) => {
    const equip = EQUIPMENT_TYPES.find((e) => e.type === type);
    return equip?.icon || Music;
  };

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Grid className="h-5 w-5 text-white" />
          </div>
          <div>
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="bg-transparent text-lg font-bold focus:outline-none focus:ring-0"
            />
            <p className="text-sm text-muted-foreground">Drag equipment to position</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? 'bg-white/10' : ''}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsPNG} className="gap-2">
            <Download className="h-4 w-4" />
            Export PNG
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Stage Canvas */}
        <div className="relative">
          <div
            ref={stageRef}
            className="relative mx-auto overflow-hidden rounded-xl border-2 border-dashed border-white/20"
            style={{
              width: stageWidth,
              height: stageDepth,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setDraggedItem(null)}
            onMouseLeave={() => setDraggedItem(null)}
          >
            {/* Grid */}
            {showGrid && (
              <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.1 }}>
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}

            {/* Front of Stage Label */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider text-white/50">
              Front of Stage (Audience)
            </div>

            {/* Back of Stage Label */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider text-white/50">
              Back of Stage
            </div>

            {/* Stage Items */}
            {items.map((item) => {
              const Icon = getIcon(item.type);
              const isSelected = selectedItem === item.id;

              return (
                <motion.div
                  key={item.id}
                  className={`absolute cursor-move select-none ${isSelected ? 'z-10' : 'z-0'}`}
                  style={{
                    left: item.x - item.width / 2,
                    top: item.y - item.height / 2,
                    width: item.width,
                    height: item.height,
                    transform: `rotate(${item.rotation}deg)`,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedItem(item.id);
                    setDraggedItem(item.id);
                  }}
                  animate={{
                    boxShadow: isSelected ? `0 0 0 2px ${item.color}` : 'none',
                  }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-center rounded-md"
                    style={{
                      backgroundColor: item.color + '40',
                      border: `2px solid ${item.color}`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Presets */}
          <div className="rounded-xl bg-white/5 p-4">
            <h4 className="mb-3 text-sm font-semibold">Quick Presets</h4>
            <div className="space-y-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset)}
                  className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Palette */}
          <div className="rounded-xl bg-white/5 p-4">
            <h4 className="mb-3 text-sm font-semibold">Add Equipment</h4>
            <div className="grid grid-cols-4 gap-2">
              {EQUIPMENT_TYPES.map((equip) => (
                <button
                  key={equip.type}
                  onClick={() => addItem(equip)}
                  className="flex flex-col items-center gap-1 rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10"
                  title={equip.name}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded"
                    style={{ backgroundColor: equip.color + '40' }}
                  >
                    <equip.icon className="h-3 w-3" style={{ color: equip.color }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{equip.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Item Controls */}
          {selectedItem && (
            <div className="rounded-xl bg-white/5 p-4">
              <h4 className="mb-3 text-sm font-semibold">Selected Item</h4>
              {(() => {
                const item = items.find((i) => i.id === selectedItem);
                if (!item) return null;

                return (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        setItems(
                          items.map((i) =>
                            i.id === selectedItem ? { ...i, name: e.target.value } : i
                          )
                        );
                      }}
                      className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateItem(selectedItem, -45)}
                        className="flex-1"
                      >
                        <RotateCw className="h-4 w-4 scale-x-[-1]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateItem(selectedItem, 45)}
                        className="flex-1"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(selectedItem)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Clear Stage */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setItems([]);
              setSelectedItem(null);
            }}
          >
            Clear Stage
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 rounded-xl bg-white/5 p-4">
        <h4 className="mb-3 text-sm font-semibold">Stage Plot Legend</h4>
        <div className="flex flex-wrap gap-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add equipment to generate legend</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
