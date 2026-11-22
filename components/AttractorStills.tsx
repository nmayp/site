"use client";

// Four small stills of the attractors the scene cycles through. Each is one point traced by one
// path; the last stretch of the path is blue, like the head that runs along the trails.

import { useEffect, useRef } from "react";
import { ATTRACTORS } from "./Scene";

function Still({ index }: { index: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const at = ATTRACTORS[index];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 160, H = 110;
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    // one path: settle onto the attractor, then record it
    const p = [0.3, 0.2, 0.4], k1 = [0, 0, 0], k2 = [0, 0, 0], k3 = [0, 0, 0], k4 = [0, 0, 0];
    const h = at.dt;
    const step = () => {
      const [x, y, z] = p;
      at.f(x, y, z, k1);
      at.f(x + (h / 2) * k1[0], y + (h / 2) * k1[1], z + (h / 2) * k1[2], k2);
      at.f(x + (h / 2) * k2[0], y + (h / 2) * k2[1], z + (h / 2) * k2[2], k3);
      at.f(x + h * k3[0], y + h * k3[1], z + h * k3[2], k4);
      for (let i = 0; i < 3; i++) p[i] += (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    };
    for (let i = 0; i < 3000; i++) step();
    const N = 9000;
    const pts: [number, number][] = [];
    for (let i = 0; i < N; i++) {
      step();
      // the same axes the scene uses, seen face-on
      pts.push([p[at.axes[0]], p[at.axes[1]] * 0 + p[at.axes[2]]]);
    }
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const sc = Math.min((W - 12) / (x1 - x0), (H - 12) / (y1 - y0));
    const ox = (W - (x1 - x0) * sc) / 2, oy = (H - (y1 - y0) * sc) / 2;
    const to = (q: [number, number]) => [ox + (q[0] - x0) * sc, H - (oy + (q[1] - y0) * sc)] as const;
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    pts.forEach((q, i) => {
      const [x, y] = to(q);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // the head and its tail
    const tail = Math.floor(N * 0.07);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "#1840ff";
    ctx.beginPath();
    for (let i = N - tail; i < N; i++) {
      const [x, y] = to(pts[i]);
      if (i === N - tail) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [index]);
  return (
    <figure className="still">
      <canvas ref={ref} role="img" aria-label={`${ATTRACTORS[index].name} attractor`} style={{ width: "100%", aspectRatio: "160 / 110" }} />
      <figcaption>{ATTRACTORS[index].name}</figcaption>
    </figure>
  );
}

export default function AttractorStills() {
  return (
    <div className="stills">
      {[0, 1, 2, 3].map((i) => (
        <Still key={i} index={i} />
      ))}
    </div>
  );
}
