"use client";

/**
 * The scene: a 3-D chaotic attractor (Aizawa, Thomas, Halvorsen or Lorenz; each
 * press morphs it into the next one), drawn with raw WebGL as 16 long trails of
 * fine black points, one of them blue. The shape breathes slowly and sways
 * instead of spinning all the way round, so the text can stay still beside it.
 *
 * Each child is one text block. Each press (click, tap, space or right arrow)
 * flies the camera to the next block. A block is pinned to its own point in
 * the scene but always kept in the white space beside the shape, never on it.
 *
 * Window events it listens for:
 *   "bench"        detail true/false: a panel opened/closed; the shape moves into the
 *                  panel's empty .bench-sim cell, or back out.
 *   "bench-layout" the panel's layout changed; re-read where the .bench-sim cell is.
 *   "bench-step"   detail 1/-1: the panel moved to another slide; the shape turns once.
 */

import { Children, useEffect, useRef, useState } from "react";
import { GLIDE_MS, MOVE_MS } from "@/lib/motion";

type Flow = (x: number, y: number, z: number, o: number[]) => void;
// each: the flow, a time step, and how to map its axes to ours (y is up)
export const ATTRACTORS: { name: string; f: Flow; dt: number; axes: [number, number, number] }[] = [
  {
    name: "Aizawa",
    f: (x, y, z, o) => {
      o[0] = (z - 0.7) * x - 3.5 * y;
      o[1] = 3.5 * x + (z - 0.7) * y;
      o[2] = 0.6 + 0.95 * z - (z * z * z) / 3 - (x * x + y * y) * (1 + 0.25 * z) + 0.1 * z * x * x * x;
    },
    dt: 0.006,
    axes: [0, 2, 1],
  },
  {
    name: "Thomas",
    f: (x, y, z, o) => {
      o[0] = Math.sin(y) - 0.208186 * x;
      o[1] = Math.sin(z) - 0.208186 * y;
      o[2] = Math.sin(x) - 0.208186 * z;
    },
    dt: 0.05,
    axes: [0, 1, 2],
  },
  {
    name: "Halvorsen",
    f: (x, y, z, o) => {
      o[0] = -1.4 * x - 4 * y - 4 * z - y * y;
      o[1] = -1.4 * y - 4 * z - 4 * x - z * z;
      o[2] = -1.4 * z - 4 * x - 4 * y - x * x;
    },
    dt: 0.004,
    axes: [0, 1, 2],
  },
  {
    name: "Lorenz",
    f: (x, y, z, o) => {
      o[0] = 10 * (y - x);
      o[1] = x * (28 - z) - y;
      o[2] = x * y - (8 / 3) * z;
    },
    dt: 0.0025,
    axes: [0, 2, 1],
  },
];
const TRAILS = 16;
const BLUE = new Set([7]); // each trail covers the whole shape, so one is plenty
const SWAY = 0.3; // radians either side
const WARP = 0.07; // how far the slow, regular breathing can push points, world units

// where each line of text sits in the scene, and how the camera frames it
const ANCHORS: [number, number, number][] = [
  [-1.05, 0.55, 0.35],
  [1.15, -0.35, -0.45],
  [-0.7, -0.85, 0.7],
  [0.95, 0.8, 0.15],
];
const SHOTS = [
  { yaw: 0.35, pitch: 0.25, dist: 3.4, pull: 0 }, // before the first press
  // yaws stay near face-on (0 or π) so the shape always reads wide
  { yaw: -0.45, pitch: 0.35, dist: 3.3, pull: 0.55 },
  { yaw: 0.5, pitch: -0.25, dist: 3.2, pull: 0.55 },
  { yaw: -0.35, pitch: 0.3, dist: 3.4, pull: 0.55 },
  { yaw: 0.4, pitch: -0.3, dist: 3.3, pull: 0.55 },
];

type V3 = [number, number, number];
type Shot = { yaw: number; pitch: number; dist: number; target: V3 };

