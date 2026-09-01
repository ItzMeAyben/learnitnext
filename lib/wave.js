// Deterministic waveform bars — ported as-is from the design mockup's reference logic.
export function wave(n, playedFrac, playedColor, restColor) {
  const out = []
  for (let i = 0; i < n; i++) {
    const t = i / n
    const h = Math.round(22 + 68 * Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.41) * 0.4))
    out.push({ h: Math.min(100, h), c: t < playedFrac ? playedColor : restColor })
  }
  return out
}
