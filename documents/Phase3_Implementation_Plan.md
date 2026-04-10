# Phase 3: Shopping Cart & Secure Checkout

Now that our users can browse products via our authenticated portal, it's time to build the actual E-Commerce mechanics: managing a real-time shopping cart and finalizing payments through Razorpay!

## Proposed Changes

### 1. Global Cart State Management
- **Create**: `frontend/src/context/CartContext.tsx`
- **Logic**: A sophisticated React Context wrapper that holds the cart's line-items, subtotal, and tax logic.
  - *Guest Users*: Persists cart snapshot natively to browser `localStorage`.
  - *Authenticated Users*: Syncs the cart payload robustly to a `carts` collection in Firestore to maintain cross-device persistence.
- **Integration**: Tie the dummy `handleAddToCart` in our `ProductCard.tsx` natively to this Context API, and update the `Navbar` to broadcast the live cart count.

### 2. Cart & Checkout Interface
- **Create**: A `/cart` overview page for users to review their items, increment/decrement quantities, and delete items.
- **Create Checkout Flow** (`/checkout`): A multi-step Glassmorphism form mapping:
  - Step 1: Secure Shipping Address data capture.
  - Step 2: Payment confirmation intent block.

### 3. Razorpay Payment Gateway Integration
- **Server Creation**: We will create a secure backend Next.js API route (`frontend/src/app/api/razorpay/route.ts`). This route will communicate secretly with Razorpay to mint a secure `Order ID`.
- **Client Integration**: We'll seamlessly inject the Razorpay Window SDK into the checkout page. When triggered, the stylish Razorpay modal will handle the final transaction safely.
  
### 4. Firestore Order Processing
- **Logic**: Upon successful payment confirmation from Razorpay, we'll execute an atomic write to the Firestore `orders` collection, archiving the user's purchased items, generated totals, and tracking statuses (`Processing`).
