import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

// We initialize Razorpay server-side using environment variables to keep the secret safe.
// Assuming the user has set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in their .env.local
const instance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummykey",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount provided for checkout." },
        { status: 400 }
      );
    }

    // Razorpay accepts amounts in paise (subunits). So we multiply by 100.
    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR", // Changed from USD to INR for better compatibility with test accounts
      receipt: `rcpt_${crypto.randomBytes(12).toString("hex")}`, // Shortened to stay under 40 char limit
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    }, { status: 200 });
  } catch (error: any) {
    console.error("DEBUG - Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: `Payment gateway error: ${error.message || "Ensure your Razorpay Keys are configured."}` },
      { status: 500 }
    );
  }
}
