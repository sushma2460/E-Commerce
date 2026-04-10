"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Trash2, Plus, Minus, ShoppingBag, ShieldAlert, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();

  const loading = authLoading || cartLoading;

  if (loading) {
    return (
      <div className="py-32 min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-32 min-h-screen max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Authentication Required</h1>
        <p className="text-slate-400 max-w-md mb-8">You must be securely signed in to view and modify your shopping cart.</p>
        <Link href="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl transition-all">
          Sign In to Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 min-h-screen max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">Your Cart</h1>
        <p className="text-slate-400">Review your selected items before proceeding to secure checkout.</p>
      </div>

      {cart.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 glass-card rounded-2xl flex flex-col items-center"
        >
          <ShoppingBag className="w-16 h-16 text-slate-600 mb-6" />
          <p className="text-2xl text-white font-medium mb-4">Your cart is empty</p>
          <p className="text-slate-400 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Let's change that.</p>
          <Link href="/catalog" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl transition-all">
            Continue Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 sm:p-6 flex gap-6 items-center"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                    <p className="text-indigo-400 font-bold mb-4">${item.price.toFixed(2)}</p>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/5 p-1 rounded-lg h-10 w-fit">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-8 sticky top-32"
            >
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  <span className="font-medium text-emerald-400">Free</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax (Estimated)</span>
                  <span className="font-medium text-white">${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4 mb-8 flex justify-between items-end">
                <span className="text-base text-slate-200">Total</span>
                <span className="text-3xl font-bold text-white">${(cartTotal * 1.08).toFixed(2)}</span>
              </div>
              
              <Link 
                href="/checkout"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
          
        </div>
      )}
    </div>
  );
}
