'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicNote {
  id: string;
  x: number;
  type: '♪' | '♫' | '♬' | '♩';
  size: number;
  duration: number;
  delay: number;
}

export function MusicNotes() {
  const [notes, setNotes] = useState<MusicNote[]>([]);

  useEffect(() => {
    const generateNotes = () => {
      const newNotes: MusicNote[] = Array.from({ length: 8 }, (_, i) => ({
        id: `note-${Date.now()}-${i}`,
        x: Math.random() * 100,
        type: ['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)] as MusicNote['type'],
        size: 16 + Math.random() * 24,
        duration: 15 + Math.random() * 10,
        delay: i * 0.5,
      }));
      setNotes(newNotes);
    };

    generateNotes();
    const interval = setInterval(generateNotes, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            className="absolute text-primary/20"
            style={{
              left: `${note.x}%`,
              fontSize: `${note.size}px`,
            }}
            initial={{ 
              y: '100vh',
              opacity: 0,
              rotate: -10,
            }}
            animate={{ 
              y: '-100px',
              opacity: [0, 0.8, 0.8, 0],
              rotate: [
                -10, 
                Math.random() > 0.5 ? 20 : -20,
                Math.random() > 0.5 ? -15 : 15,
                0
              ],
              x: [
                0,
                Math.random() > 0.5 ? 20 : -20,
                Math.random() > 0.5 ? -10 : 10,
                0
              ],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              ease: 'easeOut',
              x: {
                type: 'spring',
                stiffness: 50,
                damping: 20,
              },
              rotate: {
                type: 'spring',
                stiffness: 30,
                damping: 15,
              },
            }}
          >
            {note.type}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
