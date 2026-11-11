import { Heading } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10 sm:py-16">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-6 max-w-4xl h-full bg-white border border-mphal-sand/70 rounded-large p-6 sm:p-10 shadow-xs w-full"
          data-testid="order-complete-container"
        >
          <div className="border-b border-mphal-sand/60 pb-6">
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-mphal-caramel">
              Order Confirmed
            </span>
            <Heading
              level="h1"
              className="font-display text-2xl sm:text-3xl font-bold text-mphal-forest mt-1.5"
            >
              Thank you! Your order was placed successfully.
            </Heading>
            <p className="font-sans text-xs sm:text-sm text-mphal-mocha mt-1">
              We have received your order and will begin processing it shortly.
            </p>
          </div>
          <OrderDetails order={order} />
          <Heading level="h2" className="font-display text-xl font-bold text-mphal-forest pt-4">
            Order Summary
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
