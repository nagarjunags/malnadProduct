import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* Collection Header Banner */}
      <div className="border-b border-mphal-sand/70 bg-gradient-to-r from-[#F5EFE6] via-[#FAF7F2] to-[#F5EFE6] py-10 sm:py-14">
        <div className="content-container">
          <div className="flex items-center gap-2 text-xs font-sans text-mphal-mocha/70 mb-3">
            <LocalizedClientLink href="/" className="hover:text-mphal-forest transition-colors">
              Home
            </LocalizedClientLink>
            <span>&bull;</span>
            <LocalizedClientLink href="/store" className="hover:text-mphal-forest transition-colors">
              Store
            </LocalizedClientLink>
            <span>&bull;</span>
            <span className="font-semibold text-mphal-forest">{collection.title}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-mphal-forest">
            {collection.title}
          </h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col small:flex-row small:items-start py-8 sm:py-12 content-container gap-8">
        <div className="shrink-0 small:w-60">
          <RefinementList sortBy={sort} hideOptionsPicker />
        </div>

        <div className="w-full">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
