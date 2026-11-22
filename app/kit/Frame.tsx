"use client";

import { useLayoutEffect, useRef } from "react";
import { fitCharts } from "@/components/Deck";

/**
 * One entry of the gallery: the component's name, a line about it, and a live example. The
 * example sits in the same `.deck-body` wrapper the slides use, so it gets the same type and spacing.
 */
export default function Frame({ name, note, children }: { name: string; note?: string; children: React.ReactNode }) {
  const body = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    fitCharts(el);
    const mo = new MutationObserver(() => fitCharts(el));
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  return (
    <section className="kit-section">
      <header>
        <h2>{name}</h2>
        {note && <p>{note}</p>}
      </header>
      <div className="deck-body kit-frame" ref={body}>{children}</div>
    </section>
  );
}
