# Phase 3: Shopping Cart & Checkout Context

## Implemented Architecture
- **Global Cart State**: Structured via `CartContext.tsx`. Tied into native `localStorage` cache for guest persistence. Contains pure addition, depletion, and dynamic sum calculus natively.
- **`Navbar.tsx` & `ProductCard.tsx` Update**: The Global App Shell now natively tracks cart variables globally via Provider encapsulation (`layout.tsx`). The Cart Badge tracks real-time items seamlessly dynamically.
- **Shopping Cart Interfacing**: Built `/cart`, presenting a beautifully structured flexbox architecture parsing context payload allowing quantity mutability and individual item deletion.
- **Express Secure Checkout Module**: Built `/checkout`, combining native state variables with the new Razorpay infrastructure. Captures raw unstructured Shipping data safely on the client.

## Payment Subsystem Architecture (Razorpay)
- **Node Injection**: `razorpay` backend utility installed and configured in `package.json`.
- **Backend API**: Configured `/api/razorpay/route.ts` mapping standard Math primitives (converting local USD calculations into raw subunit calculations `amount * 100`). Creates backend tokens directly from Razorpay without exposing secrets.
- **Frontend SDK Loader**: Injected `Next/Script` safely into the React DOM `<Script src="https://checkout.razorpay.com/v1/checkout.js" />`.
- **Database Capture Mechanism**: Mapped the native client-side Razorpay `handler` callback straight to Firestore Firebase (`addDoc` on `orders` collection) logging total order receipts post-authorization permanently.

## Current State
Phase 3 complete! The application executes the whole core standard sequence: Discovery -> Cart Add -> Edit / Quantity -> Razorpay Window -> Database Fulfillment.
