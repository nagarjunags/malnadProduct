import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-24 px-6 max-w-xl mx-auto flex flex-col items-center text-center bg-white border border-mphal-sand/70 rounded-large shadow-xs"
      data-testid="empty-cart-message"
    >
      <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-mphal-sand flex items-center justify-center text-mphal-forest mb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      <Heading
        level="h1"
        className="font-display text-2xl sm:text-3xl font-bold text-mphal-forest"
      >
        Your Cart is Empty
      </Heading>

      <Text className="font-sans text-sm text-mphal-mocha mt-2 mb-6 max-w-md leading-relaxed">
        You don&apos;t have any items in your cart yet. Browse our products to find something you like.
      </Text>

      <LocalizedClientLink href="/store">
        <button className="px-8 py-3.5 rounded-rounded font-sans text-xs uppercase tracking-widest font-bold bg-mphal-forest hover:bg-mphal-brown text-mphal-cream shadow-sm transition-all duration-200">
          Explore Products &rarr;
        </button>
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