/* ── tiny mat4 (column-major) ── */
const mul = (a: Float32Array, b: Float32Array) => {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      o[i * 4 + j] = s;
    }
  return o;
};
const perspective = (fov: number, aspect: number, n: number, f: number) => {
  const t = 1 / Math.tan(fov / 2);
  return new Float32Array([t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]);
};
const lookAt = (e: V3, c: V3): Float32Array => {
  const norm = (v: V3) => {
    const l = Math.hypot(...v);
    return v.map((x) => x / l) as V3;
  };
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const z = norm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]);
  const x = norm(cross([0, 1, 0], z));
  const y = cross(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
};
const rotY = (t: number) => new Float32Array([Math.cos(t), 0, -Math.sin(t), 0, 0, 1, 0, 0, Math.sin(t), 0, Math.cos(t), 0, 0, 0, 0, 1]);

/**
 * One attractor → interleaved [x, y, z, s + 2·blue] points, centred, ±0.725 across, x stretched by `wide`; s runs 0→1 along each trail.
 * A generator that yields every so often, so `sliced` can run it in small
 * pieces without freezing the page (building a shape takes hundreds of ms).
 */
function* build(at: (typeof ATTRACTORS)[number], perTrail: number, wide: number): Generator<void, Float32Array> {
  const { f, dt, axes } = at;
  const k1 = [0, 0, 0], k2 = [0, 0, 0], k3 = [0, 0, 0], k4 = [0, 0, 0];
  const step = (p: number[]) => {
    const [x, y, z] = p, h = dt;
    f(x, y, z, k1);
    f(x + (h / 2) * k1[0], y + (h / 2) * k1[1], z + (h / 2) * k1[2], k2);
    f(x + (h / 2) * k2[0], y + (h / 2) * k2[1], z + (h / 2) * k2[2], k3);
    f(x + h * k3[0], y + h * k3[1], z + h * k3[2], k4);
    for (let i = 0; i < 3; i++) p[i] += (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  };
  const raw = new Float32Array(TRAILS * perTrail * 3);
  let k = 0;
  for (let t = 0; t < TRAILS; t++) {
    const p = [0.1 + Math.random() * 0.5, 0.1 + Math.random() * 0.5, 0.1 + Math.random() * 0.5];
    for (let i = 0; i < 3000; i++) step(p); // settle onto the attractor
    yield;
    for (let i = 0; i < perTrail; i++) {
      step(p);
      raw[k++] = p[axes[0]];
      raw[k++] = p[axes[1]];
      raw[k++] = p[axes[2]];
      if ((i & 2047) === 2047) yield;
    }
  }
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < raw.length; i += 3) {
    for (let j = 0; j < 3; j++) (lo[j] = Math.min(lo[j], raw[i + j])), (hi[j] = Math.max(hi[j], raw[i + j]));
    if ((i & 0x1ffff) === 0) yield;
  }
  const c = lo.map((v, j) => (v + hi[j]) / 2), sc = 1.45 / Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  const out = new Float32Array(TRAILS * perTrail * 4);
  for (let i = 0, o = 0; i < raw.length / 3; i++) {
    const t = Math.floor(i / perTrail);
    out[o++] = (raw[i * 3] - c[0]) * sc * wide;
    out[o++] = (raw[i * 3 + 1] - c[1]) * sc;
    out[o++] = (raw[i * 3 + 2] - c[2]) * sc;
    out[o++] = (i % perTrail) / perTrail + (BLUE.has(t) ? 2 : 0);
    if ((i & 0xffff) === 0) yield;
  }
  return out;
}

/** Runs a generator a few ms at a time, leaving the browser free to draw and answer input in between; null if `alive` turns false. */
const sliced = <T,>(gen: Generator<void, T>, alive: () => boolean) =>
  new Promise<T | null>((resolve) => {
    const tick = () => {
      if (!alive()) return resolve(null);
      const t0 = performance.now();
      for (;;) {
        const r = gen.next();
        if (r.done) return resolve(r.value);
        if (performance.now() - t0 > 6) break;
      }
      setTimeout(tick, 0);
    };
    setTimeout(tick, 0);
  });

