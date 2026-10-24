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
    popular: true,
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
    popular: true,
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
    popular: true,
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
    popular: true,
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
    popular: true,
  },
  {
    id: brandId('midea'),
    name: 'Midea',
    color: '#00A0E1',
    regions: ['global'],
    supportedConnections: ['ir', 'wifi'],
    cloudProviders: ['midea-msmart'],
    defaultIr: ir('MIDEA'),
    capabilities: caps({ temperature: { min: 17, max: 30, step: 1 } }),
    models: [],
    popular: false,
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
    capabilities: caps(),
    models: [],
    popular: false,
  },
];

const brandIndex = new Map<string, Brand>(BRANDS.map((brand) => [brand.id, brand]));

export const getBrandById = (id: string): Brand | undefined => brandIndex.get(id);
