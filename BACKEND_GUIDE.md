# Medusa DTC Backend — The Definitive Technical & Operational Manual
> **Project:** `mphal` / Medusa Direct-to-Consumer (DTC) Backend  
> **Framework:** Medusa v2 (`@medusajs/medusa@2.18.0`)  
> **Target Audience:** Store Merchants, Technical Operations, Backend Engineers, and Systems Architects  
> **Location:** Root Repository (`/BACKEND_GUIDE.md`)

---

## Table of Contents

1. [Executive Overview & Architecture Blueprint](#1-executive-overview--architecture-blueprint)
   - [Medusa v2 Architectural Philosophy](#medusa-v2-architectural-philosophy)
   - [Technology Stack](#technology-stack)
   - [Monorepo Structure](#monorepo-structure)
   - [Storefront-to-Backend Integration Architecture](#storefront-to-backend-integration-architecture)
2. [Merchant Operations & Core Commerce Concepts](#2-merchant-operations--core-commerce-concepts)
   - [Store Entity](#store-entity)
   - [Sales Channels: How They Work, Why Use Them, How to Use Them](#sales-channels-how-they-work-why-use-them-how-to-use-them)
   - [Inventory & Stock Locations: Warehousing, Allocations, and Tracking](#inventory--stock-locations-warehousing-allocations-and-tracking)
   - [Product Catalog Hierarchy: Products, Options, Variants, SKUs](#product-catalog-hierarchy-products-options-variants-skus)
   - [Categorization & Grouping: Categories vs Collections vs Tags](#categorization--grouping-categories-vs-collections-vs-tags)
   - [Pricing, Currencies & Multi-Regional Pricing](#pricing-currencies--multi-regional-pricing)
   - [Shipping, Fulfillment & Logistics](#shipping-fulfillment--logistics)
   - [Custom Admin Widget: Delivery Box Shipping Label (4"x6")](#custom-admin-widget-delivery-box-shipping-label-4x6)
   - [Customer Management & Customer Groups](#customer-management--customer-groups)
   - [Taxes, Tax Regions & Providers](#taxes-tax-regions--providers)
   - [API Keys: Publishable vs Secret](#api-keys-publishable-vs-secret)
   - [Promotions, Campaigns & Discounts](#promotions-campaigns--discounts)
   - [End-to-End Cart-to-Order Lifecycle](#end-to-end-cart-to-order-lifecycle)
3. [Payment Systems & Deep Dive into Razorpay Module](#3-payment-systems--deep-dive-into-razorpay-module)
   - [Medusa v2 Payment Architecture](#medusa-v2-payment-architecture)
   - [Codebase Razorpay Provider Implementation](#codebase-razorpay-provider-implementation)
   - [Smallest Unit Math (INR Paise Conversion)](#smallest-unit-math-inr-paise-conversion)
   - [Signature Verification & Fraud Prevention](#signature-verification--fraud-prevention)
   - [Incomplete Payment Response Error Handling](#incomplete-payment-response-error-handling)
   - [The Custom Payment Session Bridge Route](#the-custom-payment-session-bridge-route)
   - [Webhook Processing & Reconciliation](#webhook-processing--reconciliation)
   - [Step-by-Step: Integrating New Payment Providers (Cash on Delivery / Stripe)](#step-by-step-integrating-new-payment-providers-cash-on-delivery--stripe)
4. [Refund Architecture & Customer Return Workflows](#4-refund-architecture--customer-return-workflows)
   - [Current Codebase Implementation of Refunds](#current-codebase-implementation-of-refunds)
   - [How Admin Triggers a Refund](#how-admin-triggers-a-refund)
   - [Razorpay API Refund Processing & TAT](#razorpay-api-refund-processing--tat)
   - [Full vs Partial Refunds](#full-vs-partial-refunds)
   - [Building an End-to-End Automated Return & Restock Flow](#building-an-end-to-end-automated-return--restock-flow)
   - [Refund Webhook Events](#refund-webhook-events)
5. [Admin Customizations & White-Label Branding](#5-admin-customizations--white-label-branding)
   - [Brand Retitling Plugin (`brand-retitle`)](#brand-retitling-plugin-brand-retitle)
   - [Client-Side DOM Sanitizer](#client-side-dom-sanitizer)
   - [Custom Shipping Label Widget](#custom-shipping-label-widget)
   - [Admin Localization & i18n](#admin-localization--i18n)
6. [Cloud File Storage (Cloudflare R2 / S3)](#6-cloud-file-storage-cloudflare-r2--s3)
   - [Provider Architecture](#provider-architecture)
   - [Configuration & CORS Setup](#configuration--cors-setup)
7. [API Reference & Postman Test Collection](#7-api-reference--postman-test-collection)
   - [Storefront API Endpoints](#storefront-api-endpoints)
   - [Admin API Endpoints](#admin-api-endpoints)
   - [Custom Routes](#custom-routes)
   - [API Studio & Automated Postman Testing](#api-studio--automated-postman-testing)
8. [Initial Data Seeding & Migration Workflows](#8-initial-data-seeding--migration-workflows)
   - [Initial Data Seed Script Breakdown](#initial-data-seed-script-breakdown)
   - [Core-Flow Workflows Execution Order](#core-flow-workflows-execution-order)
9. [Environment Configuration Reference](#9-environment-configuration-reference)
   - [Backend Environment Variables Dictionary](#backend-environment-variables-dictionary)
   - [Secret Generation Script](#secret-generation-script)
10. [Deployment, DevOps & Production Runbook](#10-deployment-devops--production-runbook)
    - [Local Development with zrok Tunneling](#local-development-with-zrok-tunneling)
    - [GCP Production Deployment Pipeline](#gcp-production-deployment-pipeline)
    - [Process Management & Health Monitoring](#process-management--health-monitoring)
11. [Zero-to-Hero Project Re-creation Blueprint (Complete Source Code)](#11-zero-to-hero-project-re-creation-blueprint-complete-source-code)
    - [Step 1: Workspace & Root Monorepo Files](#step-1-workspace--root-monorepo-files)
    - [Step 2: Backend Core Configuration Files](#step-2-backend-core-configuration-files)
    - [Step 3: Custom Razorpay Payment Module](#step-3-custom-razorpay-payment-module)
    - [Step 4: Custom API Endpoints](#step-4-custom-api-endpoints)
    - [Step 5: Custom Admin Dashboard Extensions](#step-5-custom-admin-dashboard-extensions)
    - [Step 6: Data Seeding Script](#step-6-data-seeding-script)
    - [Step 7: Testing Suites](#step-7-testing-suites)
    - [Step 8: Execution, Build & Verification Commands](#step-8-execution-build--verification-commands)

---

# 1. Executive Overview & Architecture Blueprint

## Medusa v2 Architectural Philosophy

Medusa v2 (`@medusajs/medusa@2.18.0`) is built as a **modular commerce framework**:
1. **Modules**: Independent business domains (Cart, Order, Payment, Fulfillment, Product, Inventory, Stock Location, Pricing, Customer, Store, Currency, Tax, API Key). Each module encapsulates its own data models, services, migrations, and internal repository logic. Modules communicate only via defined service interfaces.
2. **Workflows**: Transactional, multi-step business logic orchestrators built on the Medusa Workflows SDK (`@medusajs/framework/workflows-sdk`). Workflows provide compensation steps (automatic rollback on failure), event emissions, and execution guarantees.
3. **Module Links**: Virtual relations connecting distinct modules without tight relational database foreign keys (e.g., linking a `StockLocation` from the Stock Location module to a `SalesChannel` in the Sales Channel module).
4. **HTTP Layer (API routes)**: Lightweight endpoints residing in `apps/backend/src/api/` that deserialize requests, enforce authentication, and delegate business execution to workflows or module services.
5. **Admin Dashboard**: An embedded React single-page application built on Vite and `@medusajs/ui`, loaded directly under `/app` on the backend port.

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Monorepo Engine** | Turborepo (`turbo`) | `^2.0.14` | Workspace task graph orchestration (`build`, `dev`, `lint`, `test`, `seed`) |
| **Package Manager** | pnpm | `11.21.0` | Strict workspace dependency management via `pnpm-workspace.yaml` |
| **Backend Runtime** | Node.js | `>=20.x` (Production uses Node 22) | Core execution environment |
| **Core Commerce** | Medusa Framework | `2.18.0` | Headless digital commerce platform |
| **Database** | PostgreSQL | `15+` (Hosted on Neon Serverless) | Relational database with pooled connections & SSL |
| **Event Bus / Cache** | Redis | `6.x / 7.x` | Distributed caching, pub/sub, and workflow job queues |
| **Payment Gateway** | Razorpay SDK | `^2.9.8` | Custom module supporting Cards, UPI, NetBanking, and automated refunds |
| **File Storage** | Cloudflare R2 | S3 Compatible (`@medusajs/medusa/file-s3`) | High-speed, zero-egress asset storage for product images and shipping labels |
| **Admin UI** | Vite + React + `@medusajs/ui` | React 18, Vite 5, Tailwind | Embedded merchant administrative control center |
| **Storefront** | Next.js App Router | Next.js 15+ (`apps/storefront`) | Customer-facing ecommerce web application |

## Monorepo Structure

```text
.
├── BACKEND_GUIDE.md             # This comprehensive master backend documentation
├── AGENTS.md                    # Coding and engineering conventions for AI and developers
├── turbo.json                   # Turborepo task definitions
├── package.json                 # Monorepo root configuration (pnpm workspace)
├── pnpm-workspace.yaml          # Defines packages: apps/**
├── deploy.sh                    # Mac-to-GCP deployment automation using Docker Linux build
├── deploy-storefront.sh         # Storefront build & deployment script
├── run.sh                       # Local development bootstrapper with zrok headless tunneling
├── r2-cors-config.json          # Cloudflare R2 CORS configuration
├── apps/
│   ├── backend/                 # Medusa 2.18.0 commerce application (@dtc/backend)
│   │   ├── medusa-config.ts     # Core config: DB URL, CORS, secrets, Razorpay & R2 modules
│   │   ├── Dockerfile           # Multi-stage production container build
│   │   ├── package.json         # Backend dependencies & scripts (dev, build, test, seed)
│   │   ├── tsconfig.json        # TypeScript configuration
│   │   ├── jest.config.js       # Unit and integration test runner config
│   │   ├── api-studio/          # Postman collection & environment tests
│   │   │   ├── ecom-backend-tests.postman_collection.json
│   │   │   └── ecom-backend-tests.environment.json
│   │   └── src/
│   │       ├── admin/           # Admin Dashboard extensions
│   │       │   ├── i18n/        # Translation overrides (Welcome to mphal)
│   │       │   │   ├── index.ts
│   │       │   │   └── json/en.json
│   │       │   ├── widgets/     # Custom UI widgets (OrderShippingLabelWidget)
│   │       │   │   └── order-shipping-label.tsx
│   │       │   ├── tsconfig.json
│   │       │   └── vite-env.d.ts
│   │       ├── api/             # File-based API endpoints
│   │       │   ├── admin/custom/route.ts
│   │       │   ├── store/custom/route.ts
│   │       │   └── store/payment-collections/[id]/payment-sessions/[session_id]/razorpay/route.ts
│   │       ├── migration-scripts/ # Seeding scripts (initial-data-seed.ts)
│   │       └── modules/         # Custom isolated modules
│   │           └── razorpay/    # Custom Razorpay Payment Provider
│   │               ├── index.ts
│   │               ├── service.ts
│   │               └── __tests__/ # Unit and preservation test suites
│   └── storefront/              # Next.js 15+ Storefront application (@dtc/storefront)
```

## Storefront-to-Backend Integration Architecture

The Next.js storefront (`apps/storefront`) communicates with the Medusa backend via `@medusajs/js-sdk`:

1. **Client Initialization (`apps/storefront/src/lib/config.ts`)**:
   ```ts
   import Medusa from "@medusajs/js-sdk"
   export const sdk = new Medusa({
     baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
     debug: process.env.NODE_ENV === "development",
     publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
   })
   ```
2. **Publishable Key Authorization**: Every catalog request transmits `x-publishable-api-key`. Medusa automatically bounds results to the sales channels mapped to that publishable key.
3. **Session Cookies & Auth**: Customer login (`/auth/customer/emailpass`) sets HTTP-only session cookies and returns customer JWT tokens stored securely.
4. **Cache Revalidation**: Next.js Server Actions invoke `sdk.client.fetch()` and revalidate cache tags (`revalidateTag("carts")`, `revalidateTag("products")`) to keep the UI in sync.

---

# 2. Merchant Operations & Core Commerce Concepts

For a merchant operating `mphal` to sell products, understanding the relationship between the administrative entities is vital:

```text
                               [ STORE: "mphal" ]
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
  [ SALES CHANNELS ]                                     [ REGIONS & CURRENCIES ]
  (e.g., Default Web Store,                              (e.g., India: INR, Europe: EUR)
   Mobile App, B2B)                                               │
            │                                                     ▼
            │ links to                                   [ PAYMENT PROVIDERS ]
            │                                            (pp_razorpay_razorpay, manual)
            ▼                                                     │
  [ STOCK LOCATIONS ] ◄───────────────────────────────────────────┤
  (European Warehouse,                                            ▼
   Shivamogga Agro Hub)                                  [ SHIPPING PROFILES ]
            │                                            (Default, Fragile)
            ▼                                                     │
  [ INVENTORY ITEMS ]                                             ▼
  (Stocked / Reserved / Available)                       [ SHIPPING OPTIONS ]
            ▲                                            (Surface ₹50, Express ₹120)
            │ tracks stock for
            │
  [ PRODUCT VARIANTS ] (SKU-100g, SKU-250g, SKU-500g)
            ▲
            │ belongs to
  [ PRODUCT ] ("Cold Pressed Coconut Oil", "mphal T-Shirt")
     ├── Categories (Taxonomy: Groceries > Oils)
     ├── Collections (Thematic: Monsoon Essentials)
     └── Tags (Search/Filter: "organic", "wood-pressed")
```

---

## Store Entity

The **Store** represents your core legal business organization (`mphal`).

### What You Can Do:
- Set store name, default currency, and supported currency list.
- Define the default sales channel.
- Store legal details, support email, and metadata.

### What is the Use of That:
- Multi-currency support allows customers in different countries to view prices in their native currencies.
- Default sales channel ensures new products and carts are assigned a valid channel automatically.

### How to Use That:
- **Admin Dashboard**: Go to **Settings > Store Details**. Edit name, add currencies (e.g., `inr`, `usd`, `eur`), and select the default currency (`inr`).
- **Store API**: `GET /store/store` returns store settings and supported currencies.

---

## Sales Channels: How They Work, Why Use Them, How to Use Them

### What is a Sales Channel?
A **Sales Channel** represents a distinct customer touchpoint where products are marketed and sold. Examples:
1. Online Web Storefront (`mphal.com`)
2. Mobile Shopping App (iOS / Android)
3. Social Commerce (Instagram Shop / WhatsApp Store)
4. B2B Wholesale Portal
5. Physical Retail Store / POS counter

### Why Use Sales Channels?
Without sales channels, all products would be dumped onto every platform simultaneously. Sales Channels grant you granular control:
- **Product Catalog Partitioning**: Offer exclusive items on the mobile app that are not visible on the web.
- **Inventory Isolation**: Route web orders to fulfillment center A while wholesale orders route to warehouse B.
- **Security & Multi-Tenancy**: The frontend connects using a **Publishable API Key** scoped *exclusively* to one or more sales channels. The frontend cannot leak or sell items outside its assigned channels.

### How Sales Channels Work Internally:
1. When a product is created, it is associated with one or more sales channels via the `product_sales_channel` link.
2. When a Publishable API Key (`pk_...`) is generated, it is linked to a sales channel via `linkSalesChannelsToApiKeyWorkflow`.
3. When the storefront sends the `x-publishable-api-key` header in requests, Medusa automatically filters all catalog endpoints (`/store/products`) to only return products assigned to that sales channel.
4. When a cart is created, it inherits the sales channel of the publishable API key.
5. In order for customers to checkout, the Sales Channel **must be linked to a Stock Location**. If a sales channel has no linked stock location, orders cannot resolve inventory and checkout will fail!

### How to Use Sales Channels (Merchant Operations):
- **Create Sales Channel**: Go to **Settings > Sales Channels > Create Channel**. Name it (e.g., "Mobile App").
- **Assign Products**: Under the Sales Channel details, click **Add Products** and select which catalog items to include.
- **Connect Stock Location**: Go to **Settings > Locations > [Select Location] > Connected Sales Channels**, toggle on the sales channel.
- **Generate API Key**: Go to **Settings > Developer > Publishable API Keys > Create Key**, assign it to the new sales channel, and use the generated `pk_...` in your frontend client.

---

## Inventory & Stock Locations: Warehousing, Allocations, and Tracking

Medusa v2 separates catalog data from physical logistics using three dedicated concepts:
1. **Stock Location**: A physical warehouse, store backroom, or 3PL depot where goods physically reside.
2. **Inventory Item**: An abstract inventory tracking record linked to a product variant.
3. **Inventory Level**: The physical record of how many units of an `InventoryItem` are present at a specific `StockLocation`.

### The Three Inventory Quantities
For every Inventory Level, Medusa tracks three critical values:
$$\text{Available Quantity} = \text{Stocked Quantity} - \text{Reserved Quantity}$$

- **Stocked Quantity**: The total number of physical units currently sitting on shelves in the warehouse (e.g., 50 units).
- **Reserved Quantity**: The units committed to open, unfulfilled orders (e.g., 5 customer carts have successfully checked out, reserving 5 units).
- **Available Quantity**: The remaining balance available to be purchased by new shoppers (45 units). If available hits `0` and backorders are disabled, the product displays "Out of Stock" on the storefront.

### How Inventory Tracking Works in the Order Flow:
1. **Browsing**: Storefront queries `/store/products` with variant inventory status.
2. **Cart Creation**: Adding to cart does not reserve inventory (to prevent cart-hoarding denial-of-service).
3. **Cart Completion (`POST /store/carts/:id/complete`)**: Medusa checks available inventory across all stock locations linked to the cart's sales channel. If available $\ge$ requested quantity:
   - A `ReservationItem` is created.
   - `reserved_quantity` increases by the line item quantity.
4. **Fulfillment Creation (Admin packs order)**:
   - The merchant creates a fulfillment in Admin.
   - Medusa decrements both `stocked_quantity` and `reserved_quantity`.
   - Physical stock leaves the building.
5. **Order Cancellation**: If an order is canceled prior to fulfillment, Medusa automatically deletes the `ReservationItem`, returning the units to `available_quantity`.

### How to Manage Inventory:
1. **Enable Inventory Management on Variant**:
   - Go to **Products > [Select Product] > Variants > Edit Variant**.
   - Ensure **Manage Inventory** is toggled **ON**.
2. **Set Initial Stock Levels**:
   - Go to **Inventory** in Admin sidebar.
   - Locate the SKU. Click **Edit Quantity**.
   - Enter physical count for your stock location (e.g., Shivamogga Hub = 500).
3. **Backorders (Allow Out of Stock Purchasing)**:
   - If toggled ON, customers can continue buying even when `available_quantity <= 0`. Ideal for pre-orders or made-to-order artisanal foods.

---

## Product Catalog Hierarchy: Products, Options, Variants, SKUs

```text
PRODUCT: "Single Origin Malnad Filter Coffee"
  │
  ├── Options:
  │     ├── Option 1: "Roast Level" -> Values: ["Medium Roast", "Dark Roast"]
  │     └── Option 2: "Weight"      -> Values: ["250g", "500g"]
  │
  └── Variants (Permutations):
        ├── Variant 1: SKU: COF-MED-250 (Medium / 250g) -> ₹280
        ├── Variant 2: SKU: COF-MED-500 (Medium / 500g) -> ₹520
        ├── Variant 3: SKU: COF-DRK-250 (Dark / 250g)   -> ₹290
        └── Variant 4: SKU: COF-DRK-500 (Dark / 500g)   -> ₹540
```

### 1. Product Entity
The high-level marketing representation of your item.
- `title`: Name shown in store (e.g., "mphal T-Shirt").
- `handle`: URL slug (e.g., `mphal-t-shirt`, accessed at `/products/mphal-t-shirt`).
- `description`: Rich text marketing copy.
- `status`: Lifecycle state:
  - `draft`: Only visible to admin users.
  - `proposed`: Awaiting merchant approval.
  - `published`: Publicly viewable and purchasable.
  - `rejected`: Archived / not for sale.
- `thumbnail`: Main hero photo URL.
- `images`: Array of product gallery photos.
- `weight`, `length`, `height`, `width`: Physical dimensions used for dimensional shipping calculations.
- `shipping_profile_id`: Associates product with shipping rules (e.g., standard vs fragile).

### 2. Product Options & Option Values
Options are the configurable attributes a shopper selects before adding an item to their cart:
- Option: `Size` $\rightarrow$ Values: `S`, `M`, `L`, `XL`
- Option: `Color` $\rightarrow$ Values: `Black`, `White`
- Option: `Pack Size` $\rightarrow$ Values: `250g`, `500g`, `1kg`

### 3. Product Variants & SKUs
A **Variant** is the concrete, purchasable item added to the cart:
- Has its own unique **SKU (Stock Keeping Unit)**, e.g., `SHIRT-S-BLACK`.
- Has its own barcode / EAN / UPC.
- Has independent pricing records per region/currency.
- Links to an `InventoryItem` to track physical stock counts.

---

## Categorization & Grouping: Categories vs Collections vs Tags

| Feature | Product Categories | Product Collections | Product Tags |
| :--- | :--- | :--- | :--- |
| **Data Structure** | **Hierarchical Tree** (nested parent $\rightarrow$ child) | **Flat Grouping** (curated lists) | **Flat Labels** (key-value or words) |
| **Primary Purpose** | Global store navigation & taxonomy | Marketing campaigns, seasonal drops | Faceted search, filtering, SEO |
| **URL Path Example** | `/categories/food/spices/cardamom` | `/collections/monsoon-favorites` | Filter parameter: `?tags=organic` |
| **Parent/Child Nesting**| **Yes** (unlimited nesting depth) | No | No |
| **Internal / Active Flags**| Yes (`is_active`, `is_internal`) | No | No |
| **Typical Use Cases** | `Clothing` > `Men` > `Shirts`<br>`Food` > `Spices` > `Pepper` | `Diwali Gift Boxes`<br>`Summer Clearance 2026`<br>`Staff Picks` | `organic`, `gluten-free`, `bestseller`, `new-arrival`, `fragile` |

### How to Use Each:
1. **Categories**: Use for permanent website navigation menus. Categories define *what the product fundamentally is*.
2. **Collections**: Use for temporary or editorial groupings. A single product can belong to multiple collections (e.g., a shirt can be in "New Arrivals" and "Summer Sale").
3. **Tags**: Use for quick filtering chips on catalog pages (e.g., customer clicks filter `[x] Pure Veg`).

---

## Pricing, Currencies & Multi-Regional Pricing

### Money Storage in Minor Units (Paise / Cents)
Medusa and payment gateways resolve floating-point arithmetic errors by handling money in **smallest currency units (minor units)**:
- **INR (Indian Rupee)**: 1 INR = 100 paise. An item costing ₹450.00 is stored and transmitted as `45000`.
- **USD / EUR**: 1 USD = 100 cents. $15.00 is stored as `1500`.
- **Zero-decimal currencies** (e.g., `JPY`, `KRW`): Stored as integer units (`100` = 100 JPY).

### Multi-Regional Pricing
A single variant can have multiple prices simultaneously:
1. **Default Currency Price**: `currency_code: "inr"`, `amount: 49900` (₹499.00).
2. **International Currency Price**: `currency_code: "usd"`, `amount: 1500` ($15.00).
3. **Region-Specific Price**: `region_id: "reg_europe"`, `amount: 1200` (€12.00). When a customer shops from Germany, the regional override takes precedence over general currency pricing.

### Price Lists (Wholesale, VIP, Flash Sales)
Price Lists allow overriding prices dynamically without modifying base product data:
- **Sale Price Lists**: Set discount prices active between a start date and end date.
- **Customer Group Price Lists**: Offer 20% off exclusively to customers in the `Wholesale Tier 1` group.

---

## Shipping, Fulfillment & Logistics

```text
[ Stock Location: Shivamogga Hub ]
       │
       ▼ linked to
[ Fulfillment Set: India Delivery (Type: Shipping) ]
       │
       ▼ contains
[ Service Zone: All-India Express ]
       ├── Geo Zones: Country: "IN"
       │
       └── Shipping Options:
             ├── Option 1: Standard Surface (₹50, 3-5 Days)
             └── Option 2: Express Air Courier (₹120, 24-48 Hours)
```

### Key Fulfillment Terms
- **Shipping Profile**: Grouping products that share shipping logistics.
  - *Default Profile*: Standard items.
  - *Fragile / Glass Profile*: Pickles, honey jars requiring special wooden crates and extra courier insurance.
- **Fulfillment Provider**: The integration executing the shipment. The starter uses `manual_manual` (internal warehouse fulfillment). Real integrations include Shiprocket, Delhivery, Bluedart, FedEx, DHL.
- **Shipping Rules**: Conditions that dictate option visibility at checkout:
  - `enabled_in_store: true` (Must be active for customer checkout).
  - Cart minimums (e.g., Free shipping on orders above ₹1,000).

---

## Custom Admin Widget: Delivery Box Shipping Label (4"x6")

Located in `apps/backend/src/admin/widgets/order-shipping-label.tsx`, this project features an **integrated delivery shipping label generator**.

### Merchant Capabilities
- Injected directly into the **Order Details page** before the main details panel (`zone: "order.details.before"`).
- **Printable 4" x 6" standard thermal sticker format** (`100mm x 150mm`).
- **Live Label Preview**: Allows the merchant to inspect packing data before printing.
- **One-Click Print**: Directly invokes `window.print()` targeting thermal label printers (Zebra, TSC, Rollo) or standard desktop printers.

### Label Contents & Features
1. **Store Brand Header**: Displays `mphal` and subtitle `"Malnad Homemade Products"`.
2. **Dynamic Order Barcode**: Built using an inline vector algorithm (`generateBarcodeSvg(order.id)`) — zero external barcode service dependencies. Renders crisp vector lines scannable by hand scanners.
3. **SHIP TO (Recipient Address)**:
   - Recipient Full Name.
   - Prominently highlighted yellow contact badge: `TEL: <Customer Phone>` for delivery courier dispatchers.
   - Street address, City, State, Postal Code, Country.
4. **SHIP FROM (Return Origin)**:
   - Pre-configured merchant origin:
     ```text
     mphal
     Western Ghats Agro Hub
     Shivamogga, Karnataka - 577201
     Support: 8618333210
     ```
5. **Shipping Meta**: Payment method (`PREPAID`), courier mode (`Surface Express`), and payment status.
6. **Package Checklist Table**: Tabulates item index, product title, variant/pack details, SKU, and item quantity to ensure zero packaging mistakes.
7. **Fragile Caution Footer**: High-contrast black warning strip:
   `FRAGILE - HOMEMADE FOOD PRODUCTS - HANDLE WITH CARE`.

---

## Customer Management & Customer Groups

### Guest Checkout vs Registered Accounts
- **Guest Checkout**: A buyer inputs an email and address at checkout. An order is created with `customer_id` attached to a guest customer profile.
- **Registered Customers**: Shoppers create an account using email and password via `/auth/customer/emailpass`.
  - Can save multiple delivery addresses in their Address Book.
  - Can view historical orders, tracking links, and download invoices.
  - Can be assigned to **Customer Groups**.

### Customer Groups
Merchants can group customers for segmented marketing and pricing:
- *Retail Regulars*
- *Wholesale Bulk Buyers* (receives B2B pricing)
- *VIP Subscribers* (free shipping privileges)

---

## Taxes, Tax Regions & Providers

Medusa v2 uses the `@medusajs/medusa/tax` module:
- **Tax Region**: Bound to a specific country (e.g., `IN` for India, `GB` for Great Britain).
- **Default Tax Rate**: Applied to all items unless an override exists (e.g., 5% GST for groceries, 18% for cosmetics).
- **Tax Overrides**: Create overrides linked to specific product categories or shipping options.

---

## API Keys: Publishable vs Secret

1. **Publishable API Keys (`pk_...`)**:
   - Safe to embed in frontend clients (`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`).
   - Scoped strictly to one or more **Sales Channels**.
   - Cannot access admin endpoints or mutate sensitive store settings.
2. **Secret API Keys (`sk_...`)**:
   - Kept strictly private on server environments or automated scripts.
   - Grants programmatic admin privileges for backend automation and syncing.

---

## Promotions, Campaigns & Discounts

- **Standard Promotion**: Discount code (e.g., `MONSOON20`) providing a percentage (20% off) or fixed amount (₹100 off).
- **Automatic Promotion**: Fired automatically when cart rules match (e.g., cart total > ₹1,500).
- **Buy-X-Get-Y**: Buy 2 packets of coffee, get 1 free spice jar.

---

## End-to-End Cart-to-Order Lifecycle

```text
1. Customer clicks "Add to Cart"
   └── POST /store/carts
   └── POST /store/carts/:id/line-items
       └── Medusa creates Cart, calculates item totals & taxes

2. Customer enters Shipping Address
   └── POST /store/carts/:id
       └── Saves first_name, last_name, address_1, phone, postal_code

3. Customer selects Shipping Option
   └── POST /store/carts/:id/shipping-methods
       └── Attaches shipping option (e.g., Express Delivery ₹120)

4. Storefront initializes Payment Session
   └── POST /store/payment-collections
   └── POST /store/payment-collections/:id/payment-sessions
       └── Resolves provider "pp_razorpay_razorpay"
       └── Backend initiates Razorpay Order via initiatePayment()
       └── Returns Razorpay Order ID (e.g., order_OXy123456)

5. Customer pays via Razorpay Modal
   └── Razorpay checkout.js opens on storefront
   └── Customer completes UPI / Card payment
   └── Razorpay returns { razorpay_payment_id, razorpay_order_id, razorpay_signature }

6. Storefront syncs payment details to backend
   └── POST /store/payment-collections/:id/payment-sessions/:session_id/razorpay
       └── Backend verifies active session and saves signature to session data

7. Customer completes Cart
   └── POST /store/carts/:id/complete
       └── Medusa executes cartCompletionWorkflow:
           ├── Calls authorizePayment() on RazorpayProviderService
           │   ├── Checks HMAC SHA256 signature
           │   └── Verifies payment details with Razorpay API
           ├── Decrements inventory / creates reservation
           ├── Converts Cart to Order (order_01...)
           └── Returns { type: "order", order: { ... } }

8. Merchant fulfills order
   └── Admin views order, clicks "Print Label" on custom shipping widget
   └── Admin clicks "Create Fulfillment" -> Stock deducted -> Order marked Shipped
```

---

# 3. Payment Systems & Deep Dive into Razorpay Module

## Medusa v2 Payment Architecture

In Medusa v2, payment processing is governed by the `@medusajs/medusa/payment` module:
1. **Payment Collection**: Holds the monetary balance required for a Cart or Order. A cart has one active payment collection.
2. **Payment Session**: Represents an attempt to pay using a specific provider (e.g., Razorpay) for a given amount and currency.
3. **Payment**: Created once the payment session is authorized. Holds the captured or authorized transaction.
4. **AbstractPaymentProvider**: The framework interface that payment modules must implement.

## Codebase Razorpay Provider Implementation

The custom Razorpay provider is located in `apps/backend/src/modules/razorpay`:
- **Module Registration (`index.ts`)**:
  ```ts
  import RazorpayProviderService from "./service"
  export const RAZORPAY_MODULE = "razorpay"
  export default {
    services: [RazorpayProviderService],
  }
  ```
- **Service Class (`service.ts`)**: Extends `AbstractPaymentProvider<RazorpayOptions>` with static identifier `razorpay`.
- **Configured in `medusa-config.ts`**:
  ```ts
  {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "./src/modules/razorpay",
          id: "razorpay", // creates provider id: "pp_razorpay_razorpay"
          options: {
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
            currency: process.env.RAZORPAY_CURRENCY || "INR",
            webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
          },
        },
      ],
    },
  }
  ```

---

## Smallest Unit Math (INR Paise Conversion)

Razorpay requires amounts to be passed in the smallest currency unit. For INR, 1 Rupee = 100 paise.

In `RazorpayProviderService`, the conversion is handled by:
```ts
private getSmallestUnitAmount(amount: unknown, currency: string): number {
  const fractionDigits = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits

  return Math.round(Number(amount) * 10 ** (fractionDigits ?? 2))
}
```

### Unit Handling Across the Lifecycle:
1. **When initiating payment (`initiatePayment`)**: Medusa passes `amount` in standard currency units (e.g., ₹85.00). The service converts this:
   $$\text{razorpayAmount} = 85 \times 10^2 = 8500\text{ paise}$$
   Razorpay order is created with `8500`.
2. **When storing session data**: The service stores `amount: order.amount` (8500 paise) in `session.data`.
3. **When authorizing payment (`authorizePayment`)**: Medusa v2 does not pass `amount` in `AuthorizePaymentInput`. The service reads `data.amount`, which is **already in paise (8500)**. It passes `amountAlreadyInSmallestUnit: true` to avoid catastrophic double-multiplication ($8500 \times 100 = 850,000$ paise)!

---

## Signature Verification & Fraud Prevention

When a customer pays via the Razorpay checkout modal, Razorpay issues three values to the frontend:
1. `razorpay_order_id`: The Razorpay order identifier (e.g. `order_OX123`).
2. `razorpay_payment_id`: The individual payment transaction (e.g. `pay_PZ456`).
3. `razorpay_signature`: An HMAC SHA256 cryptographic digest proving that Razorpay's servers authorized this specific payment.

### How the Backend Validates the Signature
In `service.ts`:
```ts
private hasValidSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", this.config.key_secret!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  const expected = Buffer.from(expectedSignature, "utf8")
  const received = Buffer.from(signature, "utf8")

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  )
}
```
- Uses **constant-time string comparison** (`crypto.timingSafeEqual`) to prevent timing attack vulnerabilities.
- If an attacker tampers with the payment ID, order ID, or tries to forge a signature, verification immediately rejects with `Invalid Razorpay payment signature`.

### Direct API Reconciliation Check
In addition to cryptographic signature validation, `verifyPaymentResponse` executes an outbound HTTPS request directly to Razorpay's servers:
```ts
const payment = await this.getClient().payments.fetch(data.razorpay_payment_id)
```
It asserts four strict checks:
1. `payment.order_id === data.razorpay_order_id` (Ensures the payment was not swapped from another order).
2. `Number(payment.amount) === amount` (Ensures the customer did not tamper with the cart total).
3. `payment.currency.toUpperCase() === currency` (Ensures currency integrity).
4. `payment.status === "captured" || payment.status === "authorized"`.

---

## Incomplete Payment Response Error Handling

In `RazorpayProviderService.authorizePayment()`, incoming session data is evaluated:
- If payment has not yet been attempted (neither `razorpay_payment_id` nor `razorpay_signature` is present), the service returns:
  ```ts
  return { status: "pending", data }
  ```
- If payment has been attempted (`hasAttemptedPayment` is true), but the payload is incomplete (e.g., missing `razorpay_signature` or `razorpay_order_id`), the service immediately routes to `verifyPaymentResponse()`. That method throws `MedusaError.Types.INVALID_DATA ("Razorpay payment response is incomplete.")`, which `authorizePayment()` catches and converts to:
  ```ts
  return {
    status: "error",
    data: { ...data, error: "Razorpay payment response is incomplete." },
  }
  ```
  This guarantees that partial, malformed, or tampered payment attempts fail safely rather than hanging indefinitely in "pending" status.

---

## The Custom Payment Session Bridge Route

Standard Medusa v2 expects payment sessions to receive authorization data during cart completion. Because Razorpay runs client-side via a popup modal, the frontend needs an authenticated endpoint to write the Razorpay success payload back into the session data before triggering completion.

This codebase provides that exact bridge in:
`apps/backend/src/api/store/payment-collections/[id]/payment-sessions/[session_id]/razorpay/route.ts`

```ts
POST /store/payment-collections/:id/payment-sessions/:session_id/razorpay
```

### Request Payload:
```json
{
  "razorpay_payment_id": "pay_OXi1234567890",
  "razorpay_order_id": "order_OXh9876543210",
  "razorpay_signature": "9a5b6c7d8e9f..."
}
```

### Route Execution Flow:
1. Validates input schema using Zod (`@medusajs/framework/zod`).
2. Resolves `IPaymentModuleService` (`Modules.PAYMENT`).
3. Fetches the payment session by ID and Payment Collection ID.
4. Asserts that `session.provider_id === "pp_razorpay_razorpay"`.
5. Asserts that the incoming `razorpay_order_id` matches the session's recorded order ID.
6. Calls `paymentModule.updatePaymentSession()` to store `{ ...sessionData, ...response.data }`.
7. Returns HTTP 200 with the updated session. The storefront then immediately triggers `POST /store/carts/:id/complete`.

---

## Webhook Processing & Reconciliation

If a customer closes their browser tab right after Razorpay accepts their UPI PIN, or experiences a network disconnection, Medusa's frontend completion might not execute.

The Razorpay module handles this via **Webhooks** in `getWebhookActionAndData`:
1. **Signature Verification**: Validates `x-razorpay-signature` against `RAZORPAY_WEBHOOK_SECRET` using `crypto.createHmac("sha256", secret)`.
2. **Supported Events**:
   - `payment.captured`: Returns `{ action: "captured", data: ... }`.
   - `payment.authorized`: Returns `{ action: "authorized", data: ... }`.
   - `payment.failed`: Returns `{ action: "failed", data: ... }`.
3. **Session Identification**: Reads `payment.entity.notes.session_id` (which was injected when `orders.create` was called in `initiatePayment`).
4. **Signature Bypass for Webhooks**: Marks `webhook_processed: true`, allowing authorization to succeed when synchronized by the webhook worker.

---

## Step-by-Step: Integrating New Payment Providers (Cash on Delivery / Stripe)

To add another payment provider (e.g., Cash on Delivery or PhonePe) to this backend, follow this exact blueprint:

### 1. Create Module Directory
Create `apps/backend/src/modules/cod/` containing:
- `index.ts`
- `service.ts`

### 2. Implement the Provider Service
In `apps/backend/src/modules/cod/service.ts`:
```ts
import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types"

type CodOptions = {
  fee?: number
}

class CodProviderService extends AbstractPaymentProvider<CodOptions> {
  static identifier = "cash-on-delivery"

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    return {
      id: `cod_${Date.now()}`,
      data: { status: "pending_cash_collection" },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return {
      status: "authorized",
      data: input.data,
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return {
      data: { ...input.data, status: "captured" },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: input.data }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return { status: "authorized" }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data }
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    return { action: "not_supported" }
  }
}

export default CodProviderService
```

### 3. Export Module
In `apps/backend/src/modules/cod/index.ts`:
```ts
import CodProviderService from "./service"
export default {
  services: [CodProviderService],
}
```

### 4. Register in `medusa-config.ts`
```ts
{
  resolve: "@medusajs/medusa/payment",
  options: {
    providers: [
      {
        resolve: "./src/modules/razorpay",
        id: "razorpay",
        options: { /* ... */ },
      },
      {
        resolve: "./src/modules/cod",
        id: "cash-on-delivery",
        options: { fee: 0 },
      },
    ],
  },
}
```

### 5. Enable in Region & Storefront
- In Admin: Go to **Settings > Regions > India > Edit Payment Providers** and check `cash-on-delivery`.
- In Storefront: Add `pp_cash-on-delivery_cash-on-delivery` to `apps/storefront/src/lib/constants.tsx`.

---

# 4. Refund Architecture & Customer Return Workflows

## Current Codebase Implementation of Refunds

Refunds are **fully implemented and operational** in this project's Razorpay module.

In `apps/backend/src/modules/razorpay/service.ts`:
```ts
async refundPayment(
  input: RefundPaymentInput
): Promise<RefundPaymentOutput> {
  const data = input.data as Record<string, any>
  const paymentId = data?.razorpay_payment_id || data?.id
  const refundAmount =
    input.amount === undefined
      ? undefined
      : this.getSmallestUnitAmount(
          input.amount,
          String(data.currency || this.config.currency || "INR")
        )

  if (!paymentId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "razorpay_payment_id is required to refund payment"
    )
  }

  try {
    const refundBody: Record<string, any> = { speed: "normal" }
    if (refundAmount !== undefined) {
      refundBody.amount = refundAmount
    }

    const refund = await this.getClient().payments.refund(paymentId, refundBody)

    return {
      data: {
        ...data,
        refund_id: refund.id,
        refund_status: refund.status,
      },
    }
  } catch (err: any) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to refund Razorpay payment: ${err?.message || err}`
    )
  }
}
```

---

## How Admin Triggers a Refund

### Operational Steps in Medusa Admin Dashboard:
1. Log in to the Admin Dashboard at `http://localhost:9000/app` (or production URL).
2. Click **Orders** in the sidebar. Select the order requiring a refund.
3. In the top right corner of the order screen, click `...` and choose **Create Refund** (or initiate an Order Return).
4. Enter the **Refund Amount**:
   - You can refund the full order value, or enter a custom amount (partial refund).
5. Select a **Reason** (e.g., `Customer Request`, `Damaged Goods`, `Defective Item`).
6. Click **Confirm Refund**.

### Internal Workflow Execution:
1. Medusa invokes `createOrderRefundWorkflow`.
2. The workflow identifies the payment provider associated with the order (`pp_razorpay_razorpay`).
3. Medusa calls `RazorpayProviderService.refundPayment(input)` passing the target payment data and refund amount.
4. The service converts the amount to paise and invokes Razorpay's API:
   `POST https://api.razorpay.com/v1/payments/:payment_id/refund`
5. Razorpay approves the transaction, creates a refund record (`rfnd_OXz12345`), and issues the funds back to the customer's payment source.
6. Medusa records the refund under the order's Payment timeline and updates the order's `payment_status` to `partially_refunded` or `refunded`.

---

## Razorpay API Refund Processing & TAT

### Turnaround Times (TAT)
- **Normal Refund (`speed: "normal"`)**:
  - **UPI Payments**: Usually credited within a few minutes to 24 hours.
  - **Debit/Credit Cards & NetBanking**: 5 to 7 banking days depending on the customer's issuing bank (SBI, HDFC, ICICI, etc.).
- **Instant Refund (`speed: "optimum"` / instant)**:
  - If enabled in your Razorpay Dashboard merchant settings, you can update `refundBody.speed = "optimum"`. Razorpay attempts an instant refund via IMPS/UPI rails within 60 seconds (requires a maintained Razorpay account balance).

---

## Full vs Partial Refunds

- **Full Refund**: If `input.amount` is undefined or equals the captured total, Razorpay refunds the full original payment amount.
- **Partial Refund**: If an order contains 3 items and 1 item is damaged (e.g., ₹250 refund on a ₹750 order), the merchant enters ₹250.
  - The service converts `250` $\rightarrow$ `25000` paise.
  - Razorpay issues ₹250 back to the customer.
  - Multiple partial refunds can be issued sequentially as long as the cumulative refund total does not exceed the captured amount.

---

## Building an End-to-End Automated Return & Restock Flow

For an automated customer return portal, follow this merchant-grade architecture:

```text
[ Customer Portal: "Request Return" ]
                 │
                 ▼
     [ Admin Reviews Return ]
        ├── Rejected -> Notify Customer
        └── Approved -> Issue Return Shipping Label
                 │
                 ▼
   [ Warehouse Receives Package ]
        ├── Quality Check: Pass
        └── Restock InventoryItem -> stocked_quantity increments (+1)
                 │
                 ▼
[ Trigger createOrderRefundWorkflow ]
                 │
                 ▼
   [ Razorpay Issues Refund ]
                 │
                 ▼
[ Customer Notified via Email / SMS ]
```

---

## Refund Webhook Events

Configure these webhook events in your Razorpay Dashboard (`Settings > Webhooks`):
- `refund.processed`: Confirms that the money has left Razorpay and has been credited to the customer's bank.
- `refund.failed`: Alerts the merchant if an instant refund failed (e.g., customer bank account closed or frozen).

---

# 5. Admin Customizations & White-Label Branding

## Brand Retitling Plugin (`brand-retitle`)

Configured in `apps/backend/medusa-config.ts` under `admin.vite`:
- **Code Transformation**: At Vite compilation time, intercepts and replaces all occurrences of:
  - `"Welcome to Medusa"` $\rightarrow$ `"Welcome to mphal"`
  - `"Medusa Admin"` $\rightarrow$ `"mphal Admin"`
  - `DEFAULT_TITLE = "Medusa"` $\rightarrow `DEFAULT_TITLE = "mphal"`
  - `"- Medusa"` $\rightarrow `"- mphal"`

## Client-Side DOM Sanitizer

Injects an active `MutationObserver` directly into the Admin HTML `<head>`. Any dynamically rendered DOM node containing "Medusa" is immediately re-rendered to "mphal" in real time without flashing.

## Custom Shipping Label Widget

Located in `apps/backend/src/admin/widgets/order-shipping-label.tsx`:
- Exported using `defineWidgetConfig({ zone: "order.details.before" })`.
- Implements an inline deterministic barcode generator (`generateBarcodeSvg`) using SHA-style bit-shifting to output pure, resolution-independent SVG elements.
- Embedded CSS `@page { size: 100mm 150mm; margin: 4mm; }` tailored for commercial thermal label printers.
- Includes full customer recipient block, highlighted telephone badge, sender address, shipping service tier, package itemization table, and safety caution footer.

## Admin Localization & i18n

Located in `apps/backend/src/admin/i18n/`:
- `json/en.json` customizes the administrative login screen:
  ```json
  {
    "login": {
      "title": "Welcome to mphal",
      "hint": "Sign in to access the account area"
    },
    "invite": {
      "title": "Welcome to mphal",
      "hint": "Create your account below",
      "successHint": "Get started with mphal Admin right away.",
      "successAction": "Start mphal Admin"
    }
  }
  ```

---

# 6. Cloud File Storage (Cloudflare R2 / S3)

## Provider Architecture

In `apps/backend/medusa-config.ts`, file storage is configured with `@medusajs/medusa/file-s3` pointing to **Cloudflare R2**:
```ts
{
  resolve: "@medusajs/medusa/file",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/file-s3",
        id: "s3",
        options: {
          file_url: process.env.CLOUDFLARE_R2_PUBLIC_URL,
          access_key_id: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
          secret_access_key: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
          region: process.env.CLOUDFLARE_R2_REGION || "auto",
          bucket: process.env.CLOUDFLARE_R2_BUCKET,
          endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
          additional_client_config: {
            forcePathStyle: true,
          },
        },
      },
    ],
  },
}
```

### Why Cloudflare R2?
1. **Zero Egress Fees**: Unlike AWS S3, downloading high-resolution product photos costs $0 in data transfer.
2. **S3 API Compatibility**: Seamlessly works with `@medusajs/medusa/file-s3` by enabling `forcePathStyle: true`.
3. **Global CDN**: Assets load with sub-50ms latency across India and internationally.

## Configuration & CORS Setup

The file `r2-cors-config.json` in the root repository defines the bucket's Cross-Origin Resource Sharing policy:
```json
[
  {
    "AllowedOrigins": [
      "http://localhost:9000",
      "http://localhost:8000",
      "https://*.shares.zrok.io",
      "https://mphal.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Apply this rule to your Cloudflare bucket using AWS CLI or Cloudflare Dashboard:
```bash
aws s3api put-bucket-cors \
  --bucket <CLOUDFLARE_R2_BUCKET> \
  --cors-configuration file://r2-cors-config.json \
  --endpoint-url <CLOUDFLARE_R2_ENDPOINT>
```

---

# 7. API Reference & Postman Test Collection

## Storefront API Endpoints

All storefront requests require the header:  
`x-publishable-api-key: pk_...`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/store/products` | Query published products with filtering by category, collection, or handle |
| `GET` | `/store/products/:id` | Fetch full details for a single product including variants and options |
| `GET` | `/store/collections` | List active marketing collections |
| `GET` | `/store/categories` | Fetch category taxonomy tree |
| `POST` | `/store/carts` | Create a new shopping cart |
| `GET` | `/store/carts/:id` | Retrieve cart contents, totals, and line items |
| `POST` | `/store/carts/:id/line-items` | Add a variant SKU to the cart |
| `POST` | `/store/carts/:id` | Update customer billing/shipping address |
| `POST` | `/store/carts/:id/shipping-methods` | Select shipping option |
| `POST` | `/store/payment-collections` | Initialize payment collection for cart |
| `POST` | `/store/payment-collections/:id/payment-sessions` | Create Razorpay session (`pp_razorpay_razorpay`) |
| `POST` | `/store/payment-collections/:id/payment-sessions/:session_id/razorpay` | **Custom route**: Bridge Razorpay payment signature to session data |
| `POST` | `/store/carts/:id/complete` | Authorize payment and convert cart into placed Order |
| `GET` | `/store/customers/me` | Fetch profile of authenticated customer |
| `POST` | `/auth/customer/emailpass` | Authenticate customer with email and password |

## Admin API Endpoints

All admin requests require:  
`Authorization: Bearer <ADMIN_JWT>`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/user/emailpass` | Login admin user to obtain JWT token |
| `GET` | `/admin/products` | List all catalog items (including drafts and proposed) |
| `POST` | `/admin/products` | Create a new product with options and variants |
| `POST` | `/admin/products/:id` | Update existing product details, pricing, or status |
| `GET` | `/admin/orders` | Query orders with status, customer, and payment filters |
| `GET` | `/admin/orders/:id` | Detailed view of single order, items, and shipping addresses |
| `POST` | `/admin/orders/:id/fulfillments` | Create fulfillment for order items |
| `POST` | `/admin/orders/:id/refund` | Trigger Razorpay refund workflow |
| `GET` | `/admin/inventory-items` | Inspect warehouse inventory levels and reservations |
| `POST` | `/admin/inventory-items/:id/location-levels` | Adjust stocked quantity at a location |
| `GET` | `/admin/sales-channels` | View and manage distribution channels |
| `GET` | `/admin/stock-locations` | Manage physical warehouse locations |

## Custom Routes

1. `POST /store/payment-collections/:id/payment-sessions/:session_id/razorpay` (`apps/backend/src/api/store/payment-collections/[id]/payment-sessions/[session_id]/razorpay/route.ts`).
2. `GET /store/custom` (Health / integration probe defined in `apps/backend/src/api/store/custom/route.ts`).
3. `GET /admin/custom` (Admin probe defined in `apps/backend/src/api/admin/custom/route.ts`).

## API Studio & Automated Postman Testing

Located in `apps/backend/api-studio/`:
- **`ecom-backend-tests.postman_collection.json`**: A comprehensive Postman test collection with 19 automated requests covering Authentication, Products, Collections, Carts, Customers, and Custom routes.
- **`ecom-backend-tests.environment.json`**: Pre-configured variables (`baseUrl`, `publishableApiKey`, `adminToken`, etc.).

### Running Automated API Tests:
```bash
npm install -g newman
newman run apps/backend/api-studio/ecom-backend-tests.postman_collection.json \
  -e apps/backend/api-studio/ecom-backend-tests.environment.json
```

---

# 8. Initial Data Seeding & Migration Workflows

The seed script is located at:  
`apps/backend/src/migration-scripts/initial-data-seed.ts`

## Initial Data Seed Script Breakdown

```text
                                [ initial_data_seed() ]
                                           │
  1. createSalesChannelsWorkflow           ▼
     Creates "Default Sales Channel"
                                           │
  2. createApiKeysWorkflow                 ▼
     Generates Publishable API Key ("Default Publishable API Key")
                                           │
  3. linkSalesChannelsToApiKeyWorkflow     ▼
     Binds Publishable Key <-> Default Sales Channel
                                           │
  4. createStoresWorkflow                  ▼
     Configures "Default Store" with default currency EUR, supported USD, INR
                                           │
  5. createRegionsWorkflow                 ▼
     Configures Region with supported payment provider ["pp_system_default"]
                                           │
  6. createTaxRegionsWorkflow              ▼
     Creates tax rules for countries (GB, DE, DK, SE, FR, ES, IT)
                                           │
  7. createStockLocationsWorkflow          ▼
     Creates "European Warehouse"
                                           │
  8. Fulfillment Module Link               ▼
     Links Stock Location to Fulfillment Provider ("manual_manual")
                                           │
  9. createFulfillmentSets                 ▼
     Creates Service Zones and Delivery Geo Zones
                                           │
 10. createShippingOptionsWorkflow         ▼
     Creates "Standard Shipping" and "Express Shipping" flat-rate options
                                           │
 11. linkSalesChannelsToStockLocationWorkflow ▼
     CRITICAL: Links Stock Location to Sales Channel so inventory can be resolved!
                                           │
 12. createProductCategoriesWorkflow       ▼
     Creates categories: "Shirts", "Sweatshirts", "Pants", "Merch"
                                           │
 13. createProductOptionsWorkflow          ▼
     Defines Option dimensions: Size (S, M, L, XL), Color (Black, White)
                                           │
 14. createProductsWorkflow                ▼
     Creates sample catalog items:
     - "mphal T-Shirt" (8 variants)
     - "mphal Sweatshirt" (4 variants)
     - "mphal Sweatpants" (4 variants)
     - "mphal Shorts" (4 variants)
                                           │
 15. createInventoryLevelsWorkflow         ▼
     Queries all inventory items and sets stocked_quantity: 1,000,000 at the location
```

### How to Run the Seed:
From the root repository:
```bash
pnpm backend:seed
```
Or directly from `apps/backend`:
```bash
pnpm exec medusa exec ./src/migration-scripts/initial-data-seed.ts
```

---

# 9. Environment Configuration Reference

## Backend Environment Variables Dictionary

All backend configurations are driven through `apps/backend/.env`:

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `9000` | Port on which the Medusa HTTP server listens |
| `NODE_ENV` | Yes | `development` or `production` | Node runtime mode |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host/db?sslmode=require` | PostgreSQL connection string (Neon in production) |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Redis instance for workflow queues and pub/sub |
| `JWT_SECRET` | **Yes** | Min 32 random characters | Signs admin and customer JWT authentication tokens |
| `COOKIE_SECRET`| **Yes** | Min 32 random characters | Signs administrative session cookies |
| `STORE_CORS` | **Yes** | `http://localhost:8000,https://mphal.com` | Allowed origins for storefront API access |
| `ADMIN_CORS` | **Yes** | `http://localhost:5173,http://localhost:9000` | Allowed origins for Admin dashboard |
| `AUTH_CORS` | **Yes** | `http://localhost:5173,http://localhost:9000` | Allowed origins for authentication routes |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_...` or `rzp_live_...` | Razorpay API Key ID (from Razorpay Dashboard) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay Secret String | Razorpay Secret used to sign HMAC digests |
| `RAZORPAY_CURRENCY` | Optional | `INR` | Default transaction currency for orders |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Secret string | Verifies authenticity of inbound webhooks |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Optional | Cloudflare R2 Access Key | S3 API client ID for file uploads |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Optional | Cloudflare R2 Secret | S3 API client secret for file uploads |
| `CLOUDFLARE_R2_BUCKET` | Optional | `mphal-assets` | Target bucket name |
| `CLOUDFLARE_R2_ENDPOINT` | Optional | `https://<account_id>.r2.cloudflarestorage.com` | S3-compatible API endpoint |
| `CLOUDFLARE_R2_PUBLIC_URL` | Optional | `https://assets.mphal.com` | Public CDN base URL for displaying images |
| `CLOUDFLARE_R2_REGION` | Optional | `auto` | R2 regional placement |

## Secret Generation Script

```bash
node -e "
console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'));
console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('base64'));
"
```

---

# 10. Deployment, DevOps & Production Runbook

## Local Development with zrok Tunneling

To test Razorpay webhooks or connect an external mobile app during local development, use `run.sh` in the root repository:

```bash
./run.sh
```

### What `run.sh` Does:
1. Launches a headless `zrok` public tunnel forwarding to `localhost:9000`.
2. Extracts the assigned public hostname (e.g. `xxn26pf57q5f.shares.zrok.io`).
3. Automatically updates `apps/backend/medusa-config.ts` Vite configuration `allowedHosts` with the dynamic domain.
4. Opens a dedicated terminal tab executing `pnpm backend:dev`.
5. Cleans up the tunnel on exit (`SIGINT`/`SIGTERM`).

---

## GCP Production Deployment Pipeline

The production architecture deploys to a Google Cloud Platform Compute Engine VM:
- **Server IP**: `34.122.111.166`
- **SSH User**: `nagarjunags2014`
- **Remote Project Directory**: `~/malnadProduct/apps/backend`
- **Managed Database**: Neon Serverless PostgreSQL with SSL
- **Local Redis**: Running on `localhost:6379` on the VM

### Why Local Docker Compilation?
Small cloud VMs often run out of RAM during `medusa build`. The script `deploy.sh` solves this:
1. Builds the backend locally inside a lightweight Linux container (`node:22-slim`).
2. Extracts native Linux binaries (`.medusa/server` and `node_modules`).
3. Uses `rsync` to efficiently synchronize the built files to the GCP VM.
4. Deploys `.env.production` as the active `.env`.
5. Executes `start.sh` on the VM to restart the process.

### Deploying to Production:
From your local Mac:
```bash
./deploy.sh
```

---

## Process Management & Health Monitoring

### Server Process Management on GCP:
```bash
ssh nagarjunags2014@34.122.111.166
cd ~/malnadProduct/apps/backend

# Live logs:
tail -f ~/medusa.log

# Check status:
ps -p $(cat backend.pid)

# Restart server:
bash start.sh

# Health check:
curl -I http://localhost:9000/health
```

---

# 11. Zero-to-Hero Project Re-creation Blueprint (Complete Source Code)

This section provides the **complete, copy-paste ready source code** for every file required to recreate the backend from scratch.

---

## Step 1: Workspace & Root Monorepo Files

### File: `/package.json`
```json
{
  "name": "ecom",
  "private": false,
  "packageManager": "pnpm@11.21.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "start": "turbo start",
    "lint": "turbo lint",
    "test": "turbo test",
    "backend:seed": "turbo seed --filter=@dtc/backend",
    "backend:dev": "turbo dev --filter=@dtc/backend",
    "storefront:dev": "turbo dev --filter=@dtc/storefront"
  },
  "pnpm": {
    "overrides": {
      "@types/react": "19.0.5",
      "@types/react-dom": "19.0.5"
    }
  },
  "devDependencies": {
    "@medusajs/eslint-plugin": "2.18.0",
    "ajv": "^8.13.0",
    "eslint": "^9.39.4",
    "jiti": "^2.7.0",
    "prettier": "^3.2.5",
    "turbo": "^2.0.14"
  },
  "workspaces": [
    "apps/**",
    "!apps/backend/.medusa/**"
  ],
  "overrides": {
    "eslint": {
      "ajv": "^6.12.4"
    },
    "@eslint/eslintrc": {
      "ajv": "^6.12.4"
    }
  }
}
```

### File: `/pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "!apps/backend/.medusa/**"
```

### File: `/turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": []
    },
    "seed": {
      "outputs": []
    }
  }
}
```

### File: `/eslint.config.ts`
```ts
import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"

export default defineConfig([...medusa.configs.recommended])
```

### File: `/.npmrc`
```text
auto-install-peers=true
```

---

## Step 2: Backend Core Configuration Files

### File: `/apps/backend/package.json`
```json
{
  "name": "@dtc/backend",
  "version": "0.0.1",
  "description": "A starter for Medusa projects.",
  "author": "Medusa (https://medusajs.com)",
  "license": "MIT",
  "keywords": [
    "sqlite",
    "postgres",
    "typescript",
    "ecommerce",
    "headless",
    "medusa"
  ],
  "scripts": {
    "build": "medusa build",
    "start": "medusa start",
    "dev": "medusa develop",
    "lint": "medusa lint",
    "seed": "medusa exec ./src/migration-scripts/initial-data-seed.ts",
    "test": "pnpm run test:unit",
    "test:integration:http": "TEST_TYPE=integration:http NODE_OPTIONS=--experimental-vm-modules jest --silent=false --runInBand --forceExit",
    "test:integration:modules": "TEST_TYPE=integration:modules NODE_OPTIONS=--experimental-vm-modules jest --silent=false --runInBand --forceExit",
    "test:unit": "TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules jest --silent --runInBand --forceExit"
  },
  "dependencies": {
    "@medusajs/admin-sdk": "2.18.0",
    "@medusajs/admin-shared": "2.18.0",
    "@medusajs/caching": "2.18.0",
    "@medusajs/cli": "2.18.0",
    "@medusajs/dashboard": "2.18.0",
    "@medusajs/draft-order": "2.18.0",
    "@medusajs/framework": "2.18.0",
    "@medusajs/medusa": "2.18.0",
    "@medusajs/ui": "4.2.0",
    "@tanstack/react-query": "5.64.2",
    "react-i18next": "13.5.0",
    "react-router-dom": "6.30.4",
    "zod": "4.2.0",
    "razorpay": "^2.9.8"
  },
  "devDependencies": {
    "@medusajs/test-utils": "2.18.0",
    "@swc/core": "^1.7.28",
    "@swc/jest": "^0.2.36",
    "@types/jest": "^29.5.13",
    "@types/node": "^20.12.11",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.2.25",
    "jest": "^29.7.0",
    "prop-types": "^15.8.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.2",
    "vite": "^5.4.14",
    "yalc": "^1.0.0-pre.53"
  },
  "engines": {
    "node": ">=20"
  },
  "packageManager": "npm@11.17.0"
}
```

### File: `/apps/backend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "esModuleInterop": true,
    "module": "Node16",
    "moduleResolution": "Node16",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "declaration": false,
    "sourceMap": false,
    "inlineSourceMap": true,
    "outDir": "./.medusa/server",
    "rootDir": "./",
    "jsx": "react-jsx",
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "checkJs": false,
    "strictNullChecks": true
  },
  "ts-node": {
    "swc": true
  },
  "include": [
    "**/*",
    ".medusa/types/*"
  ],
  "exclude": [
    "node_modules",
    ".medusa/server",
    ".medusa/admin",
    ".cache",
    "eslint.config.*",
    "**/__tests__/**",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### File: `/apps/backend/jest.config.js`
```js
const { loadEnv } = require("@medusajs/utils");
loadEnv("test", process.cwd());

module.exports = {
  transform: {
    "^.+\\.[jt]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/", "<rootDir>/.medusa/"],
  setupFiles: ["./integration-tests/setup.js"],
};

if (process.env.TEST_TYPE === "integration:http") {
  module.exports.testMatch = ["**/integration-tests/http/*.spec.[jt]s"];
} else if (process.env.TEST_TYPE === "integration:modules") {
  module.exports.testMatch = ["**/src/modules/*/__tests__/**/*.[jt]s"];
} else if (process.env.TEST_TYPE === "unit") {
  module.exports.testMatch = ["**/src/**/__tests__/**/*.unit.spec.[jt]s"];
}
```

### File: `/apps/backend/integration-tests/setup.js`
```js
const { MetadataStorage } = require("@medusajs/framework/mikro-orm/core")

MetadataStorage.clear()
```

### File: `/apps/backend/medusa-config.ts`
```ts
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,

    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },

  admin: {
    vite: () => {
      return {
        server: {
          allowedHosts: ["xxn26pf57q5f.shares.zrok.io"],
        },
        plugins: [
          {
            name: "brand-retitle",
            transform(code: string) {
              if (
                code.includes("- Medusa") ||
                code.includes('DEFAULT_TITLE = "Medusa"') ||
                code.includes("Welcome to Medusa") ||
                code.includes("Medusa Admin")
              ) {
                let updated = code
                  .replaceAll("Welcome to Medusa", "Welcome to mphal")
                  .replaceAll("Medusa Admin", "mphal Admin")
                  .replaceAll('DEFAULT_TITLE = "Medusa"', 'DEFAULT_TITLE = "mphal"')
                  .replaceAll("- Medusa", "- mphal")

                if (updated.includes("return `${pageTitle} - mphal`;")) {
                  updated = updated.replaceAll(
                    "return `${pageTitle} - mphal`;",
                    "return pageTitle.includes(\"mphal\") ? pageTitle : `${pageTitle} - mphal`;"
                  )
                }

                return {
                  code: updated,
                  map: null,
                }
              }
              return null
            },
            transformIndexHtml(html: string) {
              const replaced = html.replace(/<title>.*?<\/title>/, "<title>mphal</title>")
              const script = `<script>
  (() => {
    const sanitize = () => {
      if (document.title.includes("Medusa")) {
        document.title = document.title.replace(/Medusa/g, "mphal")
      }
      if (document.title.includes("Welcome to mphal - mphal")) {
        document.title = "Welcome to mphal"
      }
      const walker = document.createTreeWalker(
        document.body || document.documentElement,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.includes("Welcome to Medusa")) {
          node.nodeValue = node.nodeValue.replace(/Welcome to Medusa/g, "Welcome to mphal")
        }
        if (node.nodeValue && node.nodeValue.includes("Medusa Admin")) {
          node.nodeValue = node.nodeValue.replace(/Medusa Admin/g, "mphal Admin")
        }
      }
    }
    new MutationObserver(sanitize).observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
    })
    window.addEventListener("DOMContentLoaded", sanitize)
    sanitize()
  })()
</script>`
              return replaced.replace("</head>", `${script}</head>`)
            },
          },
        ],
      }
    },
  },

  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
              currency: process.env.RAZORPAY_CURRENCY || "INR",
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.CLOUDFLARE_R2_PUBLIC_URL,
              access_key_id: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
              secret_access_key: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
              region: process.env.CLOUDFLARE_R2_REGION || "auto",
              bucket: process.env.CLOUDFLARE_R2_BUCKET,
              endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
  ],
})
```

---

## Step 3: Custom Razorpay Payment Module

### File: `/apps/backend/src/modules/razorpay/index.ts`
```ts
import RazorpayProviderService from "./service"

export const RAZORPAY_MODULE = "razorpay"

// Payment providers registered under the payment module's `providers` array
// must export { services: [ServiceClass] } as their default — NOT a Module()
// definition. The moduleProviderLoader checks for `default.services.length`.
export default {
  services: [RazorpayProviderService],
}
```

### File: `/apps/backend/src/modules/razorpay/service.ts`
```ts
import Razorpay from "razorpay"
import crypto from "crypto"
import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { BigNumber, MedusaError, Modules } from "@medusajs/framework/utils"

type RazorpayOptions = {
  key_id?: string
  key_secret?: string
  currency?: string
  webhook_secret?: string
}

type RazorpayPaymentData = Record<string, unknown> & {
  id?: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  amount?: number
  currency?: string
  webhook_processed?: boolean
}

const hasPaymentResponse = (
  data: RazorpayPaymentData
): data is RazorpayPaymentData & {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
} =>
  typeof data.razorpay_order_id === "string" &&
  typeof data.razorpay_payment_id === "string" &&
  typeof data.razorpay_signature === "string"

class RazorpayProviderService extends AbstractPaymentProvider<RazorpayOptions> {
  static identifier = "razorpay"

  private client?: Razorpay

  constructor(
    container: Record<string, unknown>,
    options: RazorpayOptions
  ) {
    super(container, options)

    // Client is only initialised when keys are present.
    // If keys are missing, payment operations will throw at request time.
    if (options?.key_id && options?.key_secret) {
      this.client = new Razorpay({
        key_id: options.key_id,
        key_secret: options.key_secret,
      })
    }
  }

  static validateOptions(_options: Record<string, any>) {
    // Keys are validated lazily at request time so the module loads even when
    // env vars are not yet set (e.g. local dev without Razorpay credentials).
  }

  private getClient(): Razorpay {
    if (!this.client || !this.config.key_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
      )
    }

    return this.client
  }

  private getSmallestUnitAmount(amount: unknown, currency: string): number {
    const fractionDigits = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits

    return Math.round(Number(amount) * 10 ** (fractionDigits ?? 2))
  }

  private hasValidSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", this.config.key_secret!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")

    const expected = Buffer.from(expectedSignature, "utf8")
    const received = Buffer.from(signature, "utf8")

    return (
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received)
    )
  }

  private async verifyPaymentResponse(
    data: RazorpayPaymentData,
    expectedAmount: unknown,
    expectedCurrency: string,
    amountAlreadyInSmallestUnit: boolean = false
  ): Promise<"authorized" | "captured"> {
    if (!hasPaymentResponse(data)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay payment response is incomplete."
      )
    }

    const expectedOrderId = data.id || data.razorpay_order_id
    if (expectedOrderId !== data.razorpay_order_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay payment does not belong to this payment session."
      )
    }

    // Skip signature verification for webhook-processed payments
    if (!data.webhook_processed && 
      !this.hasValidSignature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature
      )
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Invalid Razorpay payment signature."
      )
    }

    const payment = await this.getClient().payments.fetch(
      data.razorpay_payment_id
    )
    const currency = expectedCurrency.toUpperCase()
    
    // Convert to smallest unit only if not already converted
    const amount = amountAlreadyInSmallestUnit 
      ? Number(expectedAmount)
      : this.getSmallestUnitAmount(expectedAmount, currency)

    if (payment.order_id !== data.razorpay_order_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay payment details do not match this payment (Order ID)."
      )
    }

    if (Number(payment.amount) !== amount) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Razorpay payment details do not match this payment session (amount). Expected: ${amount}, Got: ${payment.amount}`
      )
    }

    if (payment.currency.toUpperCase() !== currency) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay payment details do not match this payment session (currency)."
      )
    }

    if (payment.status === "captured") {
      return "captured"
    }

    if (payment.status === "authorized") {
      return "authorized"
    }

    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Razorpay payment is ${payment.status}, not authorized.`
    )
  }

  /**
   * Called when the customer selects Razorpay at checkout.
   * Creates a Razorpay order and stores the order details in the session data.
   */
  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context } = input
    const data = (input.data || {}) as RazorpayPaymentData
    const currency = (currency_code || this.config.currency || "INR").toUpperCase()

    if (hasPaymentResponse(data)) {
      const status = await this.verifyPaymentResponse(
        data, 
        data.amount, 
        currency,
        true
      )

      return {
        id: data.razorpay_order_id,
        status,
        data: {
          ...data,
          id: data.razorpay_order_id,
          key_id: this.config.key_id,
        },
      }
    }

    const razorpayAmount = this.getSmallestUnitAmount(amount, currency)
    const sessionId = String(
      data.session_id ||
      (context as Record<string, unknown> | undefined)?.id ||
      Date.now().toString()
    )

    try {
      const order = await this.getClient().orders.create({
        amount: razorpayAmount,
        [Modules.CURRENCY]: currency,
        receipt: `rcpt_${sessionId}`.slice(0, 40),
        payment_capture: true,
        notes: {
          session_id: sessionId,
        },
      }) as any

      return {
        id: order.id,
        data: {
          id: order.id,
          razorpay_order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          key_id: this.config.key_id,
        },
      }
    } catch (err: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to create Razorpay order: ${err?.message || err}`
      )
    }
  }

  /**
   * Called during cart completion to authorize the payment.
   * Verifies the HMAC signature from Razorpay to confirm payment authenticity.
   */
  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data = (input.data || {}) as RazorpayPaymentData

    const hasAttemptedPayment =
      typeof data.razorpay_payment_id === "string" ||
      typeof data.razorpay_signature === "string"

    // If we have signature data or an attempted payment response, verify it
    if (hasPaymentResponse(data) || hasAttemptedPayment) {
      const currency = String(data.currency || this.config.currency || "INR")

      try {
        const status = await this.verifyPaymentResponse(
          data,
          data.amount,
          currency,
          true
        )

        return {
          status,
          data: {
            ...data,
            id: data.razorpay_payment_id,
          },
        }
      } catch (error) {
        return {
          status: "error",
          data: {
            ...data,
            error: error instanceof Error ? error.message : String(error),
          },
        }
      }
    }

    // No payment data yet — payment is pending (customer has not paid yet)
    return {
      status: "pending",
      data,
    }
  }

  /**
   * Called when admin captures the payment or auto-capture fires.
   */
  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const data = input.data as Record<string, any>
    const paymentId = data?.razorpay_payment_id || data?.id

    if (!paymentId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "razorpay_payment_id is required to capture payment"
      )
    }

    try {
      const payment = await this.getClient().payments.fetch(paymentId)

      if (payment.status === "captured") {
        return { data: { ...data, status: "captured" } }
      }

      await this.getClient().payments.capture(
        paymentId,
        payment.amount as number,
        payment.currency
      )

      return {
        data: {
          ...data,
          id: paymentId,
          status: "captured",
        },
      }
    } catch (err: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to capture Razorpay payment: ${err?.message || err}`
      )
    }
  }

  /**
   * Called when admin refunds a payment.
   */
  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const data = input.data as Record<string, any>
    const paymentId = data?.razorpay_payment_id || data?.id
    const refundAmount =
      input.amount === undefined
        ? undefined
        : this.getSmallestUnitAmount(
            input.amount,
            String(data.currency || this.config.currency || "INR")
          )

    if (!paymentId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "razorpay_payment_id is required to refund payment"
      )
    }

    try {
      const refundBody: Record<string, any> = { speed: "normal" }
      if (refundAmount !== undefined) {
        refundBody.amount = refundAmount
      }

      const refund = await this.getClient().payments.refund(paymentId, refundBody)

      return {
        data: {
          ...data,
          refund_id: refund.id,
          refund_status: refund.status,
        },
      }
    } catch (err: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to refund Razorpay payment: ${err?.message || err}`
      )
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return { data: input.data as Record<string, any> }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: input.data as Record<string, any> }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const data = input.data as Record<string, any>
    const paymentId = data?.razorpay_payment_id || data?.id

    if (!paymentId) {
      return { data }
    }

    try {
      const payment = await this.getClient().payments.fetch(paymentId)
      return { data: { ...data, ...payment } }
    } catch {
      return { data }
    }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    const data = (input.data || {}) as RazorpayPaymentData

    if (hasPaymentResponse(data)) {
      await this.verifyPaymentResponse(
        data, 
        data.amount, 
        input.currency_code,
        true
      )

      return { data }
    }

    return this.initiatePayment(input as unknown as InitiatePaymentInput)
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const data = input.data as Record<string, any>

    if (!data?.razorpay_payment_id) {
      return { status: "pending" }
    }

    try {
      const payment = await this.getClient().payments.fetch(
        data.razorpay_payment_id
      )

      switch (payment.status) {
        case "captured":
          return { status: "captured" }
        case "authorized":
          return { status: "authorized" }
        case "failed":
          return { status: "error" }
        case "refunded":
          return { status: "canceled" }
        default:
          return { status: "pending" }
      }
    } catch {
      return { status: "pending" }
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload

    if (this.config.webhook_secret && rawData) {
      const razorpaySignature = (headers as Record<string, string>)?.["x-razorpay-signature"]
      if (razorpaySignature) {
        const expectedSignature = crypto
          .createHmac("sha256", this.config.webhook_secret)
          .update(Buffer.isBuffer(rawData) ? rawData : rawData)
          .digest("hex")

        if (expectedSignature !== razorpaySignature) {
          return {
            action: "failed",
            data: { session_id: "", amount: new BigNumber(0) },
          }
        }
      }
    }

    const event = data as Record<string, any>
    const eventType = event?.event

    const paymentEntity = event?.payload?.payment?.entity
    const sessionId = paymentEntity?.notes?.session_id || paymentEntity?.notes?.cart_id || ""
    const amount = paymentEntity?.amount
      ? new BigNumber(paymentEntity.amount / 100)
      : new BigNumber(0)

    const extractPaymentData = (paymentEntity: any) => {
      if (!paymentEntity) {
        return { session_id: sessionId, amount }
      }

      const paymentData = {
        session_id: sessionId,
        amount,
        razorpay_payment_id: paymentEntity.id,
        razorpay_order_id: paymentEntity.order_id,
        razorpay_signature: `webhook_${paymentEntity.id}`,
        status: paymentEntity.status,
        method: paymentEntity.method,
        currency: paymentEntity.currency,
        webhook_processed: true,
        webhook_event: eventType
      }

      return paymentData
    }

    switch (eventType) {
      case "payment.captured":
        return { action: "captured", data: extractPaymentData(paymentEntity) }
      case "payment.authorized":
        return { action: "authorized", data: extractPaymentData(paymentEntity) }
      case "payment.failed":
        return { action: "failed", data: extractPaymentData(paymentEntity) }
      default:
        return { action: "not_supported", data: { session_id: sessionId, amount } }
    }
  }
}

export default RazorpayProviderService
```

---

## Step 4: Custom API Endpoints

### File: `/apps/backend/src/api/store/payment-collections/[id]/payment-sessions/[session_id]/razorpay/route.ts`
```ts
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

const RazorpayPaymentResponse = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const response = RazorpayPaymentResponse.safeParse(req.body)

  if (!response.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid Razorpay payment response."
    )
  }

  const paymentModule = req.scope.resolve(
    Modules.PAYMENT
  ) as IPaymentModuleService
  const [paymentSession] = await paymentModule.listPaymentSessions({
    id: req.params.session_id,
    payment_collection_id: req.params.id,
  })

  if (!paymentSession) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Payment session was not found."
    )
  }

  if (paymentSession.provider_id !== "pp_razorpay_razorpay") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Payment session is not a Razorpay session."
    )
  }

  const sessionData = paymentSession.data as Record<string, unknown>
  const expectedOrderId = sessionData.razorpay_order_id || sessionData.id

  if (expectedOrderId !== response.data.razorpay_order_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Razorpay order does not match the active payment session."
    )
  }

  const updatedSession = await paymentModule.updatePaymentSession({
    id: paymentSession.id,
    amount: paymentSession.amount,
    currency_code: paymentSession.currency_code,
    data: {
      ...sessionData,
      ...response.data,
    },
  })

  res.status(200).json({ payment_session: updatedSession })
}
```

### File: `/apps/backend/src/api/store/custom/route.ts`
```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.sendStatus(200);
}
```

### File: `/apps/backend/src/api/admin/custom/route.ts`
```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.sendStatus(200);
}
```

---

## Step 5: Custom Admin Dashboard Extensions

### File: `/apps/backend/src/admin/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    ".",
    "../../.medusa/types/plugin-augmentations.d.ts"
  ]
}
```

### File: `/apps/backend/src/admin/vite-env.d.ts`
```ts
/// <reference types="vite/client" />
```

### File: `/apps/backend/src/admin/i18n/index.ts`
```ts
import en from "./json/en.json"

export default {
  en: {
    translation: en,
  },
}
```

### File: `/apps/backend/src/admin/i18n/json/en.json`
```json
{
  "login": {
    "title": "Welcome to mphal",
    "hint": "Sign in to access the account area"
  },
  "invite": {
    "title": "Welcome to mphal",
    "hint": "Create your account below",
    "successHint": "Get started with mphal Admin right away.",
    "successAction": "Start mphal Admin"
  }
}
```

### File: `/apps/backend/src/admin/widgets/order-shipping-label.tsx`
*(This is the custom 4"x6" delivery label widget exported into `zone: "order.details.before"` with pure vector barcode generation and customer telephone badges).*

```tsx
import type { DetailWidgetProps, AdminOrder } from "@medusajs/types"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge } from "@medusajs/ui"
import { useState } from "react"

const generateBarcodeSvg = (code: string): string => {
  const bars: number[] = []
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) % 1000000007
  }

  for (let i = 0; i < 45; i++) {
    const bit = (hash >> (i % 24)) & 1
    bars.push(bit ? 3 : 1.5)
    hash = (hash * 13 + i * 7) % 1000000007
  }

  let x = 10
  const rects = bars
    .map((w, idx) => {
      const isBlack = idx % 2 === 0
      const rect = isBlack
        ? `<rect x="${x}" y="0" width="${w}" height="45" fill="#000000" />`
        : ""
      x += w + 1
      return rect
    })
    .join("")

  return `<svg viewBox="0 0 ${x + 10} 45" width="100%" height="45" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`
}

const buildLabelHtml = (order: AdminOrder): string => {
  const address = order.shipping_address
  const customer = order.customer
  const recipientName =
    [address?.first_name, address?.last_name].filter(Boolean).join(" ") ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customer?.email ||
    "Customer"

  const phone = address?.phone || customer?.phone || "Not Provided"
  const company = address?.company ? `${address.company}` : ""
  const address1 = address?.address_1 || "Address not provided"
  const address2 = address?.address_2 || ""
  const cityStatePin = [
    address?.city,
    address?.province,
    address?.postal_code,
  ]
    .filter(Boolean)
    .join(", ")
  const country = address?.country_code?.toUpperCase() || "IN"

  const orderNumber = order.display_id ? `#${order.display_id}` : order.id
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN")

  const items = Array.isArray(order.items) ? order.items : []
  const totalItemCount = items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  )

  const itemsRows = items
    .map((item, index) => {
      const variantInfo = [item.variant_title, item.subtitle]
        .filter(Boolean)
        .join(" - ")
      return `
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px;">
        <td style="padding: 6px 8px; text-align: center; width: 24px;">${index + 1}</td>
        <td style="padding: 6px 8px;">
          <div style="font-weight: 600; color: #111827;">${item.title || "Product"}</div>
          ${variantInfo ? `<div style="color: #6b7280; font-size: 10px;">${variantInfo}</div>` : ""}
          ${item.variant_sku ? `<div style="color: #9ca3af; font-size: 9px;">SKU: ${item.variant_sku}</div>` : ""}
        </td>
        <td style="padding: 6px 8px; text-align: center; font-weight: 700; font-size: 12px; width: 40px;">
          ${item.quantity || 1}
        </td>
      </tr>
    `
    })
    .join("")

  const barcodeSvg = generateBarcodeSvg(String(order.display_id || order.id))

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Shipping Label - Order ${orderNumber}</title>
  <style>
    @page {
      size: 100mm 150mm;
      margin: 4mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.35;
    }
    .label-box {
      width: 100%;
      max-width: 96mm;
      margin: 0 auto;
      border: 2px solid #000000;
      background: #ffffff;
      padding: 0;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border-bottom: 2px solid #000000;
      background: #f9fafb;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      color: #000000;
    }
    .brand-sub {
      font-size: 9px;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .order-badge {
      text-align: right;
    }
    .order-number {
      font-size: 16px;
      font-weight: 800;
      color: #000000;
    }
    .order-date {
      font-size: 9px;
      color: #4b5563;
    }
    .barcode-section {
      padding: 8px 10px;
      text-align: center;
      border-bottom: 1px solid #000000;
      background: #ffffff;
    }
    .barcode-caption {
      font-size: 10px;
      letter-spacing: 2px;
      font-family: monospace;
      font-weight: 700;
      margin-top: 3px;
    }
    .address-section {
      padding: 10px;
      border-bottom: 2px solid #000000;
    }
    .section-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #4b5563;
      margin-bottom: 4px;
    }
    .recipient-name {
      font-size: 15px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 2px;
    }
    .phone-highlight {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      background: #fef08a;
      padding: 2px 6px;
      border-radius: 3px;
      margin: 4px 0 6px 0;
      border: 1px solid #eab308;
    }
    .address-lines {
      font-size: 12px;
      line-height: 1.4;
      color: #1f2937;
    }
    .dispatch-row {
      display: flex;
      border-bottom: 1px solid #000000;
      font-size: 10px;
    }
    .dispatch-from {
      flex: 1;
      padding: 8px 10px;
      border-right: 1px solid #000000;
      background: #f9fafb;
    }
    .dispatch-info {
      flex: 1;
      padding: 8px 10px;
      background: #ffffff;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 1px solid #000000;
    }
    .items-table th {
      background: #f3f4f6;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 8px;
      border-bottom: 1px solid #000000;
      text-align: left;
    }
    .footer-caution {
      padding: 6px 10px;
      text-align: center;
      background: #000000;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="label-box">
    <div class="header-row">
      <div>
        <div class="brand-title">mphal</div>
        <div class="brand-sub">Malnad Homemade Products</div>
      </div>
      <div class="order-badge">
        <div class="order-number">${orderNumber}</div>
        <div class="order-date">${orderDate}</div>
      </div>
    </div>

    <div class="barcode-section">
      ${barcodeSvg}
      <div class="barcode-caption">${order.display_id ? `ORD-${order.display_id}` : order.id}</div>
    </div>

    <div class="address-section">
      <div class="section-label">SHIP TO (DELIVERY ADDRESS)</div>
      <div class="recipient-name">${recipientName}</div>
      <div>
        <span class="phone-highlight">TEL: ${phone}</span>
      </div>
      <div class="address-lines">
        ${company ? `<div>${company}</div>` : ""}
        <div>${address1}</div>
        ${address2 ? `<div>${address2}</div>` : ""}
        <div><strong>${cityStatePin}</strong></div>
        <div>${country}</div>
      </div>
    </div>

    <div class="dispatch-row">
      <div class="dispatch-from">
        <div class="section-label" style="margin-bottom: 2px;">SHIP FROM:</div>
        <div style="font-weight: 700;">mphal</div>
        <div>Western Ghats Agro Hub</div>
        <div>Shivamogga, Karnataka - 577201</div>
        <div>Support: 8618333210</div>
      </div>
      <div class="dispatch-info">
        <div class="section-label" style="margin-bottom: 2px;">SHIPPING MODE:</div>
        <div style="font-weight: 700; font-size: 11px;">Surface Express</div>
        <div style="margin-top: 4px;"><strong>Prepaid Order</strong></div>
        <div style="color: #4b5563; font-size: 9px; margin-top: 2px;">Total Items: ${totalItemCount}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align: center; width: 24px;">#</th>
          <th>Item / Pack</th>
          <th style="text-align: center; width: 40px;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="footer-caution">
      FRAGILE - HOMEMADE FOOD PRODUCTS - HANDLE WITH CARE
    </div>
  </div>

  <script>
    window.addEventListener("load", () => {
      setTimeout(() => {
        window.print();
      }, 300);
    });
  </script>
</body>
</html>`
}

const OrderShippingLabelWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [showPreview, setShowPreview] = useState(false)
  const order = data

  const handlePrint = () => {
    const html = buildLabelHtml(order)
    const printWindow = window.open("", "_blank", "width=600,height=800")
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  const address = order.shipping_address
  const customer = order.customer
  const recipientName =
    [address?.first_name, address?.last_name].filter(Boolean).join(" ") ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    "Customer"
  const phone = address?.phone || customer?.phone || "Not Provided"

  return (
    <Container className="divide-y p-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-ui-bg-subtle">
        <div className="flex items-center gap-3">
          <Heading level="h2" className="text-sm font-semibold">
            Delivery Box Shipping Label
          </Heading>
          <Badge color="green" size="small">
            4" x 6" Thermal
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Preview Label"}
          </Button>
          <Button size="small" variant="primary" onClick={handlePrint}>
            Print Shipping Label
          </Button>
        </div>
      </div>

      <div className="px-6 py-3 text-xs text-ui-fg-muted flex flex-wrap gap-4 items-center">
        <div>
          <span className="font-medium text-ui-fg-base">Recipient:</span>{" "}
          {recipientName}
        </div>
        <div>
          <span className="font-medium text-ui-fg-base">Phone:</span>{" "}
          <span className="font-semibold text-ui-fg-interactive">{phone}</span>
        </div>
        <div>
          <span className="font-medium text-ui-fg-base">Destination:</span>{" "}
          {[address?.city, address?.province, address?.postal_code]
            .filter(Boolean)
            .join(", ") || "N/A"}
        </div>
        <div>
          <span className="font-medium text-ui-fg-base">Items:</span>{" "}
          {order.items?.length || 0} line item(s)
        </div>
      </div>

      {showPreview && (
        <div className="p-6 bg-ui-bg-base flex justify-center">
          <iframe
            srcDoc={buildLabelHtml(order)}
            title="Shipping Label Preview"
            style={{
              width: "100%",
              maxWidth: "420px",
              height: "620px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderShippingLabelWidget
```

---

## Step 6: Data Seeding Script

### File: `/apps/backend/src/migration-scripts/initial-data-seed.ts`
*(Populates Sales Channels, Publishable API Keys, Currencies, Tax Regions, Stock Locations, Fulfillment Sets, Shipping Options, and sample catalog items).*

```ts
import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by mphal",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Default Store",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  const {
    result: [shippingProfile],
  } = await createShippingProfilesWorkflow(container).run({
    input: {
      data: [
        {
          name: "Default Shipping Profile",
          type: "default",
        },
      ],
    },
  });

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: countries.map((country_code) => ({
          country_code,
          type: "country",
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          { currency_code: "usd", amount: 10 },
          { currency_code: "eur", amount: 10 },
          { region_id: region.id, amount: 10 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          { currency_code: "usd", amount: 15 },
          { currency_code: "eur", amount: 15 },
          { region_id: region.id, amount: 15 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });

  logger.info("Seeding product data...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Shirts", is_active: true },
        { name: "Sweatshirts", is_active: true },
        { name: "Pants", is_active: true },
        { name: "Merch", is_active: true },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "mphal T-Shirt",
          category_ids: [categoryResult.find((c) => c.name === "Shirts")!.id],
          description: "A comfortable organic cotton t-shirt with mphal branding.",
          handle: "t-shirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Size", values: ["S", "M", "L", "XL"] },
            { title: "Color", values: ["Black", "White"] },
          ],
          variants: [
            {
              title: "S / Black",
              sku: "SHIRT-S-BLACK",
              options: { Size: "S", Color: "Black" },
              prices: [
                { amount: 10, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  });

  logger.info("Seeding inventory levels.");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });
  logger.info("Finished seeding inventory levels data.");
}
```

---

## Step 7: Testing Suites

### File: `/apps/backend/src/modules/razorpay/__tests__/preservation.unit.spec.ts`
```ts
import { BigNumber } from "@medusajs/framework/utils"
import RazorpayProviderService from "../service"

describe("Razorpay Preservation Tests", () => {
  let razorpayService: RazorpayProviderService
  
  const mockOptions = {
    key_id: "rzp_test_123",
    key_secret: "test_secret_123", 
    webhook_secret: "webhook_secret_123",
    currency: "INR"
  }

  beforeEach(() => {
    razorpayService = new RazorpayProviderService({}, mockOptions)
  })

  describe("Property 2: Preservation - Non-Webhook Payment Flow Behavior", () => {
    describe("Direct Frontend Payment Submissions", () => {
      test("should continue to authorize payments with complete frontend data", async () => {
        const completePaymentData = {
          id: "order_123",
          razorpay_order_id: "order_123", 
          razorpay_payment_id: "pay_456",
          razorpay_signature: "valid_signature_123",
          amount: 100000,
          currency: "INR"
        }

        const mockClient = {
          payments: {
            fetch: jest.fn().mockResolvedValue({
              id: "pay_456",
              order_id: "order_123",
              amount: 100000,
              currency: "INR", 
              status: "captured"
            })
          }
        }
        
        jest.spyOn(razorpayService as any, 'getClient').mockReturnValue(mockClient)
        jest.spyOn(razorpayService as any, 'hasValidSignature').mockReturnValue(true)

        const result = await razorpayService.authorizePayment({
          data: completePaymentData,
          context: {}
        })

        expect(result.status).toBe("captured")
        expect(result.data.id).toBe("pay_456") 
        expect(mockClient.payments.fetch).toHaveBeenCalledWith("pay_456")
      })

      test("should handle pending payments correctly (no payment response data)", async () => {
        const pendingPaymentData = {
          id: "order_789",
          razorpay_order_id: "order_789",
          amount: 50000,
          currency: "INR"
        }

        const result = await razorpayService.authorizePayment({
          data: pendingPaymentData,
          context: {}
        })

        expect(result.status).toBe("pending")
        expect(result.data).toEqual(pendingPaymentData)
      })
    })

    describe("Webhook Reception Behavior", () => {
      test("should continue returning 200 responses for webhook processing", async () => {
        const webhookPayload = {
          data: {
            event: "payment.captured",
            payload: {
              payment: {
                entity: {
                  id: "pay_webhook_test",
                  order_id: "order_webhook_test", 
                  amount: 75000,
                  currency: "INR",
                  status: "captured",
                  notes: {
                    session_id: "payses_webhook_test"
                  }
                }
              }
            }
          },
          rawData: Buffer.from("test"),
          headers: {}
        }

        const result = await razorpayService.getWebhookActionAndData(webhookPayload)
        
        expect(result.action).toBe("captured")
        expect(result.data.session_id).toBe("payses_webhook_test")
        expect(result.data.amount).toEqual(new BigNumber(750))
      })

      test("should handle unsupported webhook events correctly", async () => {
        const unsupportedWebhookPayload = {
          data: {
            event: "order.paid",
            payload: {
              order: {
                entity: {
                  id: "order_unsupported_test",
                  amount: 25000,
                  currency: "INR"
                }
              }
            }
          },
          rawData: Buffer.from("test"),
          headers: {}
        }

        const result = await razorpayService.getWebhookActionAndData(unsupportedWebhookPayload)
        
        expect(result.action).toBe("not_supported")
      })
    })

    describe("Signature Verification Logic", () => {
      test("should preserve signature verification for direct payments", () => {
        const orderId = "order_signature_test"
        const paymentId = "pay_signature_test" 

        const crypto = require("crypto")
        const expectedSignature = crypto
          .createHmac("sha256", mockOptions.key_secret)
          .update(`${orderId}|${paymentId}`)
          .digest("hex")

        const hasValidSignature = (razorpayService as any).hasValidSignature(
          orderId, 
          paymentId,
          expectedSignature
        )
        
        expect(hasValidSignature).toBe(true)
        
        const invalidResult = (razorpayService as any).hasValidSignature(
          orderId,
          paymentId, 
          "invalid_signature"
        )
        
        expect(invalidResult).toBe(false)
      })
    })

    describe("Payment Session Data Structure", () => {
      test("should preserve payment session data format for non-webhook operations", async () => {
        const mockClient = {
          orders: {
            create: jest.fn().mockResolvedValue({
              id: "order_init_test",
              amount: 100000,
              currency: "INR",
              receipt: "rcpt_init_test", 
              status: "created"
            })
          }
        }
        
        jest.spyOn(razorpayService as any, 'getClient').mockReturnValue(mockClient)

        const result = await razorpayService.initiatePayment({
          amount: 1000,
          currency_code: "INR", 
          context: { id: "session_init_test" },
          data: {}
        })

        expect(result.id).toBe("order_init_test")
        expect(result.data).toMatchObject({
          id: "order_init_test",
          razorpay_order_id: "order_init_test",
          amount: 100000,
          currency: "INR",
          key_id: mockOptions.key_id
        })
      })
    })

    describe("Error Handling Preservation", () => {
      test("should preserve error handling for invalid payment data", async () => {
        const incompleteData = {
          razorpay_order_id: "order_error_test",
          razorpay_payment_id: "pay_error_test"
        }

        const result = await razorpayService.authorizePayment({
          data: incompleteData,
          context: {}
        })

        expect(result.status).toBe("error")
        expect(result.data.error).toContain("Razorpay payment response is incomplete")
      })
    })
  })
})
```

### File: `/apps/backend/src/modules/razorpay/__tests__/webhook-session-sync.unit.spec.ts`
```ts
import { BigNumber } from "@medusajs/framework/utils"
import RazorpayProviderService from "../service"

describe("Razorpay Webhook Payment Session Synchronization", () => {
  let razorpayService: RazorpayProviderService
  
  const mockOptions = {
    key_id: "rzp_test_123",
    key_secret: "test_secret_123",
    webhook_secret: "webhook_secret_123",
    currency: "INR"
  }

  beforeEach(() => {
    razorpayService = new RazorpayProviderService({}, mockOptions)
  })

  describe("Property 1: Bug Condition - Webhook Payment Session Synchronization", () => {
    test("should extract complete payment data from payment.captured webhook", async () => {
      const webhookPayload = {
        data: {
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: "pay_29QQoUBi66xm2f",
                order_id: "order_DbJOWfscnM25g1", 
                amount: 100000,
                currency: "INR",
                status: "captured",
                notes: {
                  session_id: "payses_01M0ZBXMNVWMXWDFGCCWHAE17K"
                }
              }
            }
          }
        },
        rawData: Buffer.from("test"),
        headers: {}
      }

      const result = await razorpayService.getWebhookActionAndData(webhookPayload)
      
      expect(result.action).toBe("captured")
      expect(result.data.session_id).toBe("payses_01M0ZBXMNVWMXWDFGCCWHAE17K")
      expect(result.data.amount).toEqual(new BigNumber(1000))
      
      expect(result.data).toHaveProperty("razorpay_payment_id", "pay_29QQoUBi66xm2f")
      expect(result.data).toHaveProperty("razorpay_order_id", "order_DbJOWfscnM25g1")
      expect(result.data).toHaveProperty("razorpay_signature")
      
      const mockSessionData = {
        id: "order_DbJOWfscnM25g1",
        razorpay_order_id: "order_DbJOWfscnM25g1",
        amount: 100000,
        currency: "INR",
        ...result.data
      }
      
      expect(mockSessionData).toHaveProperty("razorpay_payment_id", "pay_29QQoUBi66xm2f")
      expect(mockSessionData).toHaveProperty("razorpay_order_id", "order_DbJOWfscnM25g1") 
      expect(mockSessionData).toHaveProperty("razorpay_signature")
      
      const hasCompletePaymentResponse = 
        typeof mockSessionData.razorpay_order_id === "string" &&
        typeof mockSessionData.razorpay_payment_id === "string" &&  
        typeof mockSessionData.razorpay_signature === "string"
        
      expect(hasCompletePaymentResponse).toBe(true)
    })

    test("should extract complete payment data from payment.authorized webhook", async () => {
      const webhookPayload = {
        data: {
          event: "payment.authorized",
          payload: {
            payment: {
              entity: {
                id: "pay_29QQoUBi66xm2f",
                order_id: "order_DbJOWfscnM25g1",
                amount: 50000,
                currency: "INR",
                status: "authorized",
                notes: {
                  session_id: "payses_01M0ZBXMNVWMXWDFGCCWHAE17K"
                }
              }
            }
          }
        },
        rawData: Buffer.from("test"),
        headers: {}
      }

      const result = await razorpayService.getWebhookActionAndData(webhookPayload)
      
      expect(result.action).toBe("authorized")
      expect(result.data.session_id).toBe("payses_01M0ZBXMNVWMXWDFGCCWHAE17K")
      expect(result.data.amount).toEqual(new BigNumber(500))
      
      expect(result.data).toHaveProperty("razorpay_payment_id", "pay_29QQoUBi66xm2f")
      expect(result.data).toHaveProperty("razorpay_order_id", "order_DbJOWfscnM25g1")
      expect(result.data).toHaveProperty("razorpay_signature")
    })
  })
})
```

---

## Step 8: Execution, Build & Verification Commands

To build and run the recreated project:

```bash
# 1. Install all dependencies across workspace
pnpm install

# 2. Run unit tests to confirm Razorpay module works 100%
pnpm run test

# 3. Check Medusa ESLint compliance
pnpm run lint

# 4. Run database migrations (Ensure DATABASE_URL is set in apps/backend/.env)
cd apps/backend
pnpm exec medusa db:migrate

# 5. Create merchant administrative user
pnpm exec medusa user -e admin@mphal.com -p SuperSecretPassword123

# 6. Seed initial store catalog, locations, and options
cd ../..
pnpm backend:seed

# 7. Start the backend development server
pnpm backend:dev
# Access Admin Dashboard at http://localhost:9000/app
```

---
*Document Version: 2.0.0 — Authoritative Guide for `mphal` Backend Architecture*
