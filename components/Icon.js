// Inline stroke icons (UI-SPEC D-06 "no icon package" — this is not a package,
// it's ~20 path strings). Replaces the text glyphs in tokens.js GLYPHS for the
// dashboard chrome: those code points (⌕ ◔ ▤ ✎ ♪ ◍ ◀◀ ❚❚) fall back to a
// different font per platform, so they rendered at inconsistent sizes and
// optical weights inside otherwise-matched 32/36px tiles.
//
// One shape only: 24px viewBox, currentColor, 1.75 stroke, round caps. Sizing
// and color come from the call site (width/height + color), never from here.

const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></>,
  bell: <><path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" /><path d="M13.7 19a2 2 0 0 1-3.4 0" /></>,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  arrowRight: <><path d="M4 12h15" /><path d="M13.5 6.5L20 12l-6.5 5.5" /></>,
  // fresh-material tiles
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
  pencil: <><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" /><path d="M15 6.5l2.5 2.5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.3-2.6 3.8" /><path d="M12 17.4h.01" /></>,
  headphones: <><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><path d="M4 15h3v5H5.5A1.5 1.5 0 0 1 4 18.5z" /><path d="M20 15h-3v5h1.5a1.5 1.5 0 0 0 1.5-1.5z" /></>,
  notebook: <><path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M9 3v18" /></>,
  // Now-playing transport
  rotateBack: <><path d="M4 5v5h5" /><path d="M4.6 14a8 8 0 1 0 1.3-6" /></>,
  rewind: <><path d="M11 6L4 12l7 6z" /><path d="M20 6l-7 6 7 6z" /></>,
  pause: <><path d="M9.5 5v14" /><path d="M14.5 5v14" /></>,
  fastForward: <><path d="M13 6l7 6-7 6z" /><path d="M4 6l7 6-7 6z" /></>,
  shuffle: <><path d="M3 7h3.5l9 10H20" /><path d="M17.5 14.5L20 17l-2.5 2.5" /><path d="M3 17h3.5l2.6-2.9" /><path d="M14 9.4L15.5 7H20" /><path d="M17.5 4.5L20 7" /></>,
}

// `filled` swaps stroke for fill — used by the transport triangles so they
// read as solid at 17px the way ▶▶ did.
export default function Icon({ name, size = 18, filled = false, style }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flex: 'none', ...style }}
    >
      {d}
    </svg>
  )
}
