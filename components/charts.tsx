"use client";

// Chart primitives and style-guide pieces. Every chart is plain SVG that takes plain data props
// (no fetching, no state), so you can drop in your own numbers. Wrap a chart in <div className="bench-chart">.
import { useState } from "react";
import { BLUE, GREY, GREY_AXIS, GREY_GRID, GREY_LINE, INK, PALETTE } from "@/lib/colors";
import { MOTIONS, cubic } from "@/lib/motion";

const tick = (t: number, decimals = 0) => t.toFixed(decimals);

/* ── Dumbbell: two dots per row (a reference and a main value) and the gap between them ── */

export type DumbbellRow = { label: string; base: number; main: number; value?: string };

export function Dumbbell({
  title,
  valueTitle = "",
  rows,
  min = 0,
  max,
  ticks,
  legend,
  aria,
  decimals = 1,
}: {
  title: string;
  valueTitle?: string;
  rows: DumbbellRow[];
  min?: number;
  max: number;
  ticks: number[];
  legend: [main: string, base: string];
  aria: string;
  decimals?: number;
}) {
  const L = 160, R = 470, row = 21, T = 28, X = (v: number) => L + ((v - min) / (max - min)) * (R - L);
  const H = T + rows.length * row + 26;
  return (
    <svg viewBox={`0 0 560 ${H}`} preserveAspectRatio="xMinYMin meet" role="img" aria-label={aria}>
      <text x="0" y="10" fontSize="10" letterSpacing="1.2" fill={GREY}>{title.toUpperCase()}</text>
      <text x={R + 56} y="10" fontSize="10" letterSpacing="1.2" fill={GREY} textAnchor="end">{valueTitle.toUpperCase()}</text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={T - 8} y2={T + rows.length * row - 6} stroke={GREY_GRID} />
          <text x={X(t)} y={T + rows.length * row + 8} fontSize="11" fill={GREY} textAnchor="middle">{tick(t)}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = T + i * row + 6;
        return (
          <g key={r.label}>
            <text x={L - 14} y={y + 4} fontSize="12" fill={GREY} textAnchor="end">{r.label}</text>
            <line x1={X(r.base)} x2={X(r.main)} y1={y} y2={y} stroke={GREY_LINE} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={X(r.base)} cy={y} r="4.5" fill={INK} />
            <circle cx={X(r.main)} cy={y} r="5" fill={BLUE} />
            <text x={R + 56} y={y + 4} fontSize="12" fontWeight="500" fill={i === 0 ? BLUE : INK} textAnchor="end">
              {r.value ?? `${r.main >= r.base ? "+" : "−"}${Math.abs(r.main - r.base).toFixed(decimals)}`}
            </text>
          </g>
        );
      })}
      <text x="0" y={H - 2} fontSize="11"><tspan fill={BLUE}>● {legend[0]}</tspan><tspan fill={INK}>   ● {legend[1]}</tspan></text>
    </svg>
  );
}

/* ── DotPlot: one dot per row on a single axis; the first row is the one to look at ── */

