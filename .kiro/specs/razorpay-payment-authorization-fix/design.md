# Razorpay Payment Authorization Fix Design

## Overview

This bugfix addresses a critical payment flow issue where Razorpay payments successfully processed via webhooks fail to authorize during cart completion. The root cause is that the webhook handler (`getWebhookActionAndData`) receives payment events and returns the action but does not update the payment session with the payment response data (`razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`) required by `authorizePayment()` to verify the payment.

The fix strategy is to enhance the webhook handler to extract and return payment response data from the webhook payload, allowing the payment session to be updated with the verification credentials. This maintains backward compatibility with client-side payment completion while adding webhook-based payment completion support.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when payment is completed via webhook and the payment session lacks payment response data
- **Property (P)**: The desired behavior for webhook-completed payments - payment session should contain payment response data enabling authorization
- **Preservation**: Existing client-side payment flow and validation logic that must remain unchanged by the fix
- **getWebhookActionAndData**: The webhook handler method in `RazorpayProviderService` at `/apps/backend/src/modules/razorpay/service.ts` that processes Razorpay webhook events
- **authorizePayment**: The authorization method in `RazorpayProviderService` that verifies payment signature and returns authorization status
- **hasPaymentResponse**: Type guard function that checks if payment session data contains `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`
- **Payment Session**: The data object stored in the payment provider containing payment state and verification credentials
- **Payment Response Data**: The set of fields (`razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`) needed to verify a Razorpay payment

## Bug Details

### Bug Condition

The bug manifests when a Razorpay payment is successfully completed and a webhook event (payment.captured or payment.authorized) is received, but the payment session data does not contain the payment response fields needed for verification. The `getWebhookActionAndData` method correctly identifies the webhook action but does not extract and return the payment credentials, causing `authorizePayment` to find no payment response data and return "pending" status, which fails cart completion.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type WebhookPayload with payment event
  OUTPUT: boolean
  
  RETURN input.event IN ['payment.captured', 'payment.authorized']
         AND input.payload.payment.entity EXISTS
         AND paymentSessionData.razorpay_payment_id IS NULL
         AND paymentSessionData.razorpay_order_id IS NULL
         AND paymentSessionData.razorpay_signature IS NULL
