/**
 * AsyncStorage keys. Bump a store's version (not its key) when its shape changes,
 * and handle the upgrade in that store's `migrate`.
 */
export const StorageKeys = {
  devices: 'uac/devices',
  remoteStates: 'uac/remote-states',
  preferences: 'uac/preferences',
} as const;

/** SecureStore key prefix for cloud provider tokens referenced by `WifiConnectionConfig.credentialRef`. */
export const SECURE_CREDENTIAL_PREFIX = 'uac.credential.';
