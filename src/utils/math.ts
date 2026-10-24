export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Snap to the nearest multiple of `step`, avoiding float drift like 23.999999. */
export const roundToStep = (value: number, step: number): number => {
  if (step <= 0) return value;
  const decimals = (step.toString().split('.')[1] ?? '').length;
  return Number((Math.round(value / step) * step).toFixed(decimals));
};
