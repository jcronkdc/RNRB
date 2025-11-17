"use client";

import { useAbly } from "ably/react";
import type { ConnectionStateChange } from "ably";
import { useEffect, useState } from "react";

const stateCopy: Record<string, { label: string; tone: "success" | "warning" | "danger" | "info" }> = {
  connecting: { label: "Connecting…", tone: "info" },
  connected: { label: "Connected", tone: "success" },
  disconnected: { label: "Disconnected", tone: "warning" },
  suspended: { label: "Suspended", tone: "warning" },
  closing: { label: "Closing…", tone: "info" },
  closed: { label: "Closed", tone: "danger" },
  failed: { label: "Connection failed", tone: "danger" },
};

export function AblyConnectionStatusBanner() {
  const ably = useAbly();
  const [state, setState] = useState(ably.connection.state);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const handler = (change: ConnectionStateChange) => {
      setState(change.current);
      setReason(change.reason ? change.reason.message || change.reason.toString() : null);
    };

    ably.connection.on(handler);
    return () => {
      ably.connection.off(handler);
    };
  }, [ably]);

  const meta = stateCopy[state] ?? { label: state, tone: "info" };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${
        meta.tone === "success"
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : meta.tone === "warning"
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : meta.tone === "danger"
          ? "border-rose-300 bg-rose-50 text-rose-900"
          : "border-slate-200 bg-slate-50 text-slate-900"
      }`}
    >
      <span className="font-semibold">{meta.label}</span>
      {reason ? <span className="truncate text-xs opacity-80">{reason}</span> : null}
    </div>
  );
}



