import { Suspense } from "react"
import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"
import StoreSearchBar from "@modules/store/components/store-search-bar"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  q,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* Store Header Banner */}
      <div className="border-b border-mphal-sand/70 bg-gradient-to-r from-[#F5EFE6] via-[#FAF7F2] to-[#F5EFE6] py-10 sm:py-14">
        <div className="content-container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1
                data-testid="store-page-title"
                className="font-display text-3xl sm:text-4xl font-bold text-mphal-forest"
              >
                All Products
              </h1>
              <p className="font-sans text-sm text-mphal-mocha mt-1.5 max-w-xl">
                Browse our collection of products, available across regions.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              <StoreSearchBar initialQuery={q} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <div
        className="flex flex-col small:flex-row small:items-start py-8 sm:py-12 content-container gap-8"
        data-testid="category-container"
      >
        <div className="shrink-0 small:w-60">
          <RefinementList sortBy={sort} />
        </div>

        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
              q={q}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
