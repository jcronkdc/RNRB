'use client';

import { useEffect } from 'react';

export function AxeInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Dynamic import to avoid SSR issues
      Promise.all([
        import('react'),
        import('react-dom'),
        import('@axe-core/react')
      ])
        .then(([React, ReactDOM, axe]) => {
          const timeout = setTimeout(() => {
            axe.default(React.default, ReactDOM.default, 1500);
          }, 500);
          return () => clearTimeout(timeout);
        })
        .catch((error) => {
          console.error('Failed to load axe-core:', error);
        });
    }
  }, []);

  return null;
}