END FUNCTION
```

### Examples

- **Example 1**: Customer completes Razorpay payment → webhook "payment.captured" received → `getWebhookActionAndData` returns `{action: "captured", data: {session_id, amount}}` → payment session updated with only session_id and amount → cart completion calls `authorizePayment` → no payment response data found → returns `{status: "pending"}` → cart completion fails with "Session was not authorized"

- **Example 2**: Payment authorized via webhook → `getWebhookActionAndData` returns action "authorized" but no payment IDs → `authorizePayment` checks `hasPaymentResponse(data)` → returns false → authorization status is "pending" → order creation blocked

- **Example 3**: Client-side payment completion (non-bug case) → client provides `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` directly → `authorizePayment` finds payment response data → verifies signature → returns "authorized"/"captured" → cart completes successfully

- **Edge Case**: Webhook received with invalid signature → signature verification fails → returns `{action: "failed"}` → payment session not updated → expected behavior (no authorization should occur)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Client-side payment completion flow must continue to work exactly as before - when client provides payment response data directly to the payment session, authorization must succeed
- Signature verification logic must remain unchanged - both webhook signature verification (in `getWebhookActionAndData`) and payment response signature verification (in `verifyPaymentResponse`) must use the same validation approach
- Error handling for invalid payments must remain unchanged - mismatched amounts, currencies, order IDs, or invalid signatures must continue to throw appropriate errors
- Payment state transitions must remain unchanged - only "authorized" and "captured" payment states should allow authorization to succeed
- Webhook rejection for invalid signatures must continue to return `{action: "failed"}` when webhook secret is configured and signature doesn't match

**Scope:**
All inputs that do NOT involve webhook-based payment completion should be completely unaffected by this fix. This includes:
- Client-side payment completion with direct payment response data
- Payments completed before webhook integration was added
- Other webhook event types (payment.failed, refund events, etc.)
- Payment operations other than authorization (capture, refund, cancel, retrieve, update)

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Incomplete Webhook Data Extraction**: The `getWebhookActionAndData` method currently only extracts `session_id` and `amount` from webhook payload, but does not extract the payment response fields (`payment_id`, `order_id`, `signature`) that `authorizePayment` requires for verification

2. **Missing Data Propagation**: The webhook handler returns data in the `WebhookActionResult.data` field, but this data structure only includes `session_id` and `amount` - it lacks fields to carry payment response credentials back to the payment session

3. **Type Mismatch**: The `WebhookActionResult.data` type may not accommodate the payment response fields, or the framework may not be designed to propagate webhook data back to payment sessions (though this seems unlikely given the webhook handler returns data)

4. **Order ID Availability**: The webhook payload may not contain the `order_id` or may store it in a different location than expected, making it impossible to extract all required fields from the webhook alone

## Correctness Properties

Property 1: Bug Condition - Webhook Payment Completion

_For any_ webhook payload where a payment.captured or payment.authorized event is received with valid signature and complete payment entity data, the fixed getWebhookActionAndData function SHALL extract and return the payment response fields (razorpay_payment_id, razorpay_order_id, razorpay_signature) in the WebhookActionResult.data, enabling authorizePayment to verify the payment and return "authorized" or "captured" status.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Client-Side Payment Flow

_For any_ payment session where payment response data is provided directly by the client (not via webhook), the fixed code SHALL produce exactly the same authorization behavior as the original code, preserving the client-side payment completion flow and signature verification logic.

**Validates: Requirements 3.1, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct (incomplete webhook data extraction):

**File**: `/apps/backend/src/modules/razorpay/service.ts`

**Function**: `getWebhookActionAndData`

**Specific Changes**:

1. **Extract Payment Response Fields from Webhook Payload**: 
   - Extract `razorpay_payment_id` from `event.payload.payment.entity.id`
   - Extract `razorpay_order_id` from `event.payload.payment.entity.order_id`
   - Calculate `razorpay_signature` using the same HMAC-SHA256 approach as client-side: `HMAC_SHA256(key_secret, order_id|payment_id)`

2. **Include Payment Response in WebhookActionResult.data**:
   - Add `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` to the returned data object
   - Ensure these fields are only included for "captured" and "authorized" actions
   - Maintain existing fields (`session_id`, `amount`) for backward compatibility

3. **Handle Missing Order ID**:
   - Check if `order_id` exists in webhook payload before calculating signature
   - If order_id is missing, log warning but still return action (payment may not be order-based)
   - Only include signature fields when all three values (payment_id, order_id, key_secret) are available

4. **Maintain Type Compatibility**:
   - Verify that `WebhookActionResult.data` type accepts additional fields beyond `session_id` and `amount`
   - If type restrictions exist, extend the data structure appropriately
   - Ensure framework propagates webhook data to payment session

5. **Preserve Webhook Signature Verification**:
   - Keep existing webhook signature verification logic unchanged
   - Signature verification for webhooks (X-Razorpay-Signature header) is separate from payment response signature
   - Both verifications must continue to work independently

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code using exploratory tests, then verify the fix works correctly and preserves existing behavior using fix checking and preservation tests.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that webhook-completed payments fail authorization on unfixed code. If webhook data structure differs from expectations, refine the root cause hypothesis.

**Test Plan**: Create mock webhook payloads for payment.captured and payment.authorized events. Process them through `getWebhookActionAndData` on UNFIXED code and observe that payment response fields are not returned. Then simulate cart completion by calling `authorizePayment` with the session data and verify it returns "pending" status instead of "authorized"/"captured".

**Test Cases**:
1. **Captured Payment Webhook Test**: Send mock "payment.captured" webhook → verify `getWebhookActionAndData` returns only `{session_id, amount}` without payment response fields → simulate `authorizePayment` call → verify it returns `{status: "pending"}` (will fail on unfixed code as expected)

2. **Authorized Payment Webhook Test**: Send mock "payment.authorized" webhook → verify payment response fields are missing from returned data → verify authorization fails with "pending" status (will fail on unfixed code as expected)

3. **Complete Cart Flow Test**: Simulate full flow: webhook received → payment session updated → cart completion triggered → `authorizePayment` called → verify failure with "Session was not authorized" error (will fail on unfixed code as expected)

4. **Missing Order ID Test**: Send webhook with payment but no order_id → verify graceful handling (may fail on unfixed code if order_id is required)

**Expected Counterexamples**:
- `getWebhookActionAndData` returns `{action: "captured", data: {session_id, amount}}` without `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
- `authorizePayment` returns `{status: "pending"}` when called after webhook because `hasPaymentResponse(data)` returns false
- Cart completion throws "Session was not authorized with the provider" error
- Possible root cause confirmation: webhook payload contains payment_id and order_id but code doesn't extract them

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (webhook with payment completion), the fixed function produces the expected behavior (payment session updated with response data, authorization succeeds).

