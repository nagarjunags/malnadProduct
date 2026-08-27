# Requirements Document

## Introduction

This feature fixes and completes the Razorpay payment integration in the Medusa 2.x monorepo. The current scaffold is broken in two ways: the backend has a plain class registered as a plugin instead of a proper `AbstractPaymentProvider` module, and the frontend bypasses Medusa's payment collection flow entirely, calling non-existent custom API routes. The fix brings the integration into conformance with Medusa 2.x conventions: a proper payment provider module on the backend, HMAC signature verification, and a storefront that uses `initiatePaymentSession` / `updatePaymentSession` / `placeOrder` in the correct sequence.

## Glossary

- **RazorpayModule**: The custom Medusa module located at `apps/backend/src/modules/razorpay-payment/`, consisting of `service.ts` and `index.ts`.
- **RazorpayService**: The TypeScript class in `service.ts` that extends `AbstractPaymentProvider` and implements all required payment lifecycle methods.
- **AbstractPaymentProvider**: The base class from `@medusajs/framework/utils` that all Medusa 2.x payment providers must extend.
- **PaymentSession**: A Medusa object representing a pending payment attempt, containing a `data` field for provider-specific state (e.g., `razorpay_order_id`).
- **HMAC Verification**: Cryptographic verification of the Razorpay callback signature using `crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)` over `razorpay_order_id + "|" + razorpay_payment_id`.
- **RazorpayCheckoutModal**: The Razorpay-hosted payment modal launched via the `window.Razorpay` constructor loaded from `https://checkout.razorpay.com/v1/checkout.js`.
- **PaymentButton**: The storefront component at `src/modules/checkout/components/payment-button/index.tsx` that renders the "Place order" button for the active payment provider.
- **Payment**: The storefront component at `src/modules/checkout/components/payment/index.tsx` that renders the payment method selection step.
- **PaymentContainer**: The `RadioGroupOption`-based component used to render each selectable payment method option inside the `RadioGroup`.
- **Provider ID**: The string identifier Medusa uses to address a payment provider, e.g. `pp_razorpay_razorpay`.
- **`initiatePaymentSession`**: Storefront server action that calls `sdk.store.payment.initiatePaymentSession`, triggering `RazorpayService.initiatePayment` on the backend.
- **`updatePaymentSession`**: Storefront server action (to be added) that calls `sdk.store.payment.updatePaymentSession`, storing Razorpay callback data in the session's `data` field.
- **`placeOrder`**: Storefront server action that calls `sdk.store.cart.complete`, triggering Medusa's authorize flow and ultimately `RazorpayService.authorizePayment`.

---

## Requirements

### Requirement 1: Backend — RazorpayModule structure

**User Story:** As a backend developer, I want the Razorpay provider to be structured as a proper Medusa 2.x payment module, so that Medusa can discover and manage its lifecycle correctly.

#### Acceptance Criteria

1. THE RazorpayModule SHALL be located at `apps/backend/src/modules/razorpay-payment/` with two files: `service.ts` and `index.ts`.
2. THE RazorpayService SHALL extend `AbstractPaymentProvider` imported from `@medusajs/framework/utils`.
3. THE `index.ts` file SHALL export a module definition using `Module("razorpay-payment", { service: RazorpayService })` from `@medusajs/framework/utils`.
4. THE `apps/backend/src/plugins/razorpay/razorpay-provider.ts` file SHALL be deleted once the module is created.
5. WHEN the backend starts, THE Medusa runtime SHALL load `RazorpayModule` without errors.

---

### Requirement 2: Backend — medusa-config.ts registration

**User Story:** As a backend developer, I want Razorpay to be registered correctly in `medusa-config.ts`, so that Medusa's payment module recognises it as an available provider.

#### Acceptance Criteria

1. THE `medusa-config.ts` file SHALL register `RazorpayModule` under the `modules` array using a `resolve` field pointing to `"./src/modules/razorpay-payment"`, conditional on `USE_RAZORPAY === "true"`.
2. THE `medusa-config.ts` file SHALL list `pp_razorpay_razorpay` (or the provider ID produced by the module identifier) as a provider under the `Modules.PAYMENT` module configuration.
3. THE `plugins` array in `medusa-config.ts` SHALL NOT contain any Razorpay entry after the migration.
4. WHEN `USE_RAZORPAY` is not set or is `"false"`, THE `medusa-config.ts` SHALL load without the Razorpay module, leaving the rest of the configuration unaffected.

