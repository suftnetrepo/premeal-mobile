import { apiClient } from "./client";
import type { Address } from "./types";

export async function getAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<{ addresses: Address[] }>("/addresses");
  return data.addresses;
}

export async function createAddress(input: { address: string; label?: string; isDefault?: boolean }): Promise<Address> {
  const { data } = await apiClient.post<{ address: Address }>("/addresses", input);
  return data.address;
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const { data } = await apiClient.patch<{ address: Address }>(`/addresses/${id}`, { isDefault: true });
  return data.address;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/addresses/${id}`);
}
