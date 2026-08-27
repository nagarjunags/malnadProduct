import RazorpayProviderService from "./service"

export const RAZORPAY_MODULE = "razorpay"

// Payment providers registered under the payment module's `providers` array
// must export { services: [ServiceClass] } as their default — NOT a Module()
// definition. The moduleProviderLoader checks for `default.services.length`.
export default {
  services: [RazorpayProviderService],
}
