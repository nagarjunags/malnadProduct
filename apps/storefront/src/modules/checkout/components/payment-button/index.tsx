"use client"

import { isManual, isRazorpay, isStripeLike } from "@lib/constants"
import { placeOrder, submitRazorpayPayment } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
//ngrj cr -- switch case the review button will return th ebutton related to the selected payment option
  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isRazorpay(paymentSession?.provider_id):
      return (
        <RazorpayPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

// ---------------------------------------------------------------------------
// Razorpay payment button
// Opens Razorpay checkout modal using order data stored in the payment session,
// verifies payment on the backend, then places the order via Medusa.
// ---------------------------------------------------------------------------
const loadRazorpayScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("window is undefined"))
    }
    if ((window as any).Razorpay) {
      return resolve()
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Razorpay script"))
    document.body.appendChild(script)
  })

const RazorpayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const handlePayment = async () => {
    if (!session) {
      setErrorMessage("No active payment session found")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      await loadRazorpayScript()
  console.log("---------------------------------------------------------------")//ngrjdoubt

      console.log(cart)//ngrjdoubt
      const sessionData = session.data as Record<string, any>
      const razorpayOrderId = sessionData?.razorpay_order_id || sessionData?.id
      const keyId =
        sessionData?.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      if (!razorpayOrderId) {
        throw new Error(
          "Razorpay order ID not found in payment session. Please go back and re-select the payment method."
        )
      }

      if (!keyId) {
        throw new Error(
          "Razorpay key is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment."
        )
      }

      await new Promise<void>((resolve, reject) => {
        const options: any = {
          key: keyId,
          amount: sessionData?.amount,
          currency: sessionData?.currency || "INR",
          order_id: razorpayOrderId,
          name: "Order Payment",
          prefill: {
            name:
              [
                cart.billing_address?.first_name,
                cart.billing_address?.last_name,
              ]
                .filter(Boolean)
                .join(" ") || undefined,
            email: cart.email || undefined,
            contact: cart.billing_address?.phone || undefined,
          },
          handler: async function (response: any) {
            try {
              await submitRazorpayPayment(cart, session.id, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              })
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error("Payment was cancelled"))
            },
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.on("payment.failed", (response: any) => {
          reject(
            new Error(
              response?.error?.description || "Razorpay payment failed"
            )
          )
        })
        rzp.open()
      })

      // Payment completed and session data updated — place the order
      await placeOrder()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Stripe payment button (unchanged)-- Not used for But retained for future expansion
// ---------------------------------------------------------------------------
const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Manual test payment button (unchanged)
// ---------------------------------------------------------------------------
const ManualTestPaymentButton = ({
  notReady,
  "data-testid": dataTestId,
}: {
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId || "submit-order-button"}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
