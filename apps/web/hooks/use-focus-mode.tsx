/**
 * Focus Mode Hook
 *
 * Distraction-free writing/creating mode
 * Hides sidebar, topbar, and all UI chrome
 *
 * Features:
 * - Keyboard toggle: Cmd+Shift+F
 * - Escape key to exit
 * - localStorage persistence for preference
 * - Gentle fade transition
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface FocusModeContextType {
  isFocusMode: boolean;
  enableFocusMode: () => void;
  disableFocusMode: () => void;
  toggleFocusMode: () => void;
}

const FocusModeContext = createContext<FocusModeContextType>({
  isFocusMode: false,
  enableFocusMode: () => {},
  disableFocusMode: () => {},
  toggleFocusMode: () => {},
});

export function useFocusMode() {
  return useContext(FocusModeContext);
}

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Enable focus mode
  const enableFocusMode = useCallback(() => {
    setIsFocusMode(true);
    localStorage.setItem('focus-mode', 'true');
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('focus-mode-change', { detail: { enabled: true } }));
  }, []);

  // Disable focus mode
  const disableFocusMode = useCallback(() => {
    setIsFocusMode(false);
    localStorage.setItem('focus-mode', 'false');
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('focus-mode-change', { detail: { enabled: false } }));
  }, []);

  // Toggle focus mode
  const toggleFocusMode = useCallback(() => {
    if (isFocusMode) {
      disableFocusMode();
    } else {
      enableFocusMode();
    }
  }, [isFocusMode, enableFocusMode, disableFocusMode]);

  // Keyboard shortcut: Cmd+Shift+F to toggle, Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+F / Ctrl+Shift+F - Toggle focus mode
      if (e.key === 'f' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        toggleFocusMode();
      }

      // Escape to exit focus mode (only if in focus mode)
      if (e.key === 'Escape' && isFocusMode) {
        // Check if something else might be handling escape (modals, etc.)
        // Only exit if no other handler stopped propagation
        // Use a small delay to let modals handle first
        setTimeout(() => {
          if (isFocusMode) {
            disableFocusMode();
          }
        }, 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, toggleFocusMode, disableFocusMode]);

  // Listen for external focus mode changes (from command palette)
  useEffect(() => {
    const handleFocusModeChange = (e: CustomEvent<{ enabled: boolean }>) => {
      setIsFocusMode(e.detail.enabled);
    };

    window.addEventListener('focus-mode-change', handleFocusModeChange as EventListener);
    return () =>
      window.removeEventListener('focus-mode-change', handleFocusModeChange as EventListener);
  }, []);

  return (
    <FocusModeContext.Provider
      value={{
        isFocusMode,
        enableFocusMode,
        disableFocusMode,
        toggleFocusMode,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}
