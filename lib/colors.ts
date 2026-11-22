// The colours as constants, for SVG drawn in code. styles/tokens.css holds the same values as
// CSS custom properties; if you change one, change the other.
export const INK = "#000000";
export const PAPER = "#ffffff";
export const BLUE = "#1840ff";
export const GREY = "#8a8a8a"; // quiet text and axis labels
export const GREY_TEXT = "#555555"; // labels and notes
export const GREY_FAINT = "#b4b4b4";
export const GREY_LINE = "#cfcfcf"; // chart links and frames
export const GREY_GRID = "#efefef"; // chart grid lines
export const GREY_RULE = "#e4e4e4"; // diagram rules
export const GREY_AXIS = "#d8d8d8";

/** The palette shown by the colour bar: name, value, what it is for, and a share of the page (dummy numbers, replace them). */
export const PALETTE = [
  { name: "Paper", hex: PAPER, role: "the page", share: 80 },
  { name: "Ink", hex: INK, role: "text and points", share: 10 },
  { name: "Grey", hex: GREY_TEXT, role: "labels and notes", share: 8 },
  { name: "Blue", hex: BLUE, role: "links and the moving head", share: 2 },
];
