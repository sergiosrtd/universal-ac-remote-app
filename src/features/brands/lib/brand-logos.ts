/**
 * Brand logos from Simple Icons (CC0), rendered as PNGs in each brand's official
 * color. The trademarks belong to their owners; they are shown only to help people
 * recognize their air conditioner. Brands without an entry show their initial.
 */
/** Metro turns each `require` of an image into a numeric asset id. */
const BRAND_LOGOS: Partial<Record<string, number>> = {
  samsung: require('@/assets/images/brands/samsung.png'),
  lg: require('@/assets/images/brands/lg.png'),
  panasonic: require('@/assets/images/brands/panasonic.png'),
  'mitsubishi-electric': require('@/assets/images/brands/mitsubishi.png'),
  fujitsu: require('@/assets/images/brands/fujitsu.png'),
  toshiba: require('@/assets/images/brands/toshiba.png'),
  hitachi: require('@/assets/images/brands/hitachi.png'),
};

export const getBrandLogo = (brandId: string): number | undefined => BRAND_LOGOS[brandId];
