import { BRANDS } from '@/constants/brands';
import type { Brand } from '@/types';

export interface BrandGroup {
  /** Key into `t.brands.groups`. */
  id: 'popular' | 'more' | 'results';
  brands: readonly Brand[];
}

/** Popular brands first. A search query replaces the groups with one result list. */
export function groupBrands(query: string): BrandGroup[] {
  const normalized = query.trim().toLowerCase();
  if (normalized) {
    const matches = BRANDS.filter((brand) => brand.name.toLowerCase().includes(normalized));
    return matches.length > 0 ? [{ id: 'results', brands: matches }] : [];
  }

  return [
    { id: 'popular', brands: BRANDS.filter((brand) => brand.popular) },
    { id: 'more', brands: BRANDS.filter((brand) => !brand.popular) },
  ];
}
