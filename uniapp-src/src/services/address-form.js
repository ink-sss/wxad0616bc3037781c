import { createAddress, updateAddress } from "@/api/address";

export function saveAddressForm(payload, id = 0) {
  if (id) {
    return updateAddress({ id, ...payload });
  }
  return createAddress(payload);
}
