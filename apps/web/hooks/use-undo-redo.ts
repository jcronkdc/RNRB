import { useState, useCallback, useEffect } from 'react';

/**
 * Undo/Redo Hook
 * Tracks action history for any data type
 * Supports keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 */

interface UseUndoRedoOptions<T> {
  initialState: T;
  maxHistory?: number; // Max history items to keep (default: 50)
  onSave?: (state: T) => void; // Auto-save on change
}

export function useUndoRedo<T>({ initialState, maxHistory = 50, onSave }: UseUndoRedoOptions<T>) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  // Set new state and add to history
  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setHistory((prevHistory) => {
        const current = prevHistory[currentIndex];
        const next =
          typeof newState === 'function' ? (newState as (prev: T) => T)(current) : newState;

        // Don't add if same as current
        if (JSON.stringify(next) === JSON.stringify(current)) {
          return prevHistory;
        }

        // Remove any future history (user made change after undo)
        const newHistory = prevHistory.slice(0, currentIndex + 1);

        // Add new state
        newHistory.push(next);

        // Limit history size
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          setCurrentIndex(newHistory.length - 1);
        } else {
          setCurrentIndex(newHistory.length - 1);
        }

        return newHistory;
      });
    },
    [currentIndex, maxHistory]
  );

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  // Can undo/redo?
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Auto-save when state changes
  useEffect(() => {
    if (onSave && currentIndex > 0) {
      const timeout = setTimeout(() => {
        onSave(currentState);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timeout);
    }
  }, [currentState, currentIndex, onSave]);

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentIndex,
  };
}
