import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full relative small:min-h-screen" style={{ background: "#F9F5EE" }}>
      <div className="h-16 border-b" style={{ background: "#F9F5EE", borderColor: "#EAD5B0" }}>
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi flex items-center gap-x-2 uppercase flex-1 basis-0 hover:text-mpal-forest transition-colors"
            style={{ color: "#8B5E3C" }}
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus hover:text-mpal-forest">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus hover:text-mpal-forest">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="font-display text-2xl font-bold hover:text-mpal-brown transition-colors"
            style={{ color: "#2D5016" }}
            data-testid="store-link"
          >
            mpal
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <div className="py-4 w-full flex items-center justify-center">
        <span className="font-sans text-xs italic" style={{ color: "#C4874A" }}>
          Pure products from Malnad 🌿
        </span>
      </div>
    </div>
  )
}
