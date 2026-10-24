import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { BrandPicker } from '@/features/brands/components/brand-picker';

export default function BrandsScreen() {
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        Add a remote
      </AppText>
      <AppText color="textSecondary">Find the brand name printed on your air conditioner, then tap it.</AppText>
      <BrandPicker />
    </Screen>
  );
}
