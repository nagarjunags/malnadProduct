import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();

  return (
    <footer className="border-t w-full" style={{ borderColor: "#EAD5B0", background: "#F9F5EE" }}>
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div className="flex flex-col gap-y-3">
            <LocalizedClientLink
              href="/"
              className="font-display text-3xl font-bold hover:text-mpal-forest transition-colors"
              style={{ color: "#2D5016" }}
            >
              mpal
            </LocalizedClientLink>
            <p className="font-sans text-sm leading-relaxed max-w-xs" style={{ color: "#8B5E3C" }}>
              Pure homemade products from the heart of Malnad, Karnataka.<br />
              Shade-grown coffee, wild honey, spices &amp; more.
            </p>
            <p className="font-sans text-xs tracking-widest uppercase" style={{ color: "#C4874A" }}>
              ✦ Shivamogga · Kodagu · Chikkamagaluru ✦
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus font-sans font-semibold tracking-wide uppercase" style={{ color: "#2D5016" }}>
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return;
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li
                        className="flex flex-col gap-2 txt-small"
                        style={{ color: "#8B5E3C" }}
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-mpal-forest transition-colors",
                            children && "txt-small-plus font-semibold"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-mpal-forest transition-colors"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus font-sans font-semibold tracking-wide uppercase" style={{ color: "#2D5016" }}>
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                  style={{ color: "#8B5E3C" }}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-mpal-forest transition-colors"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus font-sans font-semibold tracking-wide uppercase" style={{ color: "#2D5016" }}>About</span>
              <ul className="grid grid-cols-1 gap-y-2 txt-small" style={{ color: "#8B5E3C" }}>
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-mpal-forest transition-colors"
                  >
                    Our Story
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-mpal-forest transition-colors"
                  >
                    All Products
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="hover:text-mpal-forest transition-colors"
                  >
                    My Account
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between" style={{ color: "#C4874A" }}>
          <Text className="txt-compact-small font-sans">
            © {new Date().getFullYear()} mpal. All rights reserved.
          </Text>
          <Text className="txt-compact-small font-sans italic">
            Made with love from Malnad 🌿
          </Text>
        </div>
      </div>
    </footer>
  );
}
