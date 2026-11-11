import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const categoryOrCollection =
    product.collection?.title || product.categories?.[0]?.name

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <div
        className="bg-white border border-mphal-sand/70 rounded-large p-3 sm:p-4 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg hover:border-mphal-terracotta/50"
        data-testid="product-wrapper"
      >
        <div>
          {/* Top image container */}
          <div className="relative">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
            {categoryOrCollection && (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-block bg-[#FAF7F2]/95 backdrop-blur-xs border border-mphal-sand text-mphal-forest text-[10px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm shadow-xs">
                  {categoryOrCollection}
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-3.5 flex flex-col gap-1">
            {/* Title */}
            <Text
              className="font-display font-bold text-base text-mphal-forest group-hover:text-mphal-terracotta transition-colors line-clamp-1"
              data-testid="product-title"
            >
              {product.title}
            </Text>

            {/* Description from backend */}
            {product.description && (
              <p className="text-xs text-mphal-mocha/80 font-sans line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-4 pt-3 border-t border-mphal-sand/40 flex items-center justify-between">
          <div>
            {cheapestPrice ? (
              <PreviewPrice price={cheapestPrice} />
            ) : (
              <span className="text-xs font-sans text-mphal-mocha">
                Price in cart
              </span>
            )}
          </div>
          <span className="text-xs font-sans font-semibold text-mphal-forest group-hover:text-mphal-terracotta transition-colors flex items-center gap-1">
            View &rarr;
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
