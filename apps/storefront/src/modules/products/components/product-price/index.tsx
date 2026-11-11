import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-mphal-sand/30 rounded animate-pulse" />
  }

  return (
    <div className="flex flex-col py-1">
      <div className="flex items-baseline gap-3">
        <span className="font-sans text-2xl font-bold text-mphal-forest">
          {!variant && <span className="text-sm font-normal text-mphal-mocha">From </span>}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>

        {selectedPrice.price_type === "sale" && (
          <span
            className="line-through text-sm font-sans text-mphal-mocha/60"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        )}

        {selectedPrice.price_type === "sale" && (
          <span className="bg-mphal-terracotta/15 text-mphal-terracotta text-xs font-sans font-bold px-2 py-0.5 rounded-sm">
            Save {selectedPrice.percentage_diff}%
          </span>
        )}
      </div>
    </div>
  )
}
