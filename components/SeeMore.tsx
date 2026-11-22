"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A link that opens a full-screen panel over the scene. It sends a "bench" event
 * (detail true on open, false on close); the scene hears it and moves the
 * attractor into the panel's empty .bench-sim cell. Escape closes the panel.
 * `label` is the link text, `title` and `note` fill the panel's header.
 */
export default function SeeMore({ children, title, label, note }: { children: React.ReactNode; title: string; label: string; note: string }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const toggle = useCallback((o: boolean) => {
    setOpen(o);
    dispatchEvent(new CustomEvent("bench", { detail: o }));
  }, []);

  const layout = useCallback(() => dispatchEvent(new Event("bench-layout")), []);
  useLayoutEffect(() => { if (open) { layout(); panel.current?.focus({ preventScroll: true }); } }, [open, layout]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && toggle(false);
    addEventListener("resize", layout);
    addEventListener("keydown", onKey);
    document.fonts?.ready.then(layout);
    return () => {
      removeEventListener("resize", layout);
      removeEventListener("keydown", onKey);
    };
  }, [open, layout, toggle]);

  return (
    <>
      <button type="button" className="see-more" aria-expanded={open} aria-controls={id} onClick={() => toggle(true)}>
        {label}
      </button>
      {open &&
        createPortal(
          <div className="bench-panel" id={id} ref={panel} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
            <div className="bench-head">
              <h2>{title}</h2>
              <span className="note">{note}</span>
              <button type="button" className="deck-close" onClick={() => toggle(false)}>
                Close
              </button>
            </div>
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
