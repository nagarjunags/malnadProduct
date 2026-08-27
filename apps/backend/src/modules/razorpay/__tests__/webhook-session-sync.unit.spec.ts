/**
 * Bug Condition Exploration Test - Task 1
 * 
 * **Property 1: Bug Condition** - Webhook Payment Session Synchronization
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation.
 * When run on UNFIXED code, it should FAIL, proving the bug exists.
 */

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
      // Test Case: payment.captured webhook with session_id
      const webhookPayload = {
        data: {
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: "pay_29QQoUBi66xm2f",
                order_id: "order_DbJOWfscnM25g1", 
                amount: 100000, // 1000 INR in paise
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

      // Process webhook - this should return payment data for session update
      const result = await razorpayService.getWebhookActionAndData(webhookPayload)
      
      // **EXPECTED BEHAVIOR**: Webhook processing should return complete payment data
      // **BUG CONDITION**: Currently only returns action and basic data (session_id, amount)
      
      // Verify webhook action is correct
      expect(result.action).toBe("captured")
      expect(result.data.session_id).toBe("payses_01M0ZBXMNVWMXWDFGCCWHAE17K")
      expect(result.data.amount).toEqual(new BigNumber(1000))
      
      // **CRITICAL**: These assertions will FAIL on unfixed code
      // The webhook should extract and return payment response data for session update
      expect(result.data).toHaveProperty("razorpay_payment_id", "pay_29QQoUBi66xm2f")
      expect(result.data).toHaveProperty("razorpay_order_id", "order_DbJOWfscnM25g1")
      expect(result.data).toHaveProperty("razorpay_signature")
      
      // Verify payment session would contain complete data after webhook processing
      // This simulates what should happen when the webhook result updates the session
      const mockSessionData = {
        id: "order_DbJOWfscnM25g1",
        razorpay_order_id: "order_DbJOWfscnM25g1",
        amount: 100000,
        currency: "INR",
        ...result.data // Merge webhook payment data
      }
      
      // **CRITICAL**: This will FAIL on unfixed code
      // Session should have complete payment response data for authorization
      expect(mockSessionData).toHaveProperty("razorpay_payment_id", "pay_29QQoUBi66xm2f")
      expect(mockSessionData).toHaveProperty("razorpay_order_id", "order_DbJOWfscnM25g1") 
      expect(mockSessionData).toHaveProperty("razorpay_signature")
      
      // Verify authorization would succeed with complete data
      // This tests that the session data format matches authorization expectations
      const hasCompletePaymentResponse = 
        typeof mockSessionData.razorpay_order_id === "string" &&
        typeof mockSessionData.razorpay_payment_id === "string" &&  
        typeof mockSessionData.razorpay_signature === "string"
        
      expect(hasCompletePaymentResponse).toBe(true)
    })

    test("should extract complete payment data from payment.authorized webhook", async () => {
      // Test Case: payment.authorized webhook with session_id
      const webhookPayload = {
        data: {
          event: "payment.authorized", 
          payload: {
            payment: {
              entity: {
                id: "pay_AuthorizedTest123",
                order_id: "order_AuthTest456",
                amount: 50000, // 500 INR in paise
                currency: "INR", 
                status: "authorized",
                notes: {
                  session_id: "payses_AuthorizedSession789"
                }
              }
            }
          }
        },
        rawData: Buffer.from("test"),
        headers: {}
      }

      // Process webhook 
      const result = await razorpayService.getWebhookActionAndData(webhookPayload)
      
      // Verify basic webhook processing
      expect(result.action).toBe("authorized")
      expect(result.data.session_id).toBe("payses_AuthorizedSession789")
      expect(result.data.amount).toEqual(new BigNumber(500))
      
      // **CRITICAL**: These will FAIL on unfixed code - webhook should return payment data
      expect(result.data).toHaveProperty("razorpay_payment_id", "pay_AuthorizedTest123")
      expect(result.data).toHaveProperty("razorpay_order_id", "order_AuthTest456") 
      expect(result.data).toHaveProperty("razorpay_signature")
      
      // Verify session would be ready for authorization
      const mockSessionData = {
        id: "order_AuthTest456",
        razorpay_order_id: "order_AuthTest456",
        amount: 50000,
        currency: "INR",
        ...result.data
      }
      
      const hasCompletePaymentResponse = 
        typeof mockSessionData.razorpay_order_id === "string" &&
        typeof mockSessionData.razorpay_payment_id === "string" &&
        typeof mockSessionData.razorpay_signature === "string"
        
      // **CRITICAL**: This will FAIL on unfixed code
      expect(hasCompletePaymentResponse).toBe(true)
    })

    test("should handle webhooks without session_id gracefully", async () => {
      // Edge case: webhook without session_id should be ignored (preserved behavior)
      const webhookPayload = {
        data: {
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: "pay_NoSession123", 
                order_id: "order_NoSession456",
                amount: 25000,
                currency: "INR",
                status: "captured",
                notes: {} // No session_id
              }
            }
          }
        },
        rawData: Buffer.from("test"),
        headers: {}
      }

      const result = await razorpayService.getWebhookActionAndData(webhookPayload)
      
      // Should still process but with empty session_id (current behavior preserved)
      expect(result.action).toBe("captured") 
      expect(result.data.session_id).toBe("")
      expect(result.data.amount).toEqual(new BigNumber(250))
    })
  })
})