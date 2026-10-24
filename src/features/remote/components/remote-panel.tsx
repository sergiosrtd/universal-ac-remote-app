import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Section } from '@/components/ui/section';
import { createDefaultAcState } from '@/constants/ac';
import { getBrandById } from '@/constants/brands';
import { Layout, Spacing } from '@/constants/theme';
import { normalizeAcState } from '@/features/remote/lib/ac-state-reducer';
import { getTemperatureRange, isTemperatureLocked, resolveCapabilities } from '@/features/remote/lib/capabilities';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTranslation } from '@/i18n';
import { transmitAcInfrared } from '@/services/communication/ir/ir-transport';
import { usePreferencesStore, useRemoteStore } from '@/store';
import type { AcCommand, DeviceSyncStatus, SavedDevice } from '@/types';
import { withAlpha } from '@/utils/color';
import { tapFeedback } from '@/utils/haptics';
import { formatTemperature } from '@/utils/temperature';

import { ModeSelector } from './mode-selector';
import { TemperatureDial } from './temperature-dial';

const ICONS = {
  power: { sf: 'power', md: 'power_settings_new' },
  light: { sf: 'lightbulb.fill', md: 'lightbulb' },
  plus: { sf: 'plus', md: 'add' },
  minus: { sf: 'minus', md: 'remove' },
  aim: { sf: 'dot.radiowaves.forward', md: 'sensors' },
  error: { sf: 'exclamationmark.triangle.fill', md: 'error' },
} satisfies Record<string, IconName>;

/** Brand-aware controls. Every change is sent over the device's transport. */
export function RemotePanel({ device }: { device: SavedDevice }) {
  const brand = getBrandById(device.brandId);
  const capabilities = useMemo(() => resolveCapabilities(device), [device]);
  const stored = useRemoteStore((s) => s.states[device.id]);
  const status = useRemoteStore((s) => s.status[device.id] ?? 'idle');
  const transmissionError = useRemoteStore((s) => s.errors[device.id]);
  const unit = usePreferencesStore((s) => s.temperatureUnit);
  const { colors, radii, borders } = useAppTheme();
  const { t } = useTranslation();

  const state = useMemo(
    () => normalizeAcState(stored ?? createDefaultAcState(0), capabilities),
    [stored, capabilities],
  );
  const range = getTemperatureRange(capabilities, state.mode);
  const tempLocked = isTemperatureLocked(capabilities, state.mode);
  const supportsDisplayLight = device.brandId === 'carrier';

  function send(command: AcCommand) {
    tapFeedback();
    const { next, changed } = useRemoteStore.getState().dispatch(device.id, command, capabilities);
    if (!changed || device.connection.kind !== 'ir' || device.connection.emitter !== 'builtin') return;
    useRemoteStore.getState().setStatus(device.id, 'sending');
    void transmitAcInfrared(device.connection.protocol.protocol, next, command).then((result) => {
      if (result.ok) {
        useRemoteStore.getState().setStatus(device.id, 'synced');
        return;
      }
      // Older users get a plain explanation; the technical message is only a fallback.
      useRemoteStore.getState().setStatus(device.id, 'error', t.sendErrors[result.error.code] ?? result.error.message);
    });
  }

  const atMin = state.targetTemperature <= range.min;
  const atMax = state.targetTemperature >= range.max;
  const powerFg = state.power ? colors.onAccent : colors.text;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText color="textSecondary" style={styles.headerText}>
          {brand?.name ?? t.common.unknownBrand} · {t.rooms[device.room]}
        </AppText>
        <StatusPill status={status} />
      </View>

      {transmissionError ? (
        <View
          accessibilityRole="alert"
          style={[
            styles.banner,
            {
              backgroundColor: withAlpha(colors.danger, 0.12),
              borderColor: colors.danger,
              borderWidth: borders.regular,
              borderRadius: radii.lg,
            },
          ]}>
          <Icon name={ICONS.error} size={28} color={colors.danger} />
          <View style={styles.bannerText}>
            <AppText variant="label" color="danger">
              {t.remote.notSent}
            </AppText>
            <AppText color="text">{transmissionError}</AppText>
          </View>
        </View>
      ) : null}

      <PressableScale
        accessibilityRole="switch"
        accessibilityState={{ checked: state.power }}
        accessibilityLabel={t.remote.power}
        accessibilityHint={state.power ? t.remote.powerHintOn : t.remote.powerHintOff}
        onPress={() => send({ type: 'power/toggle' })}
        style={[
          styles.power,
          {
            borderRadius: radii.xl,
            borderWidth: borders.selected,
            backgroundColor: state.power ? colors.powerOn : colors.surface,
            borderColor: state.power ? colors.powerOn : colors.borderStrong,
          },
        ]}>
        <View
          style={[
            styles.powerIcon,
            { borderRadius: radii.pill, backgroundColor: state.power ? withAlpha(colors.onAccent, 0.2) : colors.surfacePressed },
          ]}>
          <Icon name={ICONS.power} size={36} color={powerFg} />
        </View>
        <View style={styles.powerCopy}>
          <AppText variant="title" style={{ color: powerFg }}>
            {state.power ? t.remote.isOn : t.remote.isOff}
          </AppText>
          <AppText variant="label" style={{ color: powerFg }}>
            {state.power ? t.remote.tapToTurnOff : t.remote.tapToTurnOn}
          </AppText>
        </View>
      </PressableScale>

      <TemperatureDial
        celsius={state.targetTemperature}
        range={range}
        unit={unit}
        mode={state.mode}
        power={state.power}
        locked={tempLocked}
      />

      <View style={styles.tempControls}>
        <View style={styles.stepRow}>
          <StepButton
            icon={ICONS.minus}
            label={t.remote.colder}
            accessibilityLabel={t.remote.lowerTemperature}
            disabled={tempLocked || atMin}
            onPress={() => send({ type: 'temperature/decrement' })}
          />
          <StepButton
            icon={ICONS.plus}
            label={t.remote.warmer}
            accessibilityLabel={t.remote.raiseTemperature}
            disabled={tempLocked || atMax}
            onPress={() => send({ type: 'temperature/increment' })}
          />
        </View>
        <AppText color="textSecondary" style={styles.center}>
          {tempLocked
            ? t.remote.fanHasNoTemperature
            : t.remote.range(formatTemperature(range.min, unit), formatTemperature(range.max, unit))}
        </AppText>
      </View>

      <Section title={t.remote.mode} description={t.remote.modeNow(t.modes[state.mode].label)}>
        <ModeSelector
          modes={capabilities.modes}
          value={state.mode}
          onChange={(mode) => send({ type: 'mode/set', value: mode })}
        />
      </Section>

      {supportsDisplayLight ? (
        <PressableScale
          accessibilityRole="switch"
          accessibilityState={{ checked: state.displayLight }}
          accessibilityLabel={t.remote.displayLightA11y}
          onPress={() => send({ type: 'display-light/toggle' })}
          style={[
            styles.light,
            {
              borderRadius: radii.lg,
              borderWidth: borders.regular,
              backgroundColor: colors.surface,
              borderColor: state.displayLight ? colors.warning : colors.border,
            },
          ]}>
          <Icon name={ICONS.light} size={32} color={state.displayLight ? colors.warning : colors.textMuted} />
          <View style={styles.lightCopy}>
            <AppText variant="label">{t.remote.displayLight(state.displayLight)}</AppText>
            <AppText color="textSecondary">{t.remote.displayLightHelp}</AppText>
          </View>
        </PressableScale>
      ) : null}

      <View style={[styles.hint, { backgroundColor: colors.surfacePressed, borderRadius: radii.lg }]}>
        <Icon name={ICONS.aim} size={28} color={colors.textSecondary} />
        <AppText color="textSecondary" style={styles.hintText}>
          {t.remote.aimHint}
        </AppText>
      </View>
    </View>
  );
}

