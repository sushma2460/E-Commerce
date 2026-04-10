"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ShoppingBag, Home, User } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && db) {
      const fetchOrder = async () => {
        try {
          const docSnap = await getDoc(doc(db, "orders", orderId));
          if (docSnap.exists()) {
            setOrder(docSnap.data());
          }
        } catch (e) {
          console.error("Order fetch failed", e);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-10 border border-emerald-500/30"
      >
        <CheckCircle className="w-12 h-12 text-emerald-400" />
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4"
      >
        PAYMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">AUTHORIZED</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-slate-400 text-lg mb-12 max-w-md mx-auto"
      >
        Your premium transaction has been successfully validated. Your luxury selection is now entering our artisanal fulfillment lifecycle.
      </motion.p>

      {orderId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mb-12 w-full max-w-md"
        >
          <div className="flex justify-between text-sm mb-4">
            <span className="text-slate-500 uppercase tracking-widest font-bold">Transaction Reference</span>
            <span className="text-white font-mono">{orderId}</span>
          </div>
          {order && (
            <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center text-left">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Destined For</p>
                <p className="text-white text-sm">{order.userEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Total</p>
                <p className="text-emerald-400 font-bold text-xl">${order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <Link href="/" className="bg-white text-slate-950 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          <Home className="w-5 h-5" /> Back to Showroom
        </Link>
        <Link href="/profile" className="glass-card hover:bg-white/5 px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 transition-all">
          <User className="w-5 h-5" /> Track in Profile
        </Link>
      </motion.div>

    </div>
  );
}
