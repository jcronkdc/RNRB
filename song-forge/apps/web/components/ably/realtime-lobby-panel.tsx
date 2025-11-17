"use client";

import { useChannel } from "ably/react";
import type { Types } from "ably";
import { Send } from "lucide-react";
import { useMemo, useState } from "react";

type LobbyMessage = {
  id: string;
  clientId?: string | null;
  text: string;
  timestamp: number;
};

export function RealtimeLobbyPanel() {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [channel] = useChannel("rnrb:lobby", (message: Types.Message) => {
    setMessages((prev) => {
      const next = [
        ...prev,
        {
          id: message.id || `${message.timestamp}:${Math.random()}`,
          clientId: message.clientId,
          text: typeof message.data === "string" ? message.data : JSON.stringify(message.data),
          timestamp: message.timestamp || Date.now(),
        },
      ];
      return next.slice(-25);
    });
  });

  const handleSend = async () => {
    if (!channel || !input.trim()) {
      return;
    }

    try {
      setIsSending(true);
      await channel.publish("chat", input.trim());
      setInput("");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void handleSend();
  };

  const recentMessages = useMemo(() => messages.slice().reverse(), [messages]);

  return (
    <section className="rnrb-card p-5 border border-border/70">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Realtime Lobby</p>
          <h2 className="text-lg font-semibold">Ably message stream</h2>
        </div>
        <span className="text-xs text-muted-foreground">Channel: rnrb:lobby</span>
      </div>

      <div className="mb-4 max-h-64 overflow-y-auto rounded-2xl border border-border/60 bg-surface-muted/40 p-3 text-sm space-y-3">
        {recentMessages.length === 0 ? (
          <p className="text-muted-foreground">No realtime activity yet. Say hello to test the connection.</p>
        ) : (
          recentMessages.map((message) => (
            <div key={message.id} className="rounded-xl bg-background/70 p-2 shadow-inner">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-brand-primary">{message.clientId || "anonymous"}</span>
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-foreground mt-1">{message.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          className="flex-1 rounded-2xl border border-border/70 bg-surface px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="Send a message to the lobby…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending || !channel}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </section>
  );
}

