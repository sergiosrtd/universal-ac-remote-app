import type { AcCommand, AcState } from './ac';
import type { AcCapabilities } from './brand';
import type { ConnectionConfig, ConnectionKind } from './connection';
import type { Result } from './errors';

export type TransportStatus = 'unavailable' | 'disconnected' | 'connecting' | 'ready' | 'error';

export interface TransportAvailability {
  available: boolean;
  /** Human-readable reason when unavailable, e.g. "This phone has no IR emitter". */
  reason?: string;
}

export interface SendRequest<C extends ConnectionConfig = ConnectionConfig> {
  connection: C;
  capabilities: AcCapabilities;
  /** The full desired state after applying `command`. */
  state: AcState;
  /** The intent that produced `state`; delta-based protocols can use it directly. */
  command: AcCommand;
}

export interface SendReceipt {
  /** State acknowledged by the device. IR is fire-and-forget, so it echoes the request. */
  confirmedState: AcState;
  /** Whether the device actually acknowledged (cloud/BLE) or delivery is assumed (IR). */
  acknowledged: boolean;
  latencyMs: number;
}

/**
 * Contract every communication channel implements. The app talks only to this
 * interface; IR, Wi-Fi and Bluetooth implementations are swappable.
 */
export interface AcTransport<C extends ConnectionConfig = ConnectionConfig> {
  readonly kind: ConnectionKind;
  readonly displayName: string;
  checkAvailability(): Promise<TransportAvailability>;
  connect(connection: C): Promise<Result<void>>;
  disconnect(): Promise<void>;
  send(request: SendRequest<C>): Promise<Result<SendReceipt>>;
  /** Pull current state from devices that report it (cloud/BLE). IR returns `null`. */
  readState?(connection: C): Promise<Result<AcState | null>>;
}