export function DotPlot({
  title,
  rows,
  min,
  max,
  ticks,
  decimals = 2,
  aria,
}: {
  title: string;
  rows: { label: string; value: number }[];
  min: number;
  max: number;
  ticks: number[];
  decimals?: number;
  aria: string;
}) {
  const L = 160, R = 500, row = 20, T = 22, X = (v: number) => L + ((v - min) / (max - min)) * (R - L);
  const H = T + rows.length * row + 24;
  return (
    <svg viewBox={`0 0 560 ${H}`} preserveAspectRatio="xMinYMin meet" role="img" aria-label={aria}>
      <text x="0" y="10" fontSize="10" letterSpacing="1.2" fill={GREY}>{title.toUpperCase()}</text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={T - 8} y2={T + rows.length * row - 6} stroke={GREY_GRID} />
          <text x={X(t)} y={T + rows.length * row + 8} fontSize="11" fill={GREY} textAnchor="middle">{tick(t, decimals)}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = T + i * row + 6;
        return (
          <g key={r.label}>
            <text x={L - 14} y={y + 4} fontSize="12" fill={i === 0 ? BLUE : GREY} textAnchor="end" fontWeight={i === 0 ? 600 : 400}>{r.label}</text>
            <line x1={L} x2={X(r.value)} y1={y} y2={y} stroke={i === 0 ? BLUE : GREY_LINE} strokeWidth="2" strokeLinecap="round" />
            <circle cx={X(r.value)} cy={y} r="5" fill={i === 0 ? BLUE : INK} />
            <text x={X(r.value) + 12} y={y + 4} fontSize="12" fontWeight="500" fill={i === 0 ? BLUE : INK}>{r.value.toFixed(decimals)}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Ticks: `total` small ticks in one row, the first `count` in blue; each rises in, one after the other ── */

export function Ticks({ total, count, leftLabel, rightLabel, aria }: { total: number; count: number; leftLabel: string; rightLabel: string; aria: string }) {
  const step = 520 / total;
  return (
    <svg className="ticks" viewBox="0 0 520 54" preserveAspectRatio="xMinYMin meet" role="img" aria-label={aria}>
      {Array.from({ length: total }, (_, i) => (
        <line key={i} x1={i * step + 2} x2={i * step + 2} y1="2" y2="30" stroke={i < count ? BLUE : GREY_LINE} strokeWidth="3.5" strokeLinecap="round" style={{ animationDelay: `${0.25 + i * 0.012}s` }} />
      ))}
      <text x="0" y="48" fontSize="12" fill={BLUE}>{leftLabel}</text>
      <text x="520" y="48" fontSize="12" fill={GREY} textAnchor="end">{rightLabel}</text>
    </svg>
  );
}

/* ── Scorecard: one row per item, with a size (a dot, or a range with a flag), a pair of scores, or a short text ── */

export type ScoreRow = {
  label: string;
  sub: string;
  size?: number | [number, number];
  flag?: string; // shown after a size range
  score?: [base: number, main: number];
  text?: string;
};

export function Scorecard({
  headings,
  rows,
  sizeTicks,
  scoreTicks,
  sizeRef,
  aria,
}: {
  headings: { label: string; size: string; score: string };
  rows: ScoreRow[];
  sizeTicks: number[];
  scoreTicks: number[];
  sizeRef?: number; // a dashed reference line on the size axis
  aria: string;
}) {
  const S0 = 232, S1 = 352, K0 = 396, K1 = 540, T = 36, row = 38;
  const sMax = sizeTicks[sizeTicks.length - 1], kMax = scoreTicks[scoreTicks.length - 1];
  const xs = (v: number) => S0 + (v / sMax) * (S1 - S0), xk = (v: number) => K0 + (v / kMax) * (K1 - K0);
  const H = T + rows.length * row + 14;
  return (
    <svg viewBox={`0 0 560 ${H}`} preserveAspectRatio="xMinYMin meet" role="img" aria-label={aria}>
      <text x="0" y="10" fontSize="10" letterSpacing="1.2" fill={GREY}>{headings.label.toUpperCase()}</text>
      <text x={S0} y="10" fontSize="10" letterSpacing="1.2" fill={GREY}>{headings.size.toUpperCase()}</text>
      <text x={K0} y="10" fontSize="10" letterSpacing="1.2" fill={GREY}>{headings.score.toUpperCase()}</text>
      {sizeRef !== undefined && <line x1={xs(sizeRef)} x2={xs(sizeRef)} y1={T - 8} y2={T + rows.length * row - 14} stroke={GREY_LINE} strokeDasharray="2 3" />}
      {sizeTicks.map((t) => <text key={t} x={xs(t)} y={H - 2} fontSize="10.5" fill={GREY} textAnchor="middle">{t}</text>)}
      {scoreTicks.map((t) => <text key={t} x={xk(t)} y={H - 2} fontSize="10.5" fill={GREY} textAnchor="middle">{t}</text>)}
      {rows.map((r, i) => {
        const y = T + i * row + 4;
        return (
          <g key={r.label}>
            {i > 0 && <line x1="0" x2="560" y1={y - 20} y2={y - 20} stroke={GREY_GRID} />}
            <text x="0" y={y} fontSize="12.5" fontWeight="500">{r.label}</text>
            <text x="0" y={y + 15} fontSize="10.5" fill={GREY}>{r.sub}</text>
            {typeof r.size === "number" && <><circle cx={xs(r.size)} cy={y - 4} r="5" fill={BLUE} /><text x={xs(r.size) + 11} y={y} fontSize="12" fontWeight="500" fill={BLUE}>{r.size.toFixed(2)}</text></>}
            {Array.isArray(r.size) && <><line x1={xs(r.size[0])} x2={xs(r.size[1])} y1={y - 4} y2={y - 4} stroke={INK} strokeWidth="4" strokeLinecap="round" />{r.flag && <text x={xs(r.size[1]) + 10} y={y} fontSize="12" fontWeight="500">{r.flag}</text>}</>}
            {r.score && (
              <>
                <line x1={xk(r.score[0])} x2={xk(r.score[1])} y1={y - 4} y2={y - 4} stroke={GREY_LINE} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={xk(r.score[0])} cy={y - 4} r="4.5" fill={INK} />
                <circle cx={xk(r.score[1])} cy={y - 4} r="5" fill={BLUE} />
                <text x={xk(r.score[1]) + 11} y={y} fontSize="12" fontWeight="500" fill={BLUE}>{r.score[1].toFixed(2)}</text>
              </>
            )}
            {r.text && <text x={K0} y={y} fontSize="12" fontWeight="500">{r.text}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Style-guide pieces ── */

/** The share of the page each colour takes, as one bar and a legend. Defaults to the palette in lib/colors.ts (dummy shares). */
export function ColourBar({ palette = PALETTE }: { palette?: { name: string; hex: string; role: string; share: number }[] }) {
  const edge = (hex: string) => (hex === "#ffffff" ? `1px solid ${GREY_AXIS}` : "none");
  return (
    <div className="cbar">
      <div className="cbar-b" role="img" aria-label={palette.map((c) => `${c.name} ${c.share} %`).join(", ") + " of the pixels"}>
        {palette.map((c) => (
          <span key={c.name} style={{ flexGrow: c.share, background: c.hex, minWidth: c.share < 1 ? 3 : 0, outline: edge(c.hex), outlineOffset: -1 }} />
        ))}
      </div>
      <ul>
        {palette.map((c) => (
          <li key={c.name}>
            <i style={{ background: c.hex, outline: edge(c.hex), outlineOffset: -1 }} />
            <b>{c.name}</b>
            <span>{c.hex}</span>
            <em>{c.role}</em>
            <span>{c.share} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const bez = (x1: number, y1: number, x2: number, y2: number, n = 24) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const u = k / n, v = 1 - u;
    return [3 * v * v * u * x1 + 3 * v * u * u * x2 + u ** 3, 3 * v * v * u * y1 + 3 * v * u * u * y2 + u ** 3] as const;
  });

/** The motion tokens from lib/motion.ts, drawn as curves and played on a track. */
export function MotionDemo({ motions = MOTIONS }: { motions?: typeof MOTIONS }) {
  const [k, setK] = useState(0);
  return (
    <div className="mo">
      <button type="button" className="see-more" onClick={() => setK(k + 1)}>Replay</button>
      <ul>
        {motions.map((m) => (
          <li key={m.name}>
            <b>{m.name}</b>
            <svg viewBox="0 0 56 44" role="img" aria-label={`${m.name} easing curve`}>
              <path d="M2 42H54M2 42V2" fill="none" stroke={GREY_AXIS} />
              <polyline points={bez(...m.ease).map(([x, y]) => `${2 + x * 52},${42 - y * 40}`).join(" ")} fill="none" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="track"><i key={k} style={{ animationDuration: `${m.ms}ms`, animationTimingFunction: cubic(m.ease) }} /></span>
            <code>{m.ms} ms · {m.ease.join(", ")}</code>
            <em>{m.note}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The parts of the interface, as they are used. */
export function Specimens() {
  return (
    <ul className="spec">
      <li><a className="spec-link" href="#spec" onClick={(e) => e.preventDefault()}>Link</a><span>link</span></li>
      <li><b className="spec-on">1</b><span>chip, on</span></li>
      <li><b className="spec-off">1</b><span>chip, off</span></li>
      <li><b className="spec-cur"><i>/</i>Current</b><span>point</span></li>
      <li><b className="spec-pt">Other</b><span>point</span></li>
      <li><b className="spec-in">Text<u /></b><span>input</span></li>
    </ul>
  );
}

/** The layout system, drawn: the shape, its keep-out, and where the text goes. Desktop on the left, phone on the right. */
export function LayoutFigure({ gap = 28, trails = 16 }: { gap?: number; trails?: number }) {
  const bars = (x: number, y: number, w: number[]) => w.map((l, i) => <rect key={i} x={x} y={y + i * 9} width={l} height="3" fill={INK} />);
  return (
    <svg viewBox="0 0 560 304" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Layout system: the shape, its keep-out area and the free area where the text goes">
      <text x="0" y="12" fontSize="12" fontWeight="600">Layout · desktop and phone</text>
      <rect x="0.5" y="26.5" width="380" height="214" fill="none" stroke={GREY_LINE} />
      <rect x="14.5" y="40.5" width="351" height="186" fill="none" stroke={GREY_LINE} strokeDasharray="3 3" />
      <ellipse cx="262" cy="133" rx="62" ry="44" fill="none" stroke={INK} strokeWidth="1.6" />
      <ellipse cx="262" cy="133" rx="90" ry="72" fill="none" stroke={BLUE} strokeDasharray="4 3" />
      <line x1="324" x2="352" y1="133" y2="133" stroke={BLUE} strokeWidth="1.2" />
      <text x="356" y="137" fontSize="11" fill={BLUE}>{gap} px</text>
      {bars(34, 112, [84, 110, 70, 96])}
      <rect x="28" y="94" width="130" height="68" fill="none" stroke={INK} strokeDasharray="1 3" />
      <rect x="430.5" y="26.5" width="110" height="214" fill="none" stroke={GREY_LINE} />
      <ellipse cx="485" cy="76" rx="36" ry="26" fill="none" stroke={INK} strokeWidth="1.6" />
      <ellipse cx="485" cy="76" rx="52" ry="42" fill="none" stroke={BLUE} strokeDasharray="4 3" />
      {bars(444, 140, [70, 82, 56, 76, 62, 80, 50])}
      <text x="0" y="260" fontSize="12"><tspan fill={INK} fontWeight="600">The shape</tspan><tspan fill={GREY}>  one attractor, drawn with {trails} trails of points</tspan></text>
      <text x="0" y="277" fontSize="12"><tspan fill={BLUE} fontWeight="600">Keep-out</tspan><tspan fill={GREY}>  the shape&apos;s reach plus {gap} px, dashed blue</tspan></text>
      <text x="0" y="294" fontSize="12"><tspan fill={INK} fontWeight="600">Free area</tspan><tspan fill={GREY}>  inside the safe frame (dashed grey); the text goes in the nearest one</tspan></text>
    </svg>
  );
}

/** The type scale: one row per style, each set in its own style with its spec underneath. */
export type ScaleRow = { label: string; sample: string; style?: React.CSSProperties; spec: string; mono?: boolean };

export const SCALE: ScaleRow[] = [
  { label: "Title", sample: "Aa Title", style: { fontSize: "var(--t-h2)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1 }, spec: "Geist 900 · 2.4 em · −0.045 em" },
  { label: "Lead", sample: "One line, said plainly.", style: { fontSize: "var(--t-lead)", fontWeight: 600, letterSpacing: "-0.02em" }, spec: "Geist 600 · 1.1 em · −0.02 em" },
  { label: "Body", sample: "Text for reading, at one size.", spec: "Geist 400 · 1 em" },
  { label: "Note", sample: "A quiet note under a slide.", style: { fontSize: "var(--t-note)", color: "var(--grey-quiet)" }, spec: "Geist 400 · 0.88 em · grey" },
  { label: "Label", sample: "LABEL · LABEL · LABEL", spec: "Geist Mono 500 · 0.78 em · caps", mono: true },
];

export function TypeScale({ rows = SCALE }: { rows?: ScaleRow[] }) {
  return (
    <ul className="scale">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="sc-label">{r.label}</span>
          <span className={`sc-sample${r.mono ? " mono" : ""}`} style={r.style}>{r.sample}</span>
          <span className="sc-spec">{r.spec}</span>
        </li>
      ))}
    </ul>
  );
}
