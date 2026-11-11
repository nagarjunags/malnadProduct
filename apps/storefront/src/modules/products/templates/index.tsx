import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8">
      {/* 2-Column Product Detail Layout */}
      <div
        className="content-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14"
        data-testid="product-container"
      >
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <ImageGallery images={images} />
          </div>
        </div>

        {/* Right Column: Buy Box, Options, Price, Tabs */}
        <div className="lg:col-span-5 flex flex-col gap-y-6">
          <ProductInfo product={product} />

          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          <div className="pt-2 border-t border-mphal-sand/60">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      {/* Related Products Rail */}
      <div
        className="content-container my-16 small:my-24"
        data-testid="related-products-container"
      >
        <div className="border-t border-mphal-sand/60 pt-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-mphal-forest mb-8">
            Related Products
          </h2>
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProductTemplate
