'use client';

import { useAbly } from 'ably/react';
import { useCallback, useMemo } from 'react';
import type { Types } from 'ably';

type ChannelModes = Types.ChannelMode[];

interface ChannelOptionsManagerProps {
  channelName: string;
  /**
   * Initial rewind value to apply when the channel is first obtained.
   * Examples: '100' (last 100 messages), '15s' (last 15 seconds).
   */
  initialRewind?: string;
  /**
   * Initial channel modes (e.g. ['SUBSCRIBE', 'PUBLISH', 'PRESENCE']).
   * If omitted, Ably will use its defaults based on your token capabilities.
   */
  initialModes?: ChannelModes;
}

/**
 * RNBChannelOptionsManager
 *
 * Small helper around Ably's channel options:
 * - Gets a channel with initial params/modes.
 * - Exposes helpers to update rewind/modes at runtime.
 *
 * This keeps the low-level Ably wiring in one place so UI components
 * can focus on rendering.
 */
export function RNBChannelOptionsManager({
  channelName,
  initialRewind = '100',
  initialModes = ['SUBSCRIBE', 'PUBLISH', 'PRESENCE'],
}: ChannelOptionsManagerProps) {
  const ably = useAbly();

  // Get channel with initial options
  const channel = useMemo(() => {
    const options: Types.ChannelOptions = {
      params: {
        rewind: initialRewind,
      },
      modes: initialModes,
    };

    return ably.channels.get(channelName, options);
  }, [ably, channelName, initialRewind, initialModes]);

  // Generic channel.setOptions
  const updateOptions = useCallback(
    async (options: Types.ChannelOptions) => {
      await channel.setOptions(options);
    },
    [channel],
  );

  // Convenience: just update rewind
  const setRewind = useCallback(
    async (rewind: string) => {
      await channel.setOptions({
        params: { rewind },
      });
    },
    [channel],
  );

  // Convenience: just update modes
  const setModes = useCallback(
    async (modes: ChannelModes) => {
      await channel.setOptions({
        modes,
      });
    },
    [channel],
  );

  return { channel, updateOptions, setRewind, setModes };
}


