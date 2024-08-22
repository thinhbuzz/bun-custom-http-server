export function isNumberAndGreaterOrEqualZero(value: unknown): value is number {
  return typeof value === 'number' && value >= 0;
}

export function isNumberAndGreaterZero(value: unknown): value is number {
  return typeof value === 'number' && value > 0;
}
