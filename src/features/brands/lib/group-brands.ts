import { BRANDS } from '@/constants/brands';
import type { Brand } from '@/types';

export interface BrandGroup {
  title: string;
  brands: readonly Brand[];
}

/** Popular brands first. A search query replaces the groups with one result list. */
export function groupBrands(query: string): BrandGroup[] {
  const normalized = query.trim().toLowerCase();
  if (normalized) {
    const matches = BRANDS.filter((brand) => brand.name.toLowerCase().includes(normalized));
    return matches.length > 0 ? [{ title: 'Results', brands: matches }] : [];
  }

  return [
    { title: 'Popular', brands: BRANDS.filter((brand) => brand.popular) },
    { title: 'More brands', brands: BRANDS.filter((brand) => !brand.popular) },
  ];
}
