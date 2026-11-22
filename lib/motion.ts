// The motion tokens, as numbers. styles/tokens.css holds the same values as CSS
// custom properties; if you change one, change the other. The kit page plays
// these in its motion demo.

/** An easing curve: the four numbers of a CSS cubic-bezier(x1, y1, x2, y2). */
export type Curve = [number, number, number, number];

/** New text rises in and comes into focus. Soft landing: starts fast, settles slowly. */
export const RISE_MS = 900;
export const RISE_EASE: Curve = [0.16, 1, 0.3, 1];

/** Old text lifts away. Short, and it starts slowly, so it gets out of the way before the next text arrives. */
export const LEAVE_MS = 240;
export const LEAVE_EASE: Curve = [0.5, 0, 0.75, 0];

/** Each line of a new slide starts this long after the line above it. */
export const STAGGER_MS = 70;

/** The slash mark slides to the chosen point (same curve as the rise). */
export const BAR_MS = 700;
export const BAR_EASE: Curve = RISE_EASE;

/** Numbers count up to their value over this long. */
export const COUNT_MS = 1100;

/** The camera flight to the next text block, and the morph into the next shape, take this long. */
export const MOVE_MS = 2000;

/** A text block glides to its resting spot beside the shape over this long. */
export const GLIDE_MS = 450;

/** The shape turns once, all the way round, with every move from one slide to the next. */
export const TURNS_PER_MOVE = 1;

/** The curve as a CSS string, e.g. "cubic-bezier(0.16,1,0.3,1)". */
export const cubic = (c: Curve) => `cubic-bezier(${c.join(",")})`;

/** The named motions, in the order the kit page shows them. */
export const MOTIONS: { name: string; ms: number; ease: Curve; note: string }[] = [
  { name: "Rise", ms: RISE_MS, ease: RISE_EASE, note: `New text rises and comes into focus, each line ${STAGGER_MS} ms after the last.` },
  { name: "Leave", ms: LEAVE_MS, ease: LEAVE_EASE, note: "Old text lifts away before the next one arrives." },
  { name: "Mark", ms: BAR_MS, ease: BAR_EASE, note: "The slash slides to the chosen point." },
];
