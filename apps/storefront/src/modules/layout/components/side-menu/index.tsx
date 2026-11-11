"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: HttpTypes.StoreProductCategory[] | null
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  categories,
}: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-mphal-forest font-sans text-sm text-mphal-brown tracking-wide"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/0 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-[51] inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full rounded-rounded justify-between p-6"
                    style={{
                      background: "rgba(27,59,34,0.95)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div className="flex justify-end" id="xmark">
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="text-mphal-cream hover:text-mphal-amber transition-colors"
                      >
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-4 sm:gap-5 items-start justify-start overflow-y-auto max-h-[60vh] no-scrollbar py-2">
                      <li>
                        <LocalizedClientLink
                          href="/"
                          className="font-display text-2xl sm:text-3xl leading-snug hover:text-mphal-amber transition-colors"
                          style={{ color: "#F5ECD7" }}
                          onClick={close}
                          data-testid="home-link"
                        >
                          Home
                        </LocalizedClientLink>
                      </li>
                      <li>
                        <LocalizedClientLink
                          href="/store"
                          className="font-display text-2xl sm:text-3xl leading-snug hover:text-mphal-amber transition-colors"
                          style={{ color: "#F5ECD7" }}
                          onClick={close}
                          data-testid="store-link"
                        >
                          All Products
                        </LocalizedClientLink>
                      </li>
                      {categories &&
                        categories.map((cat) => (
                          <li key={cat.id}>
                            <LocalizedClientLink
                              href={`/categories/${cat.handle}`}
                              className="font-display text-2xl sm:text-3xl leading-snug hover:text-mphal-amber transition-colors"
                              style={{ color: "#F5ECD7" }}
                              onClick={close}
                              data-testid={`${cat.handle}-link`}
                            >
                              {cat.name}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      <li>
                        <LocalizedClientLink
                          href="/account"
                          className="font-display text-2xl sm:text-3xl leading-snug hover:text-mphal-amber transition-colors"
                          style={{ color: "#F5ECD7" }}
                          onClick={close}
                          data-testid="account-link"
                        >
                          Account
                        </LocalizedClientLink>
                      </li>
                      <li>
                        <LocalizedClientLink
                          href="/cart"
                          className="font-display text-2xl sm:text-3xl leading-snug hover:text-mphal-amber transition-colors"
                          style={{ color: "#F5ECD7" }}
                          onClick={close}
                          data-testid="cart-link"
                        >
                          Cart
                        </LocalizedClientLink>
                      </li>
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150 text-mphal-sand",
                              languageToggleState.state && "-rotate-90"
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        <CountrySelect
                          toggleState={countryToggleState}
                          regions={regions}
                        />
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150 text-mphal-sand",
                            countryToggleState.state && "-rotate-90"
                          )}
                        />
                      </div>
                      <Text className="flex justify-between font-sans text-xs text-mphal-sand/70">
                        &copy; {new Date().getFullYear()} mphal. All rights reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
