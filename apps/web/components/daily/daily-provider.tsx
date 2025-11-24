'use client';

import { DailyProvider as DailyReactProvider } from '@daily-co/daily-react';
import { type ReactNode } from 'react';

interface DailyProviderProps {
  children: ReactNode;
}

export function DailyProvider({ children }: DailyProviderProps) {
  return <DailyReactProvider>{children}</DailyReactProvider>;
}
