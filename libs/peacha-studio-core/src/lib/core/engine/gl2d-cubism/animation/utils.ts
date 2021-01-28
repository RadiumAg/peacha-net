export function getEasingSine(value: number): number {
  if (value < 0) {
    return 0;
  } else if (value > 1) {
    return 1;
  }
  return 0.5 - 0.5 * Math.cos(value * Math.PI);
}
