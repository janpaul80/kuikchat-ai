"use client";
import { useRef, useState } from "react";
import { formatStamp, absolute } from "@/lib/formatTime";

/**
 * KuikChat - MessageStamp (first-class, always-visible timestamp)
 * Path: src/components/chat/MessageStamp.tsx
 *
 * Always shows a quiet relative stamp. Reveals full detail on hover (desktop)
 * or long-press (mobile): sent / delivered / read / edited.
 */
export interface StampProps {
  sent: Date | string | number;
  delivered?: Date | string | number;
  read?: Date | string | number;
  edited?: Date | string | number;
  mine?: boolean;
}

export default function MessageStamp({ sent, delivered, read, edited, mine }: StampProps) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = () => { timer.current = setTimeout(() => setShow(true), 350); };
  const endPress = () => { if (timer.current) clearTimeout(timer.current); };

  return (
    <div
      className="kc-stamp"
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
      title={absolute(sent)}
    >
      {edited && <span className="kc-edited">edited</span>}
      <span aria-label={absolute(sent)}>{formatStamp(sent)}</span>
      {mine && read ? <span className="kc-tick">{"\u2713\u2713"}</span> : null}

      <div className={"kc-detail" + (show ? " kc-show" : "")} onClick={() => setShow(false)}>
        <div className="kc-row"><b>Sent</b><span>{absolute(sent)}</span></div>
        {delivered && <div className="kc-row"><b>Delivered</b><span>{absolute(delivered)}</span></div>}
        {read && <div className="kc-row"><b>Read</b><span>{absolute(read)}</span></div>}
        {edited && <div className="kc-row"><b>Edited</b><span>{absolute(edited)}</span></div>}
      </div>
    </div>
  );
}
