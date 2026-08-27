# Bugfix Requirements Document

## Introduction

This document describes the fix for a critical bug where Razorpay payment authorization fails during cart completion, despite successful payment and webhook reception. The bug prevents customers from completing their orders even after successful payment, resulting in failed transactions and poor user experience.

The root cause is that the payment session data is not updated with the payment response details (payment IDs and signature) when payment is completed via webhook, causing the authorization step to fail when it attempts to verify the payment.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a Razorpay payment webhook is received after successful payment AND the payment session data does not contain `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` THEN the system cannot verify the payment during cart completion

1.2 WHEN `authorizePayment()` is called during cart completion AND the payment session data lacks payment response fields THEN the system returns status "pending" instead of "authorized" or "captured"

1.3 WHEN cart completion proceeds with a "pending" payment authorization status THEN the system fails with error "Session was not authorized with the provider" and the cart completion fails with 400 error

### Expected Behavior (Correct)

2.1 WHEN a Razorpay payment webhook is received after successful payment THEN the system SHALL update the payment session data with the payment response details including `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`

2.2 WHEN `authorizePayment()` is called during cart completion AND the payment session data contains valid payment response fields THEN the system SHALL verify the payment signature and return status "authorized" or "captured"

2.3 WHEN cart completion proceeds with a valid authorization status THEN the system SHALL successfully complete the cart and create an order

### Unchanged Behavior (Regression Prevention)

3.1 WHEN payment is completed via client-side callback (not webhook) AND the client provides payment response data directly THEN the system SHALL CONTINUE TO verify and authorize the payment as it does currently

3.2 WHEN webhook signature verification is enabled AND a webhook with invalid signature is received THEN the system SHALL CONTINUE TO reject the webhook with "failed" action

3.3 WHEN `authorizePayment()` is called AND payment response data has invalid signature THEN the system SHALL CONTINUE TO return status "error" with error details

3.4 WHEN payment amount, currency, or order ID in the payment response does not match the payment session THEN the system SHALL CONTINUE TO throw "Razorpay payment details do not match this payment session" error

3.5 WHEN a Razorpay payment is in a non-authorizable state (e.g., failed, pending) THEN the system SHALL CONTINUE TO throw appropriate error or return pending status
