import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

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
