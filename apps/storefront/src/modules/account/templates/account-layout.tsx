import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-14" data-testid="account-page">
      <div className="content-container max-w-5xl mx-auto">
        <div className="bg-white border border-mphal-sand/70 rounded-large shadow-xs p-6 sm:p-10 flex flex-col">
          <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] pb-10">
            <div className="border-b small:border-b-0 small:border-r border-mphal-sand/60 pb-6 small:pb-0 small:pr-8">
              {customer && <AccountNav customer={customer} />}
            </div>
            <div className="flex-1 pt-6 small:pt-0 small:pl-10">{children}</div>
          </div>
          <div className="flex flex-col small:flex-row items-start small:items-center justify-between border-t border-mphal-sand/60 pt-8 gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-mphal-forest">
                Need help with your account?
              </h3>
              <span className="font-sans text-xs text-mphal-mocha">
                You can manage your past orders, delivery addresses, and personal details above.
              </span>
            </div>
            <div>
              <UnderlineLink href="/store">
                Continue Shopping
              </UnderlineLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
