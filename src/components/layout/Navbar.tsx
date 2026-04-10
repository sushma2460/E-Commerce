"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { Search, ShoppingBag, User as UserIcon, LogOut, CodeSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isAdmin, loading } = useAuth();
  const { cart } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="glass-card max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <CodeSquare className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Aura</span>
        </Link>

        {/* Global Search Interface */}
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & { search: { value: string } };
          if (target.search.value.trim()) {
            router.push(`/catalog?q=${encodeURIComponent(target.search.value.trim())}`);
          } else {
            router.push(`/catalog`);
          }
        }} className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            name="search"
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Search premium styles..."
          />
        </form>

        {/* Action Center */}
        <div className="flex items-center gap-4">
          <Link href="/catalog" className="text-sm font-medium text-slate-300 hover:text-white transition-colors mr-2">
            Catalog
          </Link>
          
          <Link href="/cart" className="relative p-2 text-slate-300 hover:text-white transition-colors group">
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-500 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {!loading && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
              {user ? (
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <Link href="/admin" className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30 px-3 py-1.5 rounded-lg bg-indigo-500/10">
                      Admin
                    </Link>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-300">
                    <Link href="/profile" className="hidden lg:block hover:text-indigo-400 transition-colors font-medium">
                      {user.displayName || user.email}
                    </Link>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-300 hover:text-red-400 transition-colors flex items-center gap-2"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors border border-white/10">
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
