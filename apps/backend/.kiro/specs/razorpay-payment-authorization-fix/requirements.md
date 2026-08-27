# Razorpay Payment Authorization Fix - Requirements

## Problem Statement

Razorpay payment authorization fails after successful payment completion, despite webhooks being received successfully (200 responses). The payment session fails to authorize with the provider, causing cart completion to fail with a 400 error.

### Current Error Pattern

```
POST /hooks/payment/razorpay_razorpay ← - (200) - 8.109 ms
info: Processing payment.webhook_received which has 1 subscribers
error: Session: payses_01M0ZBXMNVWMXWDFGCCWHAE17K was not authorized with the provider
```

### Impact

- Successful Razorpay payments fail to complete orders
- Cart completion fails despite successful payment processing
- Users experience failed checkouts after successful payment
- Manual intervention required to recover failed payment sessions

## Current Behavior

1. **Customer Payment Flow**: ✅ Customer completes payment on Razorpay successfully
2. **Webhook Reception**: ✅ Razorpay webhook is received and returns 200 response
3. **Webhook Processing**: ✅ `payment.webhook_received` event is triggered and processed
4. **Session Authorization**: ❌ Payment session fails authorization with "Session was not authorized with the provider"
5. **Cart Completion**: ❌ Cart completion fails with 400 error
6. **Order Creation**: ❌ Order is not created

## Requirements

### 2. Expected Behavior (Fix Requirements)

The system SHALL properly authorize payment sessions after successful webhook processing to complete the payment flow.

**2.1 Webhook-to-Session Synchronization**
- When a Razorpay webhook indicates successful payment (`payment.captured` or `payment.authorized`), the system SHALL update the corresponding payment session with the payment response data (payment_id, order_id, signature)

**2.2 Session Data Completeness**
- Payment sessions SHALL contain all required Razorpay payment response fields (razorpay_payment_id, razorpay_order_id, razorpay_signature) before authorization is attempted

**2.3 Authorization Flow Completion**
- Payment sessions with complete Razorpay payment data SHALL successfully pass authorization validation during cart completion

**2.4 Session Identification**
- Webhook processing SHALL correctly identify and update the payment session using session_id from webhook payload notes

### 3. Preservation Requirements (Unchanged Behaviors)

**3.1 Webhook Reception**
- Webhook endpoint SHALL continue receiving Razorpay webhooks and returning 200 responses

**3.2 Payment Processing Workflow**
- The existing payment processing workflow trigger and execution SHALL remain unchanged

**3.3 Direct Payment Authorization**
- Payment sessions that receive payment data directly from the frontend (not via webhook) SHALL continue to work unchanged

**3.4 Signature Verification**
- All signature verification logic for both webhook and direct payment data SHALL remain unchanged

**3.5 Other Payment Providers**
- No other payment provider integrations SHALL be affected by this fix

### 4. Edge Cases

**4.1 Missing Session ID**
- Webhooks without session_id in payload notes SHALL be ignored (current behavior maintained)

**4.2 Duplicate Webhooks**
- Multiple webhooks for the same payment SHALL not cause authorization conflicts

**4.3 Order ID Mismatch**
- Webhooks with order_id not matching existing payment session SHALL be rejected

**4.4 Webhook Timing**
- Webhooks received before or after cart completion attempts SHALL be handled correctly

## Success Criteria

1. **Payment Flow Completion**: Payment sessions receive webhook data and authorize successfully during cart completion
2. **Order Creation**: Successful Razorpay payments result in completed orders
3. **Error Elimination**: "Session was not authorized with the provider" errors are eliminated for successful payments
4. **Preservation**: All existing functionality continues to work without regression

## Technical Context

### Affected Components

1. **RazorpayProviderService.getWebhookActionAndData()** - Webhook processing method
2. **RazorpayProviderService.authorizePayment()** - Payment authorization logic
3. **Payment session data synchronization** - Session update mechanism
4. **Payment webhook subscriber** - Webhook event processing

### Current Implementation Analysis

- Webhooks are processed successfully by `getWebhookActionAndData()`
- Payment sessions may not receive webhook data updates
- Authorization fails when session data lacks payment response fields
- Session identification via `session_id` from webhook notes works correctly

### Root Cause Hypothesis

The payment session is not being updated with payment response data from the webhook, causing authorization to fail when it expects complete payment data (razorpay_payment_id, razorpay_order_id, razorpay_signature).