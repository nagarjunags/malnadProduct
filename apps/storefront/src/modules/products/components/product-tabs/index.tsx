"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const hasDetails = Boolean(
    product.origin_country ||
      product.weight ||
      product.length ||
      product.width ||
      product.height ||
      product.material ||
      product.type?.value
  )

  if (!hasDetails) {
    return null
  }

  const tabs = [
    {
      label: "Product Specifications",
      component: <ProductDetailsTab product={product} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductDetailsTab = ({ product }: ProductTabsProps) => {
  const dimensions = [product.length, product.width, product.height]
    .filter(Boolean)
    .join(" × ")

  return (
    <div className="text-xs sm:text-sm font-sans py-4 space-y-3 text-mphal-brown">
      <div className="grid grid-cols-2 gap-4">
        {product.origin_country && (
          <div>
            <span className="font-bold text-mphal-forest block">Country of Origin</span>
            <p className="text-mphal-mocha">{product.origin_country}</p>
          </div>
        )}
        {product.weight ? (
          <div>
            <span className="font-bold text-mphal-forest block">Weight</span>
            <p className="text-mphal-mocha">{product.weight} g</p>
          </div>
        ) : null}
        {dimensions ? (
          <div>
            <span className="font-bold text-mphal-forest block">Dimensions</span>
            <p className="text-mphal-mocha">{dimensions} mm</p>
          </div>
        ) : null}
        {product.material && (
          <div>
            <span className="font-bold text-mphal-forest block">Material</span>
            <p className="text-mphal-mocha">{product.material}</p>
          </div>
        )}
        {product.type?.value && (
          <div>
            <span className="font-bold text-mphal-forest block">Type</span>
            <p className="text-mphal-mocha">{product.type.value}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs
