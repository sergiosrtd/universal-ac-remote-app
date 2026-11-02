import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { createDefaultAcState } from '@/constants/ac';
import { Layout, Spacing } from '@/constants/theme';
import { normalizeAcState } from '@/features/remote/lib/ac-state-reducer';
import { resolveCapabilities } from '@/features/remote/lib/capabilities';
import { getIrCodeCandidates } from '@/features/remote/lib/ir-codes';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTranslation } from '@/i18n';
import { transmitAcInfrared } from '@/services/communication/ir/ir-transport';
import { useDevicesStore, useRemoteStore } from '@/store';
import type { AcState, SavedDevice } from '@/types';
import { withAlpha } from '@/utils/color';

const ICONS = {
  send: { sf: 'dot.radiowaves.forward', md: 'sensors' },
  yes: { sf: 'checkmark', md: 'check' },
  next: { sf: 'arrow.right', md: 'arrow_forward' },
  again: { sf: 'arrow.clockwise', md: 'refresh' },
  done: { sf: 'checkmark.circle.fill', md: 'check_circle' },
  error: { sf: 'exclamationmark.triangle.fill', md: 'error' },
} satisfies Record<string, IconName>;

type Step =
  | { kind: 'intro' }
  | { kind: 'test'; index: number; phase: 'ready' | 'sending' | 'asking' }
  | { kind: 'success' }
  | { kind: 'none' };

export interface CodeFinderProps {
  device: SavedDevice;
  /** Leaves the finder, e.g. to the remote screen. */
  onDone: () => void;
}

/**
 * Tries each IR code the brand is known to use, one at a time, and asks a plain
 * yes/no question after each. The code that works is saved on the remote.
 */
export function CodeFinder({ device, onDone }: CodeFinderProps) {
  const { t } = useTranslation();
  const { colors, radii, borders } = useAppTheme();
  const candidates = useMemo(() => getIrCodeCandidates(device), [device]);
  const testState = useMemo<AcState>(
    () =>
      normalizeAcState(
        { ...createDefaultAcState(), power: true, mode: 'cool', targetTemperature: 24, fanSpeed: 'auto' },
        resolveCapabilities(device),
      ),
    [device],
  );
  const [step, setStep] = useState<Step>({ kind: 'intro' });
  const [error, setError] = useState<string | null>(null);

  if (device.connection.kind !== 'ir' || candidates.length === 0) {
    return (
      <View style={styles.root}>
        <AppText variant="title">{t.codeFinder.notSupportedTitle}</AppText>
        <AppText>{t.codeFinder.notSupportedBody}</AppText>
        <Button label={t.codeFinder.goToRemote} large onPress={onDone} />
      </View>
    );
  }

  async function send(index: number) {
    const candidate = candidates[index];
    if (!candidate) return;
    setError(null);
    setStep({ kind: 'test', index, phase: 'sending' });
    const result = await transmitAcInfrared(candidate.protocol, testState);
    if (result.ok) {
      setStep({ kind: 'test', index, phase: 'asking' });
      return;
    }
    setError(t.sendErrors[result.error.code] ?? result.error.message);
    setStep({ kind: 'test', index, phase: 'ready' });
  }

  function accept(index: number) {
    const candidate = candidates[index];
    if (!candidate || device.connection.kind !== 'ir') return;
    useDevicesStore.getState().updateDevice(device.id, { connection: { ...device.connection, protocol: candidate } });
    // The test signal turned the unit on, so the remote now shows it as on.
    useRemoteStore.getState().replaceState(device.id, { ...testState, updatedAt: Date.now() });
    useRemoteStore.getState().setStatus(device.id, 'synced');
    setStep({ kind: 'success' });
  }

  function reject(index: number) {
    setError(null);
    setStep(index + 1 < candidates.length ? { kind: 'test', index: index + 1, phase: 'ready' } : { kind: 'none' });
  }

  if (step.kind === 'intro') {
    return (
      <View style={styles.root}>
        <AppText variant="title">{t.codeFinder.introTitle}</AppText>
        <AppText>{t.codeFinder.introBody}</AppText>
        <View style={styles.steps}>
          <NumberedStep number={1} text={t.codeFinder.stepOff} />
          <NumberedStep number={2} text={t.codeFinder.stepAim} />
        </View>
        <Button label={t.codeFinder.start} large onPress={() => setStep({ kind: 'test', index: 0, phase: 'ready' })} />
      </View>
    );
  }

  if (step.kind === 'success') {
    return (
      <View style={styles.root}>
        <View style={styles.center}>
          <Icon name={ICONS.done} size={72} color={colors.success} />
          <AppText variant="title" style={styles.centerText}>
            {t.codeFinder.successTitle}
          </AppText>
          <AppText style={styles.centerText}>{t.codeFinder.successBody(device.name)}</AppText>
        </View>
        <Button label={t.codeFinder.goToRemote} large onPress={onDone} />
      </View>
    );
  }

  if (step.kind === 'none') {
    return (
      <View style={styles.root}>
        <AppText variant="title">{t.codeFinder.noneTitle}</AppText>
        <AppText>{t.codeFinder.noneBody}</AppText>
        <View style={styles.actions}>
          <Button
            label={t.codeFinder.tryAgain}
            icon={ICONS.again}
            large
            onPress={() => setStep({ kind: 'test', index: 0, phase: 'ready' })}
          />
          <Button label={t.codeFinder.goToRemote} variant="secondary" large onPress={onDone} />
        </View>
      </View>
    );
  }

  const { index, phase } = step;
  return (
    <View style={styles.root}>
      <AppText variant="heading" color="textSecondary" accessibilityLiveRegion="polite">
        {t.codeFinder.progress(index + 1, candidates.length)}
      </AppText>

      {phase === 'asking' ? (
        <>
          <AppText variant="title">{t.codeFinder.question}</AppText>
          <View style={styles.actions}>
            <Button label={t.codeFinder.yes} icon={ICONS.yes} large onPress={() => accept(index)} />
            <Button label={t.codeFinder.no} icon={ICONS.next} variant="secondary" large onPress={() => reject(index)} />
            <Button label={t.codeFinder.sendAgain} icon={ICONS.again} variant="secondary" onPress={() => void send(index)} />
          </View>
        </>
      ) : (
        <>
          <AppText>{t.codeFinder.sendPrompt}</AppText>
          {error ? (
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
                <AppText>{error}</AppText>
              </View>
            </View>
          ) : null}
          <Button
            label={phase === 'sending' ? t.remote.status.sending : t.codeFinder.send}
            icon={ICONS.send}
            large
            disabled={phase === 'sending'}
            onPress={() => void send(index)}
          />
        </>
      )}
    </View>
  );
}

function NumberedStep({ number, text }: { number: number; text: string }) {
  const { colors, radii } = useAppTheme();
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, { backgroundColor: colors.primary, borderRadius: radii.pill }]}>
        <AppText variant="label" color="onPrimary">
          {number}
        </AppText>
      </View>
      <AppText style={styles.stepText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl, paddingTop: Spacing.md },
  steps: { gap: Spacing.lg },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  stepNumber: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1, paddingTop: Spacing.xs },
  actions: { gap: Layout.touchGap },
  center: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  centerText: { textAlign: 'center' },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.lg },
  bannerText: { flex: 1, gap: Spacing.xs },
});
