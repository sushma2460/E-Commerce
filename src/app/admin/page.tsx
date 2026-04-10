"use client";

import { motion } from "framer-motion";
import { Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Overview</h1>
      <p className="text-slate-400 mb-10 w-full max-w-2xl">
        Welcome to your administrative command center. Select a module below to begin securely managing 
        your active platform parameters.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link 
            href="/admin/orders" 
            className="flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 p-8 rounded-2xl transition-all group h-full"
          >
            <div className="p-4 bg-indigo-500/20 rounded-xl w-fit mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Order Management</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Track successful Razorpay payments natively, inspect customer shipping data, and modify delivery statuses.
            </p>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link 
            href="/admin/products" 
            className="flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 p-8 rounded-2xl transition-all group h-full"
          >
            <div className="p-4 bg-emerald-500/20 rounded-xl w-fit mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Inventory Control</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Push new products directly to the live Firebase database catalog natively without using backend SDKs.
            </p>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link 
            href="/admin/users" 
            className="flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 p-8 rounded-2xl transition-all group h-full text-left"
          >
            <div className="p-4 bg-purple-500/20 rounded-xl w-fit mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">User Governance</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Manage registered customers, view platform identities, and assign administrative privileges securely.
            </p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