---

### Requirement 3: Backend — RazorpayService payment lifecycle methods

**User Story:** As a backend developer, I want `RazorpayService` to implement all required `AbstractPaymentProvider` methods, so that Medusa can drive the full payment lifecycle through the provider.

#### Acceptance Criteria

1. THE RazorpayService SHALL implement `initiatePayment(context)`, which creates a Razorpay order via the `razorpay` SDK, stores `razorpay_order_id` and `razorpay_key_id` in the returned `data` object, and returns `{ data, status: "pending" }`.
2. THE RazorpayService SHALL implement `authorizePayment(paymentSession, context)`, which reads `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` from `paymentSession.data`, performs HMAC verification, and returns `{ data, status: "authorized" }` on success or `{ data, status: "error" }` on failure.
3. THE RazorpayService SHALL implement `capturePayment(paymentSession)`, which calls `razorpay.payments.capture` and returns `{ data, status: "captured" }`.
4. THE RazorpayService SHALL implement `refundPayment(paymentSession, refundAmount)`, which calls `razorpay.payments.refund` and returns the updated `data` object.
5. THE RazorpayService SHALL implement `cancelPayment(paymentSession)`, which returns `{ data: paymentSession.data, status: "canceled" }` (Razorpay orders cannot be explicitly cancelled via API; the status reflects this).
6. THE RazorpayService SHALL implement `retrievePayment(paymentSession)`, which returns the current `paymentSession.data`.
7. THE RazorpayService SHALL implement `getPaymentStatus(paymentSession)`, which maps the provider-side Razorpay order status to a Medusa payment status string.
8. THE RazorpayService SHALL implement `deletePayment(paymentSession)`, which is a no-op and returns `paymentSession.data`.
9. WHEN `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` environment variables are missing, THE RazorpayService constructor SHALL throw an error at startup rather than failing silently at runtime.

---

### Requirement 4: Backend — HMAC signature verification

**User Story:** As a backend developer, I want Razorpay payment callbacks to be cryptographically verified, so that only genuine Razorpay payments are authorised.

#### Acceptance Criteria

1. WHEN `authorizePayment` is called, THE RazorpayService SHALL compute an HMAC-SHA256 digest using `RAZORPAY_KEY_SECRET` over the string `razorpay_order_id + "|" + razorpay_payment_id`.
2. WHEN the computed digest matches `razorpay_signature` from the payment session data, THE RazorpayService SHALL return `status: "authorized"`.
3. WHEN the computed digest does not match `razorpay_signature`, THE RazorpayService SHALL return `status: "error"` and include a descriptive error message in the returned `data`.
4. THE HMAC verification SHALL use Node.js `crypto.createHmac("sha256", secret)` and compare digests using a constant-time comparison to prevent timing attacks.

---

### Requirement 5: Backend — environment variables

**User Story:** As a developer setting up the project, I want all required Razorpay environment variables documented in `.env.template`, so that I know exactly what to configure.

#### Acceptance Criteria

1. THE `apps/backend/.env.template` file SHALL include entries for `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_CURRENCY`, and `USE_RAZORPAY`.
2. Each entry SHALL have a comment explaining its purpose and expected format.
3. THE `RAZORPAY_CURRENCY` entry SHALL default to `INR` in the template comment.
4. THE `USE_RAZORPAY` entry SHALL default to `false` in the template comment.

---

### Requirement 6: Frontend — `isRazorpay` helper and `paymentInfoMap` entry

**User Story:** As a frontend developer, I want a dedicated `isRazorpay` helper in `src/lib/constants.tsx`, so that payment method detection is consistent and not scattered across components.

#### Acceptance Criteria

1. THE `src/lib/constants.tsx` file SHALL export an `isRazorpay` function with the signature `(providerId?: string) => boolean` that returns `true` when `providerId` starts with `"pp_razorpay"`.
2. THE `paymentInfoMap` in `src/lib/constants.tsx` SHALL contain an entry for `"pp_razorpay_razorpay"` with `title: "Razorpay"` and an appropriate icon.
3. THE duplicate and bare-string `"razorpay"` key in `paymentInfoMap` SHALL be removed.

---

### Requirement 7: Frontend — Payment method selection UI

