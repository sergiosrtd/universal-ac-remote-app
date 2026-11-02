import { getBrandById } from '@/constants/brands';
import { isIrProtocolSupported } from '@/services/communication/ir/ir-transport';
import type { IrProtocolDescriptor, SavedDevice } from '@/types';

/**
 * IR codes the code finder can try for a remote, most likely first: the chosen
 * model's code, then the brand's known codes. Codes this app cannot send yet are left out.
 */
export function getIrCodeCandidates(device: Pick<SavedDevice, 'brandId' | 'modelId'>): IrProtocolDescriptor[] {
  const brand = getBrandById(device.brandId);
  if (!brand) return [];
  const model = device.modelId ? brand.models.find((m) => m.id === device.modelId) : undefined;
  const codes = [...(model?.ir ? [model.ir] : []), ...(brand.irCodes ?? [brand.defaultIr])];
  const seen = new Set<string>();
  return codes.filter((code) => {
    if (seen.has(code.protocol) || !isIrProtocolSupported(code.protocol)) return false;
    seen.add(code.protocol);
    return true;
  });
}
