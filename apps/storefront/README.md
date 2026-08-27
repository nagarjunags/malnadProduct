# Storefront

This storefront includes optional Razorpay integration.

Frontend setup:

- Ensure backend exposes:
  - `POST /payments/razorpay/create-order` (body: `{ cart_id }`) -> returns `{ order: { id, amount, currency }, key_id?: "<RAZORPAY_KEY_ID>" }`
  - `POST /payments/razorpay/capture` (body: `{ payment_id, order_id, signature }`)

- Optionally set `NEXT_PUBLIC_RAZORPAY_KEY_ID` in the storefront environment to avoid returning the key id from the backend.

How it works:

- The checkout UI will show a "Razorpay" option when a payment provider id contains `razorpay`.
- Clicking the Razorpay button calls the create-order endpoint, loads the Razorpay Checkout script, opens checkout, and posts capture results to the backend.

Env vars:

- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (optional) - frontend-only key id

Security:

- Backend must verify signatures using your `RAZORPAY_KEY_SECRET` and capture payments server-side.