const VS = `
attribute vec4 a, b; // the point on the old shape and on the new one
uniform mat4 m;
uniform float size, time, morph;
varying float blue;
void main() {
  // every point goes in a straight line from its place on the old shape to its place on the
  // new one, all together, on the same easing as the camera
  vec3 pos = mix(a.xyz, b.xyz, morph);
  blue = step(1.5, morph < 0.5 ? a.w : b.w);
  // a slow, regular breathing, so the shape stays readable
  vec3 q = pos + ${WARP.toFixed(3)} * vec3(
    sin(pos.y * 1.3 + time * 0.35),
    sin(pos.z * 1.2 + time * 0.30),
    sin(pos.x * 1.1 + time * 0.40));
  gl_Position = m * vec4(q, 1.0);
  gl_PointSize = size;
}`;
const FS = `
precision mediump float;
uniform float alpha;
varying float blue;
void main() {
  gl_FragColor = mix(vec4(0.0, 0.0, 0.0, alpha), vec4(0.094, 0.251, 1.0, alpha), blue);
}`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export default function Scene({ children }: { children: React.ReactNode }) {
  const lines = Children.toArray(children);
  const [active, setActive] = useState(-1);
  const canvas = useRef<HTMLCanvasElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const goRef = useRef<(i: number) => void>(() => {});
  const benchRef = useRef(false);

  useEffect(() => {
    const cv = canvas.current!;
    const gl = cv.getContext("webgl", { antialias: true, alpha: false })!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = innerWidth < 700;
    const PER = small ? 16000 : 38000;
    const WIDE = small ? 1.1 : 1.5;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const uM = gl.getUniformLocation(prog, "m"), uSize = gl.getUniformLocation(prog, "size"), uAlpha = gl.getUniformLocation(prog, "alpha");
    const uTime = gl.getUniformLocation(prog, "time");
    const uMorph = gl.getUniformLocation(prog, "morph");
    const aA = gl.getAttribLocation(prog, "a"), aB = gl.getAttribLocation(prog, "b");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(1, 1, 1, 1);

    // the old shape and the new one; each point flows from its place on one
    // to the same-numbered point on the other. Each attractor is built once, a
    // few ms at a time in the background, and kept (CPU copy + GPU buffer), so
    // a press never has to compute or upload a shape.
    const count = TRAILS * PER;
    const cache: (Float32Array | undefined)[] = [];
    const bufs: (WebGLBuffer | undefined)[] = [];
    const loading: (Promise<void> | undefined)[] = [];
    const midBuf = gl.createBuffer()!; // scratch buffer, for a press that lands mid-morph
    let alive = true;
    let shape = 0, morphStart = -Infinity, waiting = false, ready = false;
    let shapeA: Float32Array = new Float32Array(0), shapeB: Float32Array = shapeA;
    let bufA = midBuf, bufB = midBuf;
    const point = () => {
      for (const [loc, buf] of [[aA, bufA], [aB, bufB]] as const) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);
      }
    };
    const load = (i: number) =>
      (loading[i] ??= sliced(build(ATTRACTORS[i], PER, WIDE), () => alive).then((pts) => {
        if (!pts) return;
        const b = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
        cache[i] = pts;
        bufs[i] = b;
      }));
    const MORPH = still ? 1 : MOVE_MS;
    const morphAt = (now: number) => (waiting ? 0 : ease(Math.min(1, (now - morphStart) / MORPH)));

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio, 2);
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      gl.viewport(0, 0, cv.width, cv.height);
    };

    // camera: ease from one shot to the next
    const shotFor = (i: number): Shot => {
      const s = SHOTS[i + 1];
      const t = i < 0 ? [0, 0, 0] : ANCHORS[i];
      return { yaw: s.yaw, pitch: s.pitch, dist: s.dist * (small ? 2.0 : 1.2), target: t.map((v) => v * s.pull * (small ? 0 : 1)) as V3 };
    };
    let from = shotFor(-1), to = from, moveStart = -1e9;
    const MOVE = still ? 1 : MOVE_MS;
    const camAt = (now: number): Shot => {
      const k = ease(Math.min(1, (now - moveStart) / MOVE));
      const l = (a: number, b: number) => a + (b - a) * k;
      return { yaw: l(from.yaw, to.yaw), pitch: l(from.pitch, to.pitch), dist: l(from.dist, to.dist), target: [0, 1, 2].map((j) => l(from.target[j], to.target[j])) as V3 };
    };
    goRef.current = (i: number) => {
      const now = performance.now();
      from = camAt(now);
      to = shotFor(i);
      moveStart = now;
      if (!ready) return; // the first shape is still being built; it appears when it is
      // morph into the next attractor, starting from wherever the last morph got to
      if (!waiting) {
        const k = morphAt(now);
        if (k >= 1) (shapeA = shapeB), (bufA = bufB);
        else {
          const mid = new Float32Array(shapeA.length);
          for (let j = 0; j < mid.length; j++) mid[j] = j % 4 === 3 ? (k < 0.5 ? shapeA[j] : shapeB[j]) : shapeA[j] + (shapeB[j] - shapeA[j]) * k;
          gl.bindBuffer(gl.ARRAY_BUFFER, midBuf);
          gl.bufferData(gl.ARRAY_BUFFER, mid, gl.DYNAMIC_DRAW);
          (shapeA = mid), (bufA = midBuf);
        }
      }
      const idx = (shape = (shape + 1) % ATTRACTORS.length);
      const begin = () => {
        shapeB = cache[idx]!;
        bufB = bufs[idx]!;
        point();
        morphStart = performance.now();
        waiting = false;
        if (still) requestAnimationFrame(draw);
      };
      if (cache[idx]) begin();
      else {
        // not built yet (only if pressed within the first seconds): hold the
        // current shape, and morph as soon as the new one is ready
        (shapeB = shapeA), (bufB = bufA);
        waiting = true;
        point();
        load(idx).then(() => alive && shape === idx && begin());
      }
    };

    const viewOf = (c: Shot, aspect = cv.width / cv.height) => {
      const eye: V3 = [
        c.target[0] + c.dist * Math.sin(c.yaw) * Math.cos(c.pitch),
        c.target[1] + c.dist * Math.sin(c.pitch),
        c.target[2] + c.dist * Math.cos(c.yaw) * Math.cos(c.pitch),
      ];
      return mul(perspective(0.75, aspect, 0.05, 50), lookAt(eye, c.target));
    };
    const toScreen = (m: Float32Array, px: number, py: number, pz: number) => {
      const w = m[3] * px + m[7] * py + m[11] * pz + m[15];
      if (w <= 0) return null;
      return [((m[0] * px + m[4] * py + m[8] * pz + m[12]) / w + 1) * (innerWidth / 2), (1 - (m[1] * px + m[5] * py + m[9] * pz + m[13]) / w) * (innerHeight / 2)];
    };

    // where line i should rest when seen through `view`: its anchor, unless
    // that would touch anything the attractor can reach (over its sway and
    // warp, and both shapes while it morphs); then the nearest free side
    const GAP = 28, EDGE = 16, TOP = 64, FOOT = 56; // TOP and FOOT keep text clear of the corner labels and the progress rail
    const spot = (i: number, view: Float32Array) => {
      const el = els.current[i]!;
      const W = innerWidth, H = innerHeight;
      const sways = [-1, -0.5, 0, 0.5, 1].map((k) => mul(view, rotY(SWAY * k)));
      let l = W, r = 0, t = H, b = 0;
      for (const pts of morphAt(performance.now()) < 1 ? [shapeA, shapeB] : [shapeB])
        for (let k = 0; k < pts.length; k += 4 * 997)
          for (const m of sways)
            for (const d of [-WARP, WARP]) {
              const s = toScreen(m, pts[k] + d, pts[k + 1] + d, pts[k + 2] + d);
              if (s) (l = Math.min(l, s[0])), (r = Math.max(r, s[0])), (t = Math.min(t, s[1])), (b = Math.max(b, s[1]));
            }
      const hw = el.offsetWidth / 2, hh = el.offsetHeight / 2;
      const [x, y] = toScreen(view, ...ANCHORS[i]) ?? [W / 2, H / 2];
      // overlap area between the line and the attractor (plus a gap)
      const overlap = (cx: number, cy: number) =>
        Math.max(0, Math.min(cx + hw, r + GAP) - Math.max(cx - hw, l - GAP)) * Math.max(0, Math.min(cy + hh, b + GAP) - Math.max(cy - hh, t - GAP));
      if (overlap(x, y) === 0) return [x, y];
      const clampY = (v: number) => Math.min(H - FOOT - hh, Math.max(TOP + hh, v));
      const clampX = (v: number) => Math.min(W - EDGE - hw, Math.max(EDGE + hw, v));
      // the four sides, kept on screen; least overlap wins, then nearest
      const options = [
        [clampX(l - GAP - hw), clampY(y)],
        [clampX(r + GAP + hw), clampY(y)],
        [clampX(x), clampY(t - GAP - hh)],
        [clampX(x), clampY(b + GAP + hh)],
      ];
      const score = ([cx, cy]: number[]) => overlap(cx, cy) * 1e3 + Math.hypot(cx - x, cy - y);
      return options.reduce((p, q) => (score(q) < score(p) ? q : p));
    };

    // the resting spot is worked out once per press, so a line glides
    // straight to it and then never moves until the next press (or until it
    // changes size, e.g. "see more", or the window does)
    const GLIDE = still ? 1 : GLIDE_MS;
    const pos: number[][] = [];
    let current = -1, leaving = -1, leaveFrom = [0, 0], inFrom: number[] | null = null, target = [0, 0];
    let glideFrom: number[] | null = null, glideStart = -Infinity, dirty = false;
    const place = (i: number, p: number[]) => {
      pos[i] = p;
      els.current[i]!.style.transform = `translate(${p[0]}px, ${p[1]}px) translate(-50%, -50%)`;
    };
    const lerp = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    const go = goRef.current;
    goRef.current = (i: number) => {
      leaving = current;
      if (leaving >= 0) leaveFrom = pos[leaving];
      inFrom = leaving >= 0 ? [...pos[leaving]] : null;
      go(i);
      current = i;
      target = spot(i, viewOf(to));
      glideFrom = null;
    };

    // a panel is open: the attractor shrinks into its empty cell, seen
    // face-on from a distance that fits it there
    let bench = false, benchStart = -Infinity, slot = [0, 0, innerWidth, innerHeight];
    const readSlot = () => {
      const r = document.querySelector(".bench-sim")?.getBoundingClientRect();
      if (r && r.width > 0) slot = [r.left, r.top, r.width, r.height];
    };
    const benchShot = (): Shot => {
      const aspect = slot[2] / slot[3];
      // half-size of the shape ≈ 0.75 tall, 0.75·WIDE wide; tan(fov/2) ≈ 0.39
      const dist = 1.15 * Math.max(0.8 / 0.39, (0.8 * WIDE) / (0.39 * aspect));
      return { yaw: to.yaw, pitch: 0.3, dist, target: [0, 0, 0] };
    };
    const onBench = (e: Event) => {
      const open = (e as CustomEvent<boolean>).detail;
      if (open === bench) return;
      const now = performance.now();
      bench = benchRef.current = open;
      benchStart = now;
      from = camAt(now);
      if (open) {
        readSlot();
        to = benchShot();
      } else {
        to = shotFor(current);
        leaving = -1;
      }
      // the slides spin it whole turns: drop them, so it only turns the short way back
      const d = from.yaw - to.yaw;
      from = { ...from, yaw: to.yaw + Math.atan2(Math.sin(d), Math.cos(d)) };
      moveStart = now;
      if (still) requestAnimationFrame(draw);
    };
    const onBenchLayout = () => {
      readSlot();
      if (bench) {
        const now = performance.now();
        from = camAt(now);
        to = benchShot();
        moveStart = now;
        if (still) requestAnimationFrame(draw);
      }
    };
    // the panel moved to another slide: one full turn, ending where it began
    const onBenchStep = (e: Event) => {
      if (!bench) return;
      const now = performance.now();
      const dir = (e as CustomEvent<number>).detail < 0 ? -1 : 1;
      from = camAt(now);
      readSlot();
      to = { ...benchShot(), yaw: from.yaw + dir * 2 * Math.PI };
      moveStart = now;
      if (still) requestAnimationFrame(draw);
    };
    addEventListener("bench", onBench);
    addEventListener("bench-layout", onBenchLayout);
    addEventListener("bench-step", onBenchStep);

    let raf = 0, clock = 0, prevT = performance.now();
    const draw = (now: number) => {
      const dt = now - prevT;
      if (!still) clock += dt / 1000;
      prevT = now;
      // the attractor's box on screen: the whole window, or the panel's
      // empty cell, easing between the two
      const bk = ease(Math.min(1, (now - benchStart) / MOVE));
      const bx = bench ? bk : 1 - bk;
      const box = [0, 1, 2, 3].map((j) => [0, 0, innerWidth, innerHeight][j] + (slot[j] - [0, 0, innerWidth, innerHeight][j]) * bx);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.viewport(box[0] * dpr, (innerHeight - box[1] - box[3]) * dpr, box[2] * dpr, box[3] * dpr);
      const view = viewOf(camAt(now), box[2] / box[3]);
      const mvp = mul(view, rotY(SWAY * Math.sin(clock * 0.25)));

      gl.uniformMatrix4fv(uM, false, mvp);
      gl.uniform1f(uSize, 1.4 * dpr);
      gl.uniform1f(uTime, clock);
      gl.uniform1f(uMorph, morphAt(now));
      gl.uniform1f(uAlpha, 0.5);
      if (ready) gl.drawArrays(gl.POINTS, 0, count);

      if (current >= 0 && !bench && bk >= 1) {
        const k = ease(Math.min(1, (now - moveStart) / MOVE));
        if (dirty) {
          dirty = false;
          target = spot(current, k < 1 ? viewOf(to) : view);
          if (k >= 1) (glideFrom = pos[current]), (glideStart = now);
        }
        const anchor = (i: number) => toScreen(view, ...ANCHORS[i]) ?? target;
        if (k < 1) {
          // one straight path, from where the last line was to where this one rests, on the camera's easing;
          // the last line stays put and fades
          place(current, lerp(inFrom ?? anchor(current), target, k));
          if (leaving >= 0) place(leaving, leaveFrom);
        } else if (glideFrom) {
          const g = ease(Math.min(1, (now - glideStart) / GLIDE));
          place(current, lerp(glideFrom, target, g));
          if (g >= 1) glideFrom = null;
        } else if (pos[current]?.[0] !== target[0] || pos[current]?.[1] !== target[1]) place(current, target);
      }

      if (!still) raf = requestAnimationFrame(draw);
    };
    const onResize = () => {
      resize();
      dirty = true;
      if (still) draw(performance.now());
    };
    addEventListener("resize", onResize);
    // a line that changes size (e.g. "see more") gets placed again
    const ro = new ResizeObserver(() => {
      dirty = true;
      if (still) draw(performance.now());
    });
    els.current.forEach((el) => el && ro.observe(el));
    resize();
    // first shape, then the other three one at a time, all in the background
    load(0).then(() => {
      if (!alive) return;
      (shapeA = shapeB = cache[0]!), (bufA = bufB = bufs[0]!);
      point();
      ready = true;
      if (still) requestAnimationFrame(draw);
      (async () => {
        for (let i = 1; i < ATTRACTORS.length && alive; i++) await load(i);
      })();
    });
    if (still) {
      const go2 = goRef.current;
      goRef.current = (i) => (go2(i), requestAnimationFrame(draw));
      draw(performance.now());
    } else raf = requestAnimationFrame(draw);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      removeEventListener("bench", onBench);
      removeEventListener("bench-layout", onBenchLayout);
      removeEventListener("bench-step", onBenchStep);
      ro.disconnect();
      [midBuf, ...bufs].forEach((b) => b && gl.deleteBuffer(b));
    };
  }, []);

  const activeRef = useRef(-1);
  const next = () => {
    const n = (activeRef.current + 1) % lines.length;
    activeRef.current = n;
    setActive(n);
    goRef.current(n);
  };
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!benchRef.current && (e.key === " " || e.key === "ArrowRight")) {
        e.preventDefault();
        nextRef.current();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="stage"
      onPointerDown={(e) => {
        if (!benchRef.current && !(e.target as Element).closest("a, button")) next();
      }}
    >
      <canvas
        ref={canvas}
        role="img"
        aria-label="A slowly swaying 3-D sculpture of fine black and blue points traced by a chaotic attractor."
      />
      {lines.map((line, i) => (
        <div
          key={i}
          ref={(el) => {
            els.current[i] = el;
          }}
          className={`line${i === active ? " on" : ""}`}
        >
          {line}
        </div>
      ))}
      <button type="button" className="skip" onClick={next}>
        Next line
      </button>
      <div className="hint" aria-hidden="true">
        {active < 0 ? (
          <span className="press">Press anywhere</span>
        ) : (
          <>
            <span className="segs">
              {lines.map((_, i) => (
                <i key={i} className={i <= active ? "on" : ""} />
              ))}
            </span>
            <span className="count">
              {String(active + 1).padStart(2, "0")} / {String(lines.length).padStart(2, "0")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
