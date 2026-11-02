/**
 * Static brand catalog bundled with the app.
 *
 * Capabilities are conservative defaults per brand family; model profiles override
 * them where a line differs. IR protocol names follow IRremoteESP8266 so the native
 * encoder can resolve them directly. A remote catalog service can later replace or
 * extend this list without changing consumers (planned: `src/services/catalog/`).
 */

import type { AcCapabilities, Brand, BrandId, IrProtocolDescriptor } from '@/types';

import { DEFAULT_CAPABILITIES } from './ac';

const IR_38K = 38_000;

const ir = (protocol: string, carrierFrequencyHz: number = IR_38K): IrProtocolDescriptor => ({
  protocol,
  carrierFrequencyHz,
});

const caps = (overrides: Partial<AcCapabilities> = {}): AcCapabilities => ({
  ...DEFAULT_CAPABILITIES,
  ...overrides,
});

const brandId = (id: string) => id as BrandId;

/** Code families tried, in order, for brands whose factory is unknown. */
const UNKNOWN_FACTORY_CODES = ['MIDEA_COOLIX', 'GREE', 'TCL112AC', 'ELECTRA_AC'];

/** An infrared-only brand sold in Latin America, with the code families to try. */
const genericBrand = (id: string, name: string, color: string, codes: readonly string[] = UNKNOWN_FACTORY_CODES): Brand => ({
  id: brandId(id),
  name,
  color,
  regions: ['latin-america'],
  supportedConnections: ['ir'],
  cloudProviders: [],
  defaultIr: ir(codes[0]!),
  irCodes: codes.map((code) => ir(code)),
  capabilities: caps(),
  models: [],
  popular: true,
});