**Pseudocode:**
```
FOR ALL webhookPayload WHERE isBugCondition(webhookPayload) DO
  result := getWebhookActionAndData_fixed(webhookPayload)
  ASSERT result.data contains razorpay_payment_id
  ASSERT result.data contains razorpay_order_id
  ASSERT result.data contains razorpay_signature
  
  authResult := authorizePayment_fixed(result.data)
  ASSERT authResult.status IN ["authorized", "captured"]
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (client-side payment completion, other webhook events, invalid payments), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT processPayment_original(input) = processPayment_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (different payment states, amounts, currencies)
- It catches edge cases that manual unit tests might miss (boundary values, null/undefined fields, malformed data)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs (client-side payments, failed payments, refunds)

**Test Plan**: Observe behavior on UNFIXED code first for client-side payment completion, failed webhooks, and other scenarios, then write property-based tests capturing that exact behavior.

**Test Cases**:
1. **Client-Side Payment Preservation**: Test with payment session containing client-provided `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` → verify `authorizePayment` behavior is identical before and after fix (signature verification, error handling, success status)

2. **Failed Payment Webhook Preservation**: Test with "payment.failed" webhook → verify `getWebhookActionAndData` returns `{action: "failed"}` with same data structure before and after fix

3. **Invalid Signature Preservation**: Test with webhook having invalid signature → verify rejection behavior is unchanged (returns `{action: "failed"}`)

4. **Mismatched Payment Data Preservation**: Test `authorizePayment` with payment response data that has mismatched amount/currency/order_id → verify same error thrown before and after fix

5. **Non-Authorizable Payment State Preservation**: Test `authorizePayment` with payment in "failed" or "pending" state → verify same error/status returned before and after fix

### Unit Tests

- Test `getWebhookActionAndData` with various webhook payloads (captured, authorized, failed, refunded)
- Test extraction of payment response fields from webhook payload structure
- Test signature calculation matches expected format (`order_id|payment_id`)
- Test handling of missing fields (no order_id, no payment_id, no notes)
- Test `authorizePayment` with webhook-populated payment session data
- Test that client-side payment completion continues to work
- Test edge cases: webhook with minimal data, webhook with extra fields, malformed webhook

### Property-Based Tests

- Generate random webhook payloads with valid payment entities → verify payment response fields are extracted and authorization succeeds
- Generate random client-side payment sessions with complete response data → verify authorization behavior is preserved (same success/failure outcomes)
- Generate random invalid payment data (wrong signatures, mismatched amounts) → verify same errors are thrown before and after fix
- Test across many payment amounts, currencies, and session IDs to ensure no edge cases break

### Integration Tests

- Test full payment flow: create order → receive webhook → complete cart → verify order created successfully
- Test switching between payment methods: start with Razorpay → switch to another provider → verify no interference
- Test concurrent scenarios: webhook arrives while cart completion is in progress
- Test webhook arrival timing: webhook before cart completion, webhook during authorization, webhook after completion
- Test that visual feedback and order confirmation emails are triggered correctly after webhook-based payment
