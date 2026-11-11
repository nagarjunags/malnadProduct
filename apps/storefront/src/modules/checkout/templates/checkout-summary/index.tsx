import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="sticky top-28 flex flex-col gap-y-6">
      <div className="w-full bg-white border border-mphal-sand/70 rounded-large p-6 sm:p-8 shadow-xs flex flex-col">
        <Heading
          level="h2"
          className="font-display text-2xl font-bold text-mphal-forest mb-4"
        >
          Order Summary
        </Heading>
        <Divider className="mb-6" />
        <CartTotals totals={cart} />
        <div className="mt-6">
          <ItemsPreviewTemplate cart={cart} />
        </div>
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
