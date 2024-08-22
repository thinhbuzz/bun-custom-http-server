import { define } from 'superstruct';

export const Numeric = (min: number, max?: number) => define(
  'numeric',
  value => {
    const parsedValue = typeof value === 'string' ? parseFloat(value) : value as number;
    return !isNaN(parsedValue) && parsedValue >= min && (max === undefined || parsedValue <= max);
  },
);