const STATUS_TONE: Record<DeviceSyncStatus, 'textSecondary' | 'primary' | 'success' | 'danger'> = {
  idle: 'textSecondary',
  sending: 'primary',
  synced: 'success',
  error: 'danger',
};

function StatusPill({ status }: { status: DeviceSyncStatus }) {
  const { colors, radii, borders } = useAppTheme();
  const { t } = useTranslation();
  const label = t.remote.status[status];
  const tone = colors[STATUS_TONE[status]];
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={t.remote.statusA11y(label)}
      style={[styles.pill, { borderColor: tone, borderWidth: borders.regular, borderRadius: radii.pill }]}>
      <View style={[styles.pillDot, { backgroundColor: tone }]} />
      <AppText variant="label" style={{ color: tone }}>
        {label}
      </AppText>
    </View>
  );
}

function StepButton({
  icon,
  label,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  icon: IconName;
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors, radii, borders } = useAppTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.step,
        {
          borderRadius: radii.xl,
          borderWidth: borders.regular,
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.borderStrong,
          opacity: disabled ? 0.4 : 1,
        },
      ]}>
      <Icon name={icon} size={40} color={colors.text} />
      <AppText variant="heading">{label}</AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerText: { flex: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  pillDot: { width: 12, height: 12, borderRadius: 6 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.lg },
  bannerText: { flex: 1, gap: Spacing.xs },
  power: {
    minHeight: Layout.primaryButtonHeight + Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  powerIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  powerCopy: { flex: 1, gap: Spacing.xxs },
  tempControls: { gap: Spacing.md, marginTop: -Spacing.md },
  stepRow: { flexDirection: 'row', gap: Layout.touchGap },
  step: {
    flex: 1,
    minHeight: Layout.primaryButtonHeight + Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  center: { textAlign: 'center' },
  light: {
    minHeight: Layout.primaryButtonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  lightCopy: { flex: 1 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  hintText: { flex: 1 },
});
