import type {
  AcMode,
  FanSpeed,
  HorizontalSwing,
  TemperatureRange,
  VerticalSwing,
} from './ac';
import type { ConnectionKind } from './connection';

export type BrandId = string & { readonly __brand: 'BrandId' };

export type BrandRegion = 'global' | 'asia' | 'europe' | 'north-america' | 'latin-america';

/**
 * Cloud ecosystems a brand's Wi-Fi units can be reached through. Each maps to a
 * provider adapter under `src/services/communication/wifi/providers/`.
 */
export type CloudProvider =
  | 'smartthings'
  | 'lg-thinq'
  | 'tuya'
  | 'daikin-onecta'
  | 'panasonic-comfort-cloud'
  | 'melcloud'
  | 'fglair'
  | 'gree-plus'
  | 'midea-msmart'
  | 'haier-hon';

/**
 * Identifies the IR encoding used by a brand/model family. Names mirror the
 * protocol identifiers used by IRremoteESP8266 so a hardware/encoder module can
 * map them 1:1.
 */
export interface IrProtocolDescriptor {
  protocol: string;
  /** Carrier frequency in Hz (most AC remotes use 38 kHz). */
  carrierFrequencyHz: number;
}

/**
 * What a brand (or a specific model profile) can do. The remote UI renders only the
 * controls advertised here, and the state reducer clamps values against it.
 */
export interface AcCapabilities {
  modes: readonly AcMode[];
  fanSpeeds: readonly FanSpeed[];
  verticalSwing: readonly VerticalSwing[];
  horizontalSwing: readonly HorizontalSwing[];
  temperature: TemperatureRange;
  /** Per-mode overrides, e.g. heat allowing a lower minimum. */
  temperatureByMode?: Partial<Record<AcMode, TemperatureRange>>;
  /** Modes in which the target temperature is ignored by the unit (typically `fan`). */
  temperatureLockedModes?: readonly AcMode[];
}

export interface AcModelProfile {
  id: string;
  name: string;
  /** Optional overrides on top of the brand default capabilities. */
  capabilities?: Partial<AcCapabilities>;
  ir?: IrProtocolDescriptor;
}

export interface Brand {
  id: BrandId;
  name: string;
  /** Brand accent color used for the monogram avatar until licensed logos are bundled. */
  color: string;
  regions: readonly BrandRegion[];
  supportedConnections: readonly ConnectionKind[];
  cloudProviders: readonly CloudProvider[];
  defaultIr: IrProtocolDescriptor;
  /**
   * Every IR code family the brand's units are known to use, most common first.
   * The code finder tries them one by one. Defaults to `[defaultIr]`.
   */
  irCodes?: readonly IrProtocolDescriptor[];
  capabilities: AcCapabilities;
  models: readonly AcModelProfile[];
  /** Surfaced first in the brand selector. */
  popular: boolean;
}

export interface BrandFilter {
  query: string;
  region: BrandRegion | 'all';
  connection: ConnectionKind | 'all';
}
