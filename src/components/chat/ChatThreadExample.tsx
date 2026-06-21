"use client";
import { useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageStamp from "./MessageStamp";
import DayDivider from "./DayDivider";
import CommandPalette from "./CommandPalette";
import { useCommandPalette } from "./useCommandPalette";

/**
 * KuikChat - ChatThreadExample
 * Path: src/components/chat/ChatThreadExample.tsx
 *
 * Reference wiring that shows ALL THREE features together:
 *   1) message colors  (MessageBubble)
 *   2) timestamps      (MessageStamp + DayDivider)
 *   3) command palette (CommandPalette + Cmd/Ctrl+K, and "/" in the composer)
 *
 * Copy the pieces you need into your real chat screen. This file is a guide,
 * not required at runtime.
 */
export default function ChatThreadExample() {
  const { open, setOpen } = useCommandPalette();
  const [text, setText] = useState("");

  const onComposerChange = (v: string) => {
    // Open palette when "/" is the first char of an EMPTY composer.
    if (v === "/" && text === "") { setOpen(true); return; }
    setText(v);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 14 }}>
      <DayDivider date={Date.now() - 86400000} />

      <div className="kc-msg">
        <div className="kc-quote">
          <span className="kc-tag">Quote</span>
          <div className="kc-quoted">&ldquo;Make conversations easier to scan.&rdquo;</div>
          Exactly this.
        </div>
        <MessageStamp sent={Date.now() - 86400000} delivered={Date.now() - 86400000} read={Date.now() - 86000000} />
      </div>

      <div className="kc-msg kc-me">
        <MessageBubble type="ai">Here is a tightened version, ready to paste.</MessageBubble>
        <MessageStamp mine sent={Date.now() - 85000000} delivered={Date.now() - 85000000} read={Date.now() - 84000000} edited={Date.now() - 85000000} />
      </div>

      <DayDivider date={Date.now()} />

      <div className="kc-msg">
        <MessageBubble type="standard">Found it. Sending the contract.pdf too.</MessageBubble>
        <MessageStamp sent={Date.now()} delivered={Date.now()} read={Date.now()} />
      </div>

      {/* composer */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={() => setOpen(true)} aria-label="Open commands"
          style={{ width: 36, borderRadius: 8 }}>/</button>
        <input value={text} onChange={e => onComposerChange(e.target.value)}
          placeholder="Message... (type / for commands, or Cmd/Ctrl+K)"
          style={{ flex: 1, padding: 10, borderRadius: 999 }} />
      </div>

      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        onRunCommand={(cmd) => console.log("run command:", cmd) /* TODO: filter the thread */}
        onHermesSearch={(q) => console.log("hermes search:", q) /* TODO: phase 3 index */}
      />
    </div>
  );
}
