'use client';

import { useEffect, useState } from 'react';

export function usePlatformKey() {
  const [symbol, setSymbol] = useState<'⌘' | 'Ctrl'>('⌘');

  useEffect(() => {
    const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? '');
    setSymbol(isApple ? '⌘' : 'Ctrl');
  }, []);

  return symbol;
}
