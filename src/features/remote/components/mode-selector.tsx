import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { MODE_META } from '@/constants/ac';
import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTranslation } from '@/i18n';
import type { AcMode } from '@/types';

const CHECK: IconName = { sf: 'checkmark.circle.fill', md: 'check_circle' };

export interface ModeSelectorProps {
  modes: readonly AcMode[];
  value: AcMode;
  onChange: (mode: AcMode) => void;
}

/** Large labelled mode tiles, two per row (an odd last tile takes the full row). The selected one gets a fill, a thick outline and a check. */
export function ModeSelector({ modes, value, onChange }: ModeSelectorProps) {
  const { colors, radii, borders } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {modes.map((mode) => {
        const selected = mode === value;
        const accent = colors.mode[mode];
        return (
          <PressableScale
            key={mode}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t.remote.modeA11y(t.modes[mode].label)}
            accessibilityHint={t.modes[mode].description}
            onPress={() => onChange(mode)}
            style={[
              styles.tile,
              {
                borderRadius: radii.lg,
                borderWidth: selected ? borders.selected : borders.regular,
                backgroundColor: selected ? accent : colors.surface,
                borderColor: selected ? colors.borderStrong : colors.border,
              },
            ]}>
            <Icon name={MODE_META[mode].icon} size={32} color={selected ? colors.onAccent : accent} />
            <View style={styles.copy}>
              <AppText variant="label" style={{ color: selected ? colors.onAccent : colors.text }}>
                {t.modes[mode].label}
              </AppText>
              <AppText variant="caption" style={{ color: selected ? colors.onAccent : colors.textSecondary }}>
                {t.modes[mode].description}
              </AppText>
            </View>
            {selected ? (
              <View style={styles.check}>
                <Icon name={CHECK} size={22} color={colors.onAccent} />
              </View>
            ) : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Layout.touchGap },
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    minHeight: Layout.primaryButtonHeight + Spacing.lg,
    // Icon above the words, so long labels such as "Ventilador" get the whole tile width.
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  copy: { gap: Spacing.xxs },
  // Pinned to the corner so it never squeezes the label.
  check: { position: 'absolute', top: Spacing.xs, right: Spacing.xs },
});
