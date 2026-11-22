// A plain grey picture made in code, so the Shots helper has something to show before you add your own images.
export function placeholder(w = 600, h = 400): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#f4f4f4"/><path d="M0 0L${w} ${h}M${w} 0L0 ${h}" stroke="#d8d8d8" stroke-width="2"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
