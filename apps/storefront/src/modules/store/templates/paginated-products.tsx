import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { OptionValueIds } from "@lib/util/product-option-filters"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  optionValueIds,
  q,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  if (q && q.trim()) {
    queryParams["q"] = q.trim()
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    optionValueIds,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (products.length === 0) {
    return (
      <div className="py-16 px-6 text-center bg-white border border-mphal-sand/70 rounded-large shadow-xs max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#FAF5EE] border border-mphal-sand flex items-center justify-center mx-auto mb-4 text-mphal-forest">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-mphal-forest">
          {q ? `No Products Found Matching "${q}"` : "No Products Found"}
        </h3>
        <p className="font-sans text-sm text-mphal-mocha mt-1.5 max-w-sm mx-auto">
          {q
            ? "Try checking for spelling errors or searching for different keywords."
            : "No products are currently available in this view. Please browse our complete catalog."}
        </p>
        <div className="mt-6 flex items-center justify-center">
          <LocalizedClientLink href="/store">
            <button className="px-6 py-2.5 rounded-rounded font-sans text-xs uppercase tracking-wider font-bold bg-mphal-forest hover:bg-mphal-brown text-mphal-cream transition-colors shadow-xs">
              Browse All Products
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <>
      <ul
        className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-3 gap-6"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            data-testid="product-pagination"
            page={page}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}
