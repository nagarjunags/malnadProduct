import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-8 pt-6 border-t border-mphal-sand/60">
      <Heading className="font-display text-lg font-bold text-mphal-forest">
        Need Help?
      </Heading>
      <div className="text-xs font-sans text-mphal-mocha my-3">
        <ul className="gap-y-2.5 flex flex-col">
          <li>
            <LocalizedClientLink
              href="/account/orders"
              className="text-mphal-forest hover:text-mphal-terracotta transition-colors font-medium underline"
            >
              View Order History in Account &rarr;
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink
              href="/store"
              className="text-mphal-forest hover:text-mphal-terracotta transition-colors font-medium underline"
            >
              Continue Shopping &rarr;
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
