export function rampRdYlGnReversed(t) {
  const stops = [
    [54, 162, 235, 255], // blue
    [72, 187, 120, 255], // green
    [251, 191, 36, 255], // amber
    [245, 158, 11, 255], // orange
    [239, 68, 68, 255], // red
  ];
  return lerpStops(stops, clamp01(t));
}

function lerpStops(stops, t) {
  const i = Math.max(
    0,
    Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)))
  );
  const localT = t * (stops.length - 1) - i;
  const a = stops[i],
    b = stops[i + 1];
  const c = a.map((av, idx) => Math.round(av + (b[idx] - av) * localT));
  return `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
}

export function scaleLinear(min, max, v) {
  if (v == null || !Number.isFinite(v)) return 0;
  if (max === min) return 0.5;
  return clamp01((v - min) / (max - min));
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