export const BRANDS: readonly Brand[] = [
  {
    id: brandId('samsung'),
    name: 'Samsung',
    color: '#1428A0',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['smartthings'],
    defaultIr: ir('SAMSUNG_AC'),
    capabilities: caps({
      verticalSwing: ['off', 'auto'],
      horizontalSwing: ['off', 'auto'],
    }),
    models: [{ id: 'windfree', name: 'WindFree series' }],
    popular: true,
  },
  {
    id: brandId('lg'),
    name: 'LG',
    color: '#A50034',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['lg-thinq'],
    defaultIr: ir('LG2'),
    // Current LG remotes use LG2; older ones (and GE-built units) the original LG timing.
    irCodes: [ir('LG2'), ir('LG')],
    capabilities: caps({
      temperature: { min: 18, max: 30, step: 1 },
      verticalSwing: ['off', 'auto', 'top', 'upper', 'middle', 'lower', 'bottom'],
      horizontalSwing: ['off', 'auto'],
    }),
    models: [
      { id: 'dualcool', name: 'DualCool' },
      { id: 'legacy', name: 'Legacy (LG protocol)', ir: ir('LG') },
    ],
    popular: true,
  },
  {
    id: brandId('daikin'),
    name: 'Daikin',
    color: '#0097E0',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['daikin-onecta'],
    defaultIr: ir('DAIKIN'),
    capabilities: caps({
      temperature: { min: 18, max: 32, step: 0.5 },
      temperatureByMode: { heat: { min: 10, max: 30, step: 0.5 } },
      verticalSwing: ['off', 'auto', 'top', 'upper', 'middle', 'lower', 'bottom'],
      horizontalSwing: ['off', 'auto', 'left', 'center', 'right', 'wide'],
    }),
    models: [
      { id: 'arc433', name: 'ARC433 remote', ir: ir('DAIKIN') },
      { id: 'arc466', name: 'ARC466 remote', ir: ir('DAIKIN2') },
    ],
    popular: false,
  },
  {
    id: brandId('panasonic'),
    name: 'Panasonic',
    color: '#0041C0',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['panasonic-comfort-cloud'],
    defaultIr: ir('PANASONIC_AC', 36_700),
    capabilities: caps({
      verticalSwing: ['off', 'auto', 'top', 'upper', 'middle', 'lower', 'bottom'],
      horizontalSwing: ['off', 'auto', 'left', 'center', 'right'],
    }),
    models: [],
    popular: false,
  },
  {
    id: brandId('mitsubishi-electric'),
    name: 'Mitsubishi Electric',
    color: '#E60012',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['melcloud'],
    defaultIr: ir('MITSUBISHI_AC'),
    capabilities: caps({
      temperature: { min: 16, max: 31, step: 0.5 },
      verticalSwing: ['off', 'auto', 'top', 'upper', 'middle', 'lower', 'bottom'],
      horizontalSwing: ['off', 'auto', 'left', 'center', 'right', 'wide'],
    }),
    models: [],
    popular: false,
  },
  {
    id: brandId('fujitsu'),
    name: 'Fujitsu',
    color: '#E4002B',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['fglair'],
    defaultIr: ir('FUJITSU_AC'),
    capabilities: caps({
      temperatureByMode: { heat: { min: 10, max: 30, step: 1 } },
      horizontalSwing: ['off', 'auto'],
    }),
    models: [],
    popular: false,
  },
  {
    id: brandId('carrier'),
    name: 'Carrier',
    color: '#0033A0',
    regions: ['north-america', 'latin-america', 'asia'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['midea-msmart'],
    // Surrey and most Latin American Carrier splits use the 64-bit frame.
    // Saved remotes that still say CARRIER_AC are encoded the same way.
    defaultIr: ir('CARRIER_AC64'),
    // CARRIER_AC64 sends the Coolix, Midea and Carrier 64-bit frames together, which
    // covers Midea- and Surrey-built units. Toshiba-Carrier (e.g. 42NQV/38NYV) and
    // Gree-built Carrier units each need their own code.
    irCodes: [ir('CARRIER_AC64'), ir('TOSHIBA_AC'), ir('GREE'), ir('TCL112AC')],
    capabilities: caps({ temperature: { min: 17, max: 30, step: 1 } }),
    models: [],
    popular: true,
  },
  {
    id: brandId('gree'),
    name: 'Gree',
    color: '#00A0E9',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['gree-plus', 'tuya'],
    defaultIr: ir('GREE'),
    capabilities: caps({
      verticalSwing: ['off', 'auto', 'top', 'upper', 'middle', 'lower', 'bottom'],
      horizontalSwing: ['off', 'auto', 'left', 'center', 'right', 'wide'],
    }),
    models: [],
    popular: false,
  },
  {
    id: brandId('midea'),
    name: 'Midea',
    color: '#00A0E1',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['midea-msmart'],
    defaultIr: ir('MIDEA'),
    // Midea-built units answer either the 48-bit Midea or the 24-bit Coolix code.
    irCodes: [ir('MIDEA'), ir('COOLIX')],
    capabilities: caps({ temperature: { min: 17, max: 30, step: 1 } }),
    models: [],
    popular: true,
  },
  {
    id: brandId('haier'),
    name: 'Haier',
    color: '#005BAC',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['haier-hon', 'tuya'],
    defaultIr: ir('HAIER_AC_YRW02'),
    capabilities: caps(),
    models: [{ id: 'yr-w02', name: 'YR-W02 remote' }],
    popular: false,
  },
  {
    id: brandId('toshiba'),
    name: 'Toshiba',
    color: '#E60012',
    regions: ['global'],
    supportedConnections: ['ir'],
    cloudProviders: [],
    defaultIr: ir('TOSHIBA_AC'),
    capabilities: caps({ temperature: { min: 17, max: 30, step: 1 } }),
    models: [],
    popular: false,
  },
  {
    id: brandId('hitachi'),
    name: 'Hitachi',
    color: '#E60027',
    regions: ['asia', 'europe', 'latin-america'],
    supportedConnections: ['ir'],
    cloudProviders: [],
    defaultIr: ir('HITACHI_AC'),
    capabilities: caps(),
    models: [],
    popular: false,
  },
  {
    id: brandId('hisense'),
    name: 'Hisense',
    color: '#00A99D',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['tuya'],
    defaultIr: ir('KELON'),
    capabilities: caps({ temperature: { min: 18, max: 32, step: 1 } }),
    models: [],
    popular: false,
  },
  {
    id: brandId('electrolux'),
    name: 'Electrolux',
    color: '#041E50',
    regions: ['europe', 'latin-america'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['tuya'],
    defaultIr: ir('ELECTRA_AC'),
    // Electrolux sources units from AUX (Electra code), TCL and Midea.
    irCodes: [ir('ELECTRA_AC'), ir('TCL112AC'), ir('MIDEA_COOLIX')],
    capabilities: caps(),
    models: [],
    popular: true,
  },
  // Brands common in Mexico and Latin America. They are built by other factories
  // (often Midea, Gree, TCL or AUX), so the code finder tries each family in turn.
  genericBrand('tcl', 'TCL', '#E4002B', ['TCL112AC', 'MIDEA_COOLIX']),
  genericBrand('tokyo', 'Tokyo', '#C8102E'),
  genericBrand('goodweather', 'Goodweather', '#0077C8'),
  genericBrand('fama', 'Fama', '#00843D'),
  genericBrand('jam', 'JAM', '#5B2C83'),
  genericBrand('altech', 'Altech', '#1D4F91'),
  genericBrand('electrostar', 'Electrostar', '#F2A900'),
  genericBrand('prae', 'PRAE', '#2E8B57'),
];

const brandIndex = new Map<string, Brand>(BRANDS.map((brand) => [brand.id, brand]));

export const getBrandById = (id: string): Brand | undefined => brandIndex.get(id);
