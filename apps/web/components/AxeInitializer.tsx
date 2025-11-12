'use client';

import { useEffect } from 'react';

export function AxeInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Dynamic import to avoid SSR issues
      import('react').then(React => {
        import('react-dom').then(ReactDOM => {
          import('@axe-core/react').then(axe => {
            const timeout = setTimeout(() => {
              axe.default(React.default, ReactDOM.default, 1500);
            }, 500);
            return () => clearTimeout(timeout);
          });
        });
      });
    }
  }, []);

  return null;
}

