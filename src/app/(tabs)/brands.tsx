import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { BrandPicker } from '@/features/brands/components/brand-picker';
import { useTranslation } from '@/i18n';

export default function BrandsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t.brands.title}
      </AppText>
      <AppText color="textSecondary">{t.brands.intro}</AppText>
      <BrandPicker />
    </Screen>
  );
}
