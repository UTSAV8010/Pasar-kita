# Custom Payment Gateway API with Dynamic UPI QR Code

We will build our own **Custom Payment Gateway System** that actually generates a scannable UPI QR code on the screen. When you scan it with GPay, PhonePe, or Paytm, it will automatically fill in the merchant details and the exact total amount.

## Proposed Changes

We will create a separate "service" within your codebase to act as the Payment Gateway API, which generates the dynamic QR codes, and then integrate it into the food ordering system.

---

### Phase 1: Building the Custom Payment Gateway (The API)

#### [NEW] [pg/checkout.php](file:///c:/xampp/htdocs/r-management/frontend/pg/checkout.php)
- This is the UI of our custom payment gateway.
- It will receive the `amount` and `order_id` securely from the cart.
- It will automatically generate a dynamic UPI Intent URI (`upi://pay?pa=YOUR_UPI_ID&pn=Your%20Restaurant&am=AMOUNT&cu=INR`).
- It will render this URI as a Scannable QR Code on the screen using a lightweight JavaScript library (`qrcode.min.js`).
- Because this is a custom API without direct banking hooks, the user will scan the QR code to pay, and then we will provide a "Confirm Payment" input where they simply enter their UTR (Transaction ID) from the app to prove they paid.

#### [NEW] [pg/process.php](file:///c:/xampp/htdocs/r-management/frontend/pg/process.php)
- The backend processor for our custom gateway.
- It will receive the UTR from the checkout screen, package it up, and securely redirect the user back to the provided `callback_url` with the `status` (success) and the `transaction_id`.

---

### Phase 2: Integrating the System into `mycart.php`

#### [MODIFY] [mycart.php](file:///c:/xampp/htdocs/r-management/frontend/mycart.php)
- When the user selects "UPI" and clicks "Checkout", instead of completing the order immediately, the system will insert the order with a status of `Initiated`.
- It will then redirect the user to our custom gateway (`pg/checkout.php`) passing the `order_id`, the total `amount`, and the callback endpoint.

#### [NEW] [verify-payment.php](file:///c:/xampp/htdocs/r-management/frontend/verify-payment.php)
- This will act as the `callback_url` for our custom gateway.
- When the custom gateway finishes the payment, it redirects here.
- This page will read the `status` and `transaction_id` from the gateway.
- If successful, it updates the `order_manager` to `Pending` (or `successful`), deducts stock, and clears the cart.
- It will then redirect the user to `view-orders.php` with a success message.

## Verification Plan
1. Add an item to your cart and proceed to checkout.
2. Select UPI and click Checkout.
3. You will be redirected to the custom Payment Gateway screen.
4. A QR Code will appear on the screen.
5. You can scan it with your phone (using Google Lens or any UPI app) and verify that the restaurant name and exact order amount are automatically filled in.
6. Enter a test UTR on the screen and submit.
7. You will be redirected back to the site, the order will be placed, and stock will be deducted.
