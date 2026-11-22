// An architecture diagram, drawn to the usual rules for these: a title with the kind of view, every element
// named with its technology and one line of what it does, every arrow labelled with what travels along it, and a key.
// Blue is your own code; black is data or a service you use. Text and thin lines only.
import { ICONS } from "./icons";
import { BLUE, GREY, GREY_RULE } from "@/lib/colors";

const W = 640;

export type ArchItem = { t: string; tech?: string; d?: string; icon?: string; own?: boolean };
export type ArchStage = { zone: string; items: ArchItem[]; flow?: boolean; link?: string };

function wrap(s: string, chars: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of s.split(" ")) {
    if ((line + " " + w).trim().length > chars) { out.push(line); line = w; } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out;
}

export default function Arch({ title, stages, aria }: { title: string; stages: ArchStage[]; aria: string }) {
  let y = 44;
  const parts: React.ReactNode[] = [];
  stages.forEach((st, si) => {
    const k = st.items.length, cw = W / k, chars = Math.floor((cw - (st.flow && k > 1 ? 56 : 34)) / 6.1);
    const lines = st.items.map((it) => (it.d ? wrap(it.d, chars) : []));
    const rows = Math.max(...lines.map((l) => l.length));
    const h = 26 + 20 + 14 + rows * 15 + 10;
    parts.push(
      <g key={si}>
        <text x="0" y={y + 4} fontSize="10" letterSpacing="1.2" fill={GREY}>{st.zone.toUpperCase()}</text>
        <line x1="0" x2={W} y1={y + 12} y2={y + 12} stroke={GREY_RULE} />
        {st.items.map((it, i) => {
          const x = i * cw, c = it.own ? BLUE : "#000", top = y + 34;
          return (
            <g key={it.t}>
              {it.icon && ICONS[it.icon] && <path d={ICONS[it.icon]} transform={`translate(${x},${top - 12}) scale(0.75)`} fill={c} />}
              <text x={x + (it.icon ? 24 : 0)} y={top + 2} fontSize="13.5" fontWeight="600" fill={c}>{it.t}</text>
              {it.tech && <text x={x + (it.icon ? 24 : 0)} y={top + 17} fontSize="10.5" fill={GREY} fontFamily="ui-monospace, monospace">{it.tech}</text>}
              {lines[i].map((l, j) => <text key={j} x={x + (it.icon ? 24 : 0)} y={top + 34 + j * 15} fontSize="12" fill="#000">{l}</text>)}
              {st.flow && i < k - 1 && (
                <line x1={x + cw - 34} x2={x + cw - 10} y1={top - 3} y2={top - 3} stroke="#000" strokeWidth="1.2" markerEnd="url(#ar-k)" />
              )}
            </g>
          );
        })}
        {st.link && si < stages.length - 1 && (
          <g>
            <line x1="9" x2="9" y1={y + h - 6} y2={y + h + 20} stroke="#000" strokeWidth="1.2" markerEnd="url(#ar-k)" />
            <text x="22" y={y + h + 10} fontSize="11.5" fill={GREY}>{st.link}</text>
          </g>
        )}
      </g>,
    );
    y += h + (st.link ? 30 : 12);
  });
  const H = y + 26;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMin meet" role="img" aria-label={aria}>
      <defs>
        <marker id="ar-k" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#000" /></marker>
      </defs>
      {parts}
      <text x="0" y="12" fontSize="12" fontWeight="600" fill="#000">{title}</text>
      <text x="0" y={H - 4} fontSize="10.5"><tspan fill={BLUE}>blue: own code</tspan><tspan fill={GREY}>   black: data or a service   arrow: what is sent, and how</tspan></text>
    </svg>
  );
}
