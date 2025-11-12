import * as React from 'react';

import { cn } from '../lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[];
  onValueChange: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number.parseFloat(e.target.value);
      onValueChange([newValue]);
    };

    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-lg bg-brand-muted/60 accent-brand-primary',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
          className
        )}
        value={value[0] ?? min}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
export type { SliderProps };


