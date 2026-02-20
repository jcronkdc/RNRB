'use client';

import { useCallback, useRef } from 'react';

/**
 * Simple undo/redo stack for any serializable state.
 * Stores snapshots as JSON strings for deep comparison.
 */
export function useUndoRedo<T>(
  currentState: T,
  setState: (state: T) => void,
  maxHistory = 50
) {
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const lastSnapshot = useRef<string>(JSON.stringify(currentState));

  const pushState = useCallback(() => {
    const snapshot = JSON.stringify(currentState);
    if (snapshot === lastSnapshot.current) return;

    undoStack.current.push(lastSnapshot.current);
    if (undoStack.current.length > maxHistory) {
      undoStack.current.shift();
    }
    redoStack.current = [];
    lastSnapshot.current = snapshot;
  }, [currentState, maxHistory]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;

    const current = JSON.stringify(currentState);
    redoStack.current.push(current);

    const previous = undoStack.current.pop()!;
    lastSnapshot.current = previous;
    setState(JSON.parse(previous));
  }, [currentState, setState]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;

    const current = JSON.stringify(currentState);
    undoStack.current.push(current);

    const next = redoStack.current.pop()!;
    lastSnapshot.current = next;
    setState(JSON.parse(next));
  }, [currentState, setState]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  return { pushState, undo, redo, canUndo, canRedo };
}
