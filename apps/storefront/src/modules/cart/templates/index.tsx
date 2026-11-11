import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-10 sm:py-16 bg-[#FAF7F2] min-h-[75vh]">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div>
            <div className="mb-8">
              <span className="text-xs font-sans font-bold uppercase tracking-widest text-mphal-caramel">
                Your Selection
              </span>
              <h1 className="font-display text-3xl font-bold text-mphal-forest mt-1">
                Shopping Cart
              </h1>
            </div>

            <div className="grid grid-cols-1 small:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
              <div className="flex flex-col bg-white border border-mphal-sand/70 rounded-large p-6 sm:p-8 gap-y-6 shadow-xs">
                {!customer && (
                  <>
                    <SignInPrompt />
                    <Divider />
                  </>
                )}
                <ItemsTemplate cart={cart} />
              </div>
              <div className="relative">
                <div className="flex flex-col gap-y-6 sticky top-28">
                  {cart && cart.region && (
                    <div className="bg-white border border-mphal-sand/70 rounded-large p-6 sm:p-8 shadow-xs">
                      <Summary cart={cart} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
