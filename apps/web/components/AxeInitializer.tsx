'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const AxeInitializer = dynamic(
  async () => {
    const { default: React } = await import('react');
    const { default: ReactDOM } = await import('react-dom');
    const axe = (await import('@axe-core/react')).default;

    const AxeComponent = () => {
      useEffect(() => {
        const timeout = setTimeout(() => {
          axe(React, ReactDOM, 1500);
        }, 500);
        return () => clearTimeout(timeout);
      }, []);
      return null;
    };

    return { default: AxeComponent };
  },
  { ssr: false }
);

export { AxeInitializer };

