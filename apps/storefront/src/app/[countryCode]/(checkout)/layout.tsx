import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full relative small:min-h-screen bg-[#FAF7F2]">
      <div className="h-16 border-b border-mphal-sand/70 bg-[#FAF7F2]">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi flex items-center gap-x-2 uppercase flex-1 basis-0 hover:text-mphal-forest transition-colors text-mphal-mocha"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus hover:text-mphal-forest">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus hover:text-mphal-forest">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="font-display text-2xl font-bold hover:text-mphal-terracotta transition-colors text-mphal-forest"
            data-testid="store-link"
          >
            mphal
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <div className="py-4 w-full flex items-center justify-center">
        <span className="font-sans text-xs tracking-wider text-mphal-mocha/80">
          Secure Checkout &bull; mphal
        </span>
      </div>
    </div>
  )
}
