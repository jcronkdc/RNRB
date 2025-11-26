import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { useState, ReactNode } from 'react';

interface FeatureTooltipProps {
  title: string;
  description: string;
  children: ReactNode;
  icon?: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Feature Tooltip Component
 * Provides contextual help for dashboard actions and features
 */
export function FeatureTooltip({
  title,
  description,
  children,
  icon,
  placement = 'top',
}: FeatureTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const placementStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="group relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${placementStyles[placement]} pointer-events-none w-80`}
          >
            <div className="rounded-xl border border-orange-500/30 bg-zinc-900/95 p-4 shadow-xl backdrop-blur-sm">
              <div className="mb-2 flex items-start gap-2">
                {icon && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    {icon}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-white">{title}</h4>
                  <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
                </div>
              </div>
              
              {/* Arrow */}
              <div
                className={`absolute h-3 w-3 rotate-45 border border-orange-500/30 bg-zinc-900/95 ${
                  placement === 'top'
                    ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r'
                    : placement === 'bottom'
                    ? 'top-[-6px] left-1/2 -translate-x-1/2 border-l border-t'
                    : placement === 'left'
                    ? 'right-[-6px] top-1/2 -translate-y-1/2 border-r border-t'
                    : 'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface InfoButtonProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

/**
 * Inline Info Button with Tooltip
 * For use inside action cards and buttons
 */
export function InfoButton({ title, description, icon }: InfoButtonProps) {
  return (
    <FeatureTooltip title={title} description={description} icon={icon}>
      <button
        className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
        onClick={(e) => e.preventDefault()}
      >
        <Info className="h-3 w-3" />
      </button>
    </FeatureTooltip>
  );
}
