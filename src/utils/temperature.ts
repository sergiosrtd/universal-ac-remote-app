import type { Celsius, TemperatureUnit } from '@/types';

export const celsiusToFahrenheit = (c: Celsius): number => Math.round((c * 9) / 5 + 32);

export const fahrenheitToCelsius = (f: number): Celsius => ((f - 32) * 5) / 9;

export const formatTemperature = (c: Celsius, unit: TemperatureUnit): string =>
  unit === 'fahrenheit' ? `${celsiusToFahrenheit(c)}°F` : `${Number.isInteger(c) ? c : c.toFixed(1)}°C`;
