import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* Category Header Banner */}
      <div className="border-b border-mphal-sand/70 bg-gradient-to-r from-[#F5EFE6] via-[#FAF7F2] to-[#F5EFE6] py-10 sm:py-14">
        <div className="content-container">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-sans text-mphal-mocha/70 mb-3">
            <LocalizedClientLink href="/" className="hover:text-mphal-forest transition-colors">
              Home
            </LocalizedClientLink>
            <span>&bull;</span>
            <LocalizedClientLink href="/store" className="hover:text-mphal-forest transition-colors">
              Store
            </LocalizedClientLink>
            {parents.map((parent) => (
              <span key={parent.id} className="flex items-center gap-2">
                <span>&bull;</span>
                <LocalizedClientLink
                  href={`/categories/${parent.handle}`}
                  className="hover:text-mphal-forest transition-colors"
                >
                  {parent.name}
                </LocalizedClientLink>
              </span>
            ))}
            <span>&bull;</span>
            <span className="font-semibold text-mphal-forest">{category.name}</span>
          </div>

          <h1
            data-testid="category-page-title"
            className="font-display text-3xl sm:text-4xl font-bold text-mphal-forest"
          >
            {category.name}
          </h1>

          {category.description && (
            <p className="font-sans text-sm text-mphal-mocha mt-2 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}

          {category.category_children && category.category_children.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 mt-6 border-t border-mphal-sand/40">
              {category.category_children.map((c) => (
                <LocalizedClientLink
                  key={c.id}
                  href={`/categories/${c.handle}`}
                  className="shrink-0 px-4 py-1.5 rounded-full text-xs font-sans font-semibold tracking-wider uppercase border border-mphal-sand bg-white hover:bg-mphal-forest hover:text-mphal-cream transition-colors text-mphal-brown shadow-2xs"
                >
                  {c.name}
                </LocalizedClientLink>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div
        className="flex flex-col small:flex-row small:items-start py-8 sm:py-12 content-container gap-8"
        data-testid="category-container"
      >
        <div className="shrink-0 small:w-60">
          <RefinementList
            sortBy={sort}
            data-testid="sort-by-container"
            hideOptionsPicker
          />
        </div>

        <div className="w-full">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
