# site-template

A small personal-site starter: a WebGL attractor that the camera flies around, text blocks that sit beside it (never on it), and full-screen panels with a slide deck inside. All content is placeholder.

```
npm install
npm run dev     # http://localhost:3000, and /kit for the component gallery
```

- `app/` pages: `page.tsx` is the scene, `kit/page.tsx` shows every component
- `components/` Scene, SeeMore, Deck (+ Flow, Shots, Cols, CountUp, Stack), Arch, icons, AttractorStills, charts
- `content/` the placeholder words and the two example projects; replace these
- `styles/` the style package, imported in order by `app/globals.css`
- `lib/` motion numbers, colour constants, a placeholder picture

Change the look in `styles/tokens.css` (colours, type scale, spacing, easing, durations).
Keep `lib/motion.ts` and `lib/colors.ts` in step with it; they hold the same values as numbers.

The scene listens for three window events: `bench` (a panel opened or closed), `bench-layout` (its layout changed) and `bench-step` (the deck moved to another slide). SeeMore and Deck send them. Motion is in `styles/motion.css`; with reduced motion on, everything appears at once.
