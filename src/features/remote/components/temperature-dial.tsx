import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { MODE_META } from '@/constants/ac';
import { Motion, Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTranslation, type Translations } from '@/i18n';
import type { AcMode, Celsius, TemperatureRange, TemperatureUnit } from '@/types';
import { withAlpha } from '@/utils/color';
import { clamp } from '@/utils/math';
import { celsiusToFahrenheit } from '@/utils/temperature';

const SIZE = 280;
const TICK_COUNT = 41;
/** Degrees covered by the tick arc; the gap sits at the bottom like a thermostat. */
const SWEEP = 270;
const TICK_WIDTH = 4;
const TICK_HEIGHT = 14;
const MAJOR_TICK_HEIGHT = 22;
const TICK_RADIUS = SIZE / 2 - MAJOR_TICK_HEIGHT / 2 - 2;
const DISC_SIZE = SIZE - 72;

export interface TemperatureDialProps {
  celsius: Celsius;
  range: TemperatureRange;
  unit: TemperatureUnit;
  mode: AcMode;
  power: boolean;
  locked: boolean;
}

export function TemperatureDial({ celsius, range, unit, mode, power, locked }: TemperatureDialProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const accent = power ? colors.mode[mode] : colors.textMuted;
  const span = range.max - range.min;
  const fraction = span > 0 ? clamp((celsius - range.min) / span, 0, 1) : 0;
  const activeTicks = locked ? 0 : Math.round(fraction * (TICK_COUNT - 1)) + 1;
  const displayValue = unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : celsius;

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.set(withSequence(withTiming(1.08, { duration: Motion.fast }), withSpring(1, Motion.spring)));
  }, [celsius, pulse]);

  const valueStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));
  const contentStyle = useAnimatedStyle(() => ({
    // Dimmed but still readable when off; low-vision users must still see the number.
    opacity: withTiming(power ? 1 : 0.7, { duration: Motion.normal }),
  }));

  return (
    <View style={styles.root} accessible accessibilityLabel={dialLabel(t, displayValue, unit, mode, power, locked)}>
      <View
        style={[
          styles.glow,
          { backgroundColor: withAlpha(accent, power ? 0.12 : 0), borderColor: withAlpha(accent, power ? 0.18 : 0) },
        ]}
      />

      {Array.from({ length: TICK_COUNT }, (_, index) => {
        const angle = -SWEEP / 2 + (index * SWEEP) / (TICK_COUNT - 1);
        const major = index % 10 === 0;
        const height = major ? MAJOR_TICK_HEIGHT : TICK_HEIGHT;
        const active = index < activeTicks;
        return (
          <View
            key={index}
            style={[
              styles.tick,
              {
                height,
                top: SIZE / 2 - height / 2,
                backgroundColor: active ? accent : colors.border,
                opacity: 1,
                transform: [{ rotate: `${angle}deg` }, { translateY: -TICK_RADIUS }],
              },
            ]}
          />
        );
      })}

      <Animated.View
        style={[
          styles.disc,
          { backgroundColor: colors.surface, borderColor: power ? accent : colors.border },
          contentStyle,
        ]}>
        <View style={styles.modeRow}>
          <Icon name={MODE_META[mode].icon} size={24} color={accent} />
          <AppText variant="label" style={{ color: accent }}>
            {t.modes[mode].label}
          </AppText>
        </View>

        {locked ? (
          <Icon name={MODE_META[mode].icon} size={64} color={accent} />
        ) : (
          <Animated.View style={[styles.valueRow, valueStyle]}>
            {/* Already huge; letting system text size grow it would overflow the disc. */}
            <AppText maxFontSizeMultiplier={1} style={styles.value}>{Number.isInteger(displayValue) ? displayValue : displayValue.toFixed(1)}</AppText>
            <AppText variant="heading" color="textSecondary" maxFontSizeMultiplier={1} style={styles.unit}>
              °{unit === 'fahrenheit' ? 'F' : 'C'}
            </AppText>
          </Animated.View>
        )}

        <AppText variant="caption" color="textSecondary">
          {!power ? t.dial.off : locked ? t.dial.fanOnly : t.dial.setTo}
        </AppText>
      </Animated.View>
    </View>
  );
}

function dialLabel(
  t: Translations,
  value: number,
  unit: TemperatureUnit,
  mode: AcMode,
  power: boolean,
  locked: boolean,
): string {
  if (!power) return t.dial.a11yOff;
  const modeLabel = t.modes[mode].label;
  return locked ? t.remote.modeA11y(modeLabel) : t.dial.a11yTarget(modeLabel, value, t.dial[unit]);
}

const styles = StyleSheet.create({
  root: { width: SIZE, height: SIZE, alignSelf: 'center' },
  glow: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: SIZE - 36,
    height: SIZE - 36,
    borderRadius: SIZE,
    borderWidth: 1,
  },
  tick: {
    position: 'absolute',
    left: SIZE / 2 - TICK_WIDTH / 2,
    width: TICK_WIDTH,
    borderRadius: TICK_WIDTH,
  },
  disc: {
    position: 'absolute',
    top: (SIZE - DISC_SIZE) / 2,
    left: (SIZE - DISC_SIZE) / 2,
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  valueRow: { flexDirection: 'row', alignItems: 'flex-start' },
  // Medium weight: hairline digits vanish for older eyes.
  value: { ...Typography.display, fontVariant: ['tabular-nums'] },
  unit: { marginTop: Spacing.md },
});
