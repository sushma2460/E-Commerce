"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA"
  });

  // Autofill if user has a default address
  useEffect(() => {
    if (userData?.savedAddresses?.length && !address.street) {
      const def = userData.savedAddresses[0]; // Take first as default for now
      setAddress({
        street: def.street,
        city: def.city,
        state: def.state,
        zip: def.zip,
        country: def.country || "USA"
      });
    }
  }, [userData]);

  // Redirect empty carts
  useEffect(() => {
    if (cart.length === 0 && !loading) {
      router.push("/cart");
    }
  }, [cart, router, loading]);

  const total = cartTotal * 1.08; // Math capturing tax (+ free shipping assumption)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Ask our backend to safely map an Order ID via Razorpay
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const razorpayOrder = await res.json();

      if (!res.ok) throw new Error(razorpayOrder.error || "Failed to initiate payment");

      // 2. Open Razorpay Window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummykey",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Aura Premium",
        description: "Secure Checkout Payment",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // 3. Payment Success - Fire to our Firestore DB
          try {
            const docRef = await addDoc(collection(db, "orders"), {
                userId: user?.uid || "guest",
                userEmail: user?.email || "guest@example.com",
                items: cart,
                totalAmount: total,
                shippingAddress: address,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                status: "Processing",
                createdAt: serverTimestamp(),
              });
              
              clearCart();
              router.push(`/checkout/success?orderId=${docRef.id}`);
          } catch (dbErr) {
            console.error("Database write failed after payment", dbErr);
            alert("Payment recorded, but database update failed. Please contact support.");
          }
        },
        prefill: {
          email: user?.email || "",
          name: user?.displayName || "",
          contact: "",
        },
        theme: {
          color: "#4f46e5", // Indigo-600
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="py-32 min-h-screen max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Secure Checkout Protected</h1>
        <p className="text-slate-400 max-w-md mb-8">You must be signed in to your Aura account to securely authorize Razorpay transactions.</p>
        <Link href="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl transition-all">
          Sign In to Checkout
        </Link>
      </div>
    );
  }

  if (cart.length === 0) return null; // Avoid flicker before redirect

  return (
    <>
      {/* Client-side Razorpay SDK Injection */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="py-12 min-h-screen max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Shipping Details */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Checkout</h2>
          
          <form id="checkout-form" onSubmit={handlePayment} className="glass-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-xl font-semibold text-white">Shipping Address</h3>
              {userData?.savedAddresses?.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">Profile Sync Active</span>
                </div>
              )}
            </div>
            
            {/* Address Form */}
            <div className="space-y-4">
              {userData?.savedAddresses?.length > 0 && (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Quick Select Saved Address</p>
                  <div className="flex flex-wrap gap-2">
                    {userData.savedAddresses.map((sa: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAddress({ ...sa })}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                          address.street === sa.street ? "bg-indigo-500 text-white border-indigo-400" : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {sa.label || `Address ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 ml-1">Street Address</label>
                <input required type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500" placeholder="123 Shopping Avenue" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 ml-1">City</label>
                  <input required type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500" placeholder="Metropolis" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 ml-1">State</label>
                  <input required type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500" placeholder="NY" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 ml-1">ZIP Code</label>
                  <input required type="text" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500" placeholder="10001" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 ml-1">Country</label>
                  <select value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer">
                    <option value="USA" className="bg-slate-900 text-white">United States</option>
                    <option value="CAN" className="bg-slate-900 text-white">Canada</option>
                    <option value="UK" className="bg-slate-900 text-white">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Right: Payment Subtotal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:pl-8 lg:border-l lg:border-white/10">
          <div className="glass-card p-6 md:p-8 sticky top-32">
            <h3 className="text-xl font-bold text-white mb-6">Payment Authorization</h3>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2 border-b border-white/5">
                  <div className="relative w-12 h-12 rounded bg-white/5 overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6 text-sm">
               <div className="flex justify-between text-slate-300">
                <span>Estimated Tax</span>
                <span className="font-medium text-white">${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-4 mb-8 flex justify-between items-end">
              <span className="text-xl font-bold text-white">Total Charge</span>
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">${total.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-4 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>Payments are encrypted securely natively by Razorpay.</span>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              {loading ? "Initializing..." : `Pay $${total.toFixed(2)}`}
              {!loading && <ArrowRight className="w-5 h-5 ml-1" />}
            </button>
          </div>
        </motion.div>

      </div>
    </>
  );
}
