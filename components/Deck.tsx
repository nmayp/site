"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ICONS } from "./icons";
import { COUNT_MS, LEAVE_MS } from "@/lib/motion";

/** One slide: a label for the list of points on the left, and its content. `stay`: clicks inside it do not move on (inputs, maps). */
export type Slide = { k: string; body: React.ReactNode; stay?: boolean };

/**
 * A carousel: a list of points on the left, one patch of content in the middle,
 * the attractor on the right (it fills the empty .bench-sim cell). Clicking a
 * point goes to it; clicking anywhere else, or pressing space or an arrow key,
 * goes to the next one. Each move sends a "bench-step" event, and the scene
 * turns the shape once.
 */
const OUT = LEAVE_MS; // the old slide leaves for this long before the new one rises

/**
 * Draws every chart in `el` at one scale (so the type is the same size on every
 * slide); architecture diagrams a little larger. Charts marked `.map` are left alone.
 */
export function fitCharts(el: HTMLElement) {
  el.querySelectorAll<SVGSVGElement>(".bench-chart:not(.map) svg").forEach((v) => {
    const w = v.viewBox.baseVal?.width;
    if (!w) return;
    v.style.width = `${w * (v.closest(".arch") ? 0.078 : 0.07)}em`;
    v.style.maxWidth = "100%";
    v.style.height = "auto";
  });
}

export default function Deck({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0); // the item shown
  const [at, setAt] = useState(0); // the item the bar points to (moves at once)
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [dir, setDir] = useState(1);
  const body = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const n = slides.length;

  // tell the scene where the attractor's cell is now
  useLayoutEffect(() => { dispatchEvent(new Event("bench-layout")); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  // every chart is drawn at one scale
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const fit = () => fitCharts(el);
    fit();
    const mo = new MutationObserver(fit);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [i]);

  const go = useCallback((to: number, d = 1) => {
    const nx = ((to % n) + n) % n;
    if (nx === at) return;
    dispatchEvent(new CustomEvent("bench-step", { detail: d }));
    setDir(d);
    setAt(nx);
    setPhase("out");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setI(nx); setPhase("in"); }, OUT);
  }, [n, at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element).closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); go(at + 1, 1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(at - 1, -1); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [at, go]);

  const onClick = (e: React.MouseEvent) => {
    const t = e.target as Element;
    if (t.closest("a, button, input, select, textarea, label, [data-stay]")) return;
    if (slides[i].stay && body.current?.contains(t)) return;
    go(at + 1, 1);
  };

  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <div className="deck" onClick={onClick}>
      <nav className="deck-nav" aria-label="Points" style={{ "--k": at } as React.CSSProperties}>
        <ol>
          {slides.map((s, j) => (
            <li key={s.k}>
              <button type="button" aria-current={j === at ? "step" : undefined} onClick={() => go(j, j < at ? -1 : 1)}>
                <span className="idx">{pad(j + 1)}</span>
                <span className="lbl">{s.k}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="deck-bar" aria-hidden="true" />
      </nav>
      <div className={`deck-body ${phase}${dir < 0 ? " back" : ""}`} ref={body} key={i} aria-live="polite">
        {slides[i].body}
      </div>
      <div className="bench-sim deck-sim" aria-hidden="true" />
    </div>
  );
}

/** A diagram as a vertical chain of steps: numbered dots on one thin line. No boxes. */
export function Flow({ steps }: { steps: ({ n: string; t: string; d: string; blue?: boolean; dash?: boolean } | string)[] }) {
  return (
    <ol className="flow">
      {steps.map((s, j) =>
        typeof s === "string" ? (
          <li key={j} className="grp">{s}</li>
        ) : (
          <li key={j} data-n={s.n} className={[s.blue ? "blue" : "", s.dash ? "dash" : ""].join(" ")}>
            <b>{s.t}</b>
            <span>{s.d}</span>
          </li>
        ),
      )}
    </ol>
  );
}

/** Pictures with a short caption each. `tall` ones span two rows (good for phone screenshots). */
export function Shots({ items }: { items: { src: string; cap: string; tall?: boolean }[] }) {
  return (
    <ul className="shots">
      {items.map((s) => (
        <li key={s.src} className={s.tall ? "tall" : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt={s.cap} loading="lazy" decoding="async" />
          <span>{s.cap}</span>
        </li>
      ))}
    </ul>
  );
}

/** Two columns on a wide screen, stacked on a phone. */
export function Cols({ children }: { children: React.ReactNode }) {
  return <div className="cols">{children}</div>;
}

/** Numbers that count up to their value when they appear (the final value at once for reduced motion). */
export function CountUp({ to, decimals = 0, ms = COUNT_MS }: { to: number; decimals?: number; ms?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{v.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

export type StackItem = { n: string; s?: string; icon?: string; own?: boolean };

/** A stack as layers: each row is one layer, with the marks of what is used in it. `own` items are drawn in blue. */
export function Stack({ rows }: { rows: { k: string; items: StackItem[] }[] }) {
  return (
    <>
      {rows.map((r) => (
        <div className="stk" key={r.k}>
          <span className="stk-k">{r.k}</span>
          <ul>
            {r.items.map((it) => (
              <li key={it.n} className={it.own ? "own" : undefined}>
                {it.icon && ICONS[it.icon] ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[it.icon]} fill="currentColor" /></svg>
                ) : (
                  <i aria-hidden="true" />
                )}
                <b>{it.n}</b>
                {it.s && <span>{it.s}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
