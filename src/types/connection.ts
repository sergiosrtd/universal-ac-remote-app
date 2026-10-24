import type { CloudProvider, IrProtocolDescriptor } from './brand';

export type ConnectionKind = 'ir' | 'wifi' | 'bluetooth';

/**
 * How a saved device is physically reached. Discriminated on `kind` so every
 * transport receives exactly the configuration it needs.
 */
export type ConnectionConfig = IrConnectionConfig | WifiConnectionConfig | BluetoothConnectionConfig;

export interface IrConnectionConfig {
  kind: 'ir';
  protocol: IrProtocolDescriptor;
  /**
   * `builtin` = phone IR emitter (Android ConsumerIrManager only; iPhones have none).
   * `external` = a Wi-Fi/BLE IR bridge such as a Broadlink or Tuya IR hub.
   */
  emitter: 'builtin' | 'external';
  /** Identifier of the external bridge, when `emitter` is `external`. */
  bridgeId?: string;
}

export interface WifiConnectionConfig {
  kind: 'wifi';
  provider: CloudProvider;
  /** Device id in the provider's cloud. */
  remoteDeviceId: string;
  /**
   * Reference to credentials held in SecureStore. Tokens are never stored in the
   * device record itself.
   */
  credentialRef: string;
  /** Optional LAN address for providers that support local control. */
  localAddress?: string;
}

export interface BluetoothConnectionConfig {
  kind: 'bluetooth';
  peripheralId: string;
  serviceUuid: string;
  characteristicUuid: string;
}
