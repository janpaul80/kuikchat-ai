"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Ic, ICONS } from "./_icons";
import { COMMANDS, type KCCommand } from "./commands";

/**
 * KuikChat - CommandPalette ( / menu )
 * Path: src/components/chat/CommandPalette.tsx
 *
 * Open with Cmd/Ctrl+K, or when "/" is typed as the first char of an empty
 * composer (wire that in your composer; see INSTALL.md).
 *
 * Two grammars in one box:
 *   - a short token (e.g. "files")  -> runs a command  (onRunCommand)
 *   - a phrase (2+ words)           -> Hermes search   (onHermesSearch)
 *
 * Hermes natural-language search needs a backend index; this component only
 * hands you the query string. See INSTALL.md "Phase 3".
 */
export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onRunCommand: (cmd: string) => void;
  onHermesSearch: (query: string) => void;
}

const isQuestion = (q: string) => q.trim().split(/\s+/).filter(Boolean).length >= 2;

export default function CommandPalette({ open, onClose, onRunCommand, onHermesSearch }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  const query = q.replace(/^\//, "");
  const hermesMode = isQuestion(query);

  const matched = useMemo<KCCommand[]>(() => {
    const s = query.toLowerCase().trim();
    return COMMANDS.filter(c => !s || c.cmd.includes(s) || c.desc.toLowerCase().includes(s));
  }, [query]);

  if (!open) return null;

  const run = () => {
    if (hermesMode) { onHermesSearch(query.trim()); onClose(); return; }
    const pick = matched[active] ?? matched[0];
    if (pick) { onRunCommand(pick.cmd); onClose(); }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "Enter") { e.preventDefault(); run(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, matched.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
  };

  let lastSection = "";

  return (
    <div className="kc-pal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kc-pal" role="dialog" aria-modal="true" aria-label="Chat command palette">
        <div className="kc-pal-search">
          <span className="kc-pfx">/</span>
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="recent, files, today, or ask Hermes a question"
            autoComplete="off"
            aria-label="Type a command or ask Hermes"
          />
        </div>

        <div className="kc-pal-list">
          {hermesMode ? (
            <>
              <div className="kc-pal-sec">Hermes search</div>
              <div className="kc-cmd kc-hermes kc-active" onClick={run}>
                <div className="kc-ic"><Ic d={ICONS.hermes} /></div>
                <div>
                  <div className="kc-nm">Ask Hermes</div>
                  <div className="kc-ds">&ldquo;{query.trim()}&rdquo;</div>
                </div>
                <div className="kc-key">{"\u21B5"}</div>
              </div>
              <div className="kc-herm-hint">
                <Ic d={ICONS.hermes} /> Searches meaning, not just keywords. Finds it even if you forget the exact words.
              </div>
            </>
          ) : matched.length === 0 ? (
            <div className="kc-pal-empty">No command. Type a full question to ask Hermes, e.g. &ldquo;where Bob mentioned FileNinja&rdquo;.</div>
          ) : (
            matched.map((c, i) => {
              const head = c.section !== lastSection ? c.section : null;
              lastSection = c.section;
              return (
                <div key={c.cmd}>
                  {head && <div className="kc-pal-sec">{head}</div>}
                  <div
                    className={"kc-cmd" + (i === active ? " kc-active" : "")}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => { onRunCommand(c.cmd); onClose(); }}
                  >
                    <div className="kc-ic"><Ic d={c.icon} /></div>
                    <div>
                      <div className="kc-nm">{c.cmd}</div>
                      <div className="kc-ds">{c.desc}</div>
                    </div>
                    <div className="kc-key">{c.key}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