**User Story:** As a customer, I want to see Razorpay as a selectable payment option in the same RadioGroup as other methods, so that the checkout UX is consistent.

#### Acceptance Criteria

1. WHEN Razorpay is an available payment method, THE Payment component SHALL render it using `PaymentContainer` inside the `RadioGroup`, with `paymentProviderId` set to the Razorpay provider ID.
2. THE `RazorpayButton` standalone component (`razorpay-button.tsx`) SHALL be deleted; its logic SHALL be absorbed into `payment-button/index.tsx`.
3. WHEN the user selects Razorpay as the payment method, THE Payment component SHALL call `initiatePaymentSession(cart, { provider_id: selectedPaymentMethod })` — the same path used for other non-Stripe providers.
4. THE Payment component's `handleSubmit` function SHALL NOT open the Razorpay checkout modal directly; modal opening is the responsibility of `PaymentButton`.
5. WHEN Razorpay is the active session provider, THE Payment component summary view SHALL display `paymentInfoMap["pp_razorpay_razorpay"].title` as the payment method name.

---

### Requirement 8: Frontend — `updatePaymentSession` server action

**User Story:** As a frontend developer, I want a `updatePaymentSession` server action available in `@lib/data/cart`, so that Razorpay callback data can be stored back in the payment session before `placeOrder` is called.

#### Acceptance Criteria

1. THE `apps/storefront/src/lib/data/cart.ts` file SHALL export an `updatePaymentSession` async server action that accepts `cartId: string`, `sessionId: string`, and `data: Record<string, unknown>`.
2. THE `updatePaymentSession` action SHALL call `sdk.store.payment.updatePaymentSession(cartId, sessionId, { data }, {}, headers)`.
3. WHEN the call succeeds, THE `updatePaymentSession` action SHALL revalidate the cart cache tag.
4. IF the call fails, THE `updatePaymentSession` action SHALL propagate the error via `medusaError`.

---

### Requirement 9: Frontend — `PaymentButton` Razorpay case

**User Story:** As a customer, I want clicking "Place order" when Razorpay is selected to open the Razorpay checkout modal and complete the payment, so that the order is placed without leaving the storefront.

#### Acceptance Criteria

1. THE `PaymentButton` component SHALL add a `case isRazorpay(paymentSession?.provider_id)` branch that renders a `RazorpayPaymentButton` sub-component.
2. THE `RazorpayPaymentButton` SHALL load the Razorpay checkout script from `https://checkout.razorpay.com/v1/checkout.js` if it is not already present on `window`.
3. WHEN the "Place order" button is clicked, THE `RazorpayPaymentButton` SHALL open the `RazorpayCheckoutModal` using `razorpay_order_id` and `razorpay_key_id` from the active payment session's `data` field.
4. WHEN the Razorpay modal fires its `handler` callback with `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`, THE `RazorpayPaymentButton` SHALL call `updatePaymentSession` to store those three values in the payment session's `data`.
5. WHEN `updatePaymentSession` resolves successfully, THE `RazorpayPaymentButton` SHALL call `placeOrder()`, which triggers `authorizePayment` on the backend.
6. IF Razorpay script loading fails, THE `RazorpayPaymentButton` SHALL display an error message to the user and not proceed to `placeOrder`.
7. IF `updatePaymentSession` or `placeOrder` throws, THE `RazorpayPaymentButton` SHALL display the error message and set `isLoading` to `false`.
8. THE `loadRazorpayScript` helper SHALL be defined once in `src/lib/util/razorpay.ts` and imported by `RazorpayPaymentButton`, removing the duplicates in `payment/index.tsx` and `razorpay-button.tsx`.

---

### Requirement 10: Frontend — environment variable documentation

**User Story:** As a developer setting up the storefront, I want `NEXT_PUBLIC_RAZORPAY_KEY_ID` documented in the storefront environment template, so that I know it is required.

#### Acceptance Criteria

1. THE storefront's environment variable documentation (e.g. `check-env-variables.js` or equivalent) SHALL reference `NEXT_PUBLIC_RAZORPAY_KEY_ID` as an optional variable used when Razorpay is enabled.
2. THE `NEXT_PUBLIC_RAZORPAY_KEY_ID` variable SHALL be used as a fallback key when `razorpay_key_id` is not present in the payment session `data`, ensuring the Razorpay modal can still be initialised.
