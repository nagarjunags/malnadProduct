"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }
      console.log("aaaaaaaaaaa::" + regionId);
        
  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(//ngrj cr 
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => {
        console.log("hereeese"); 
        return a.id > b.id ? 1 : -1

       

      })
    )
    .catch(() => {
      console.log("error")
      return null
    })
}
