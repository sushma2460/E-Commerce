"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2, LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Basic route constraint: check if the loaded user's email matches the Env admin email.
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@aura.com";
        if (user.email !== adminEmail) {
          router.push("/");
        }
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-slate-950 z-50">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Double check constraint before rendering children natively
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@aura.com";
  if (user.email !== adminEmail) return null;

  const handleLogout = async () => {
    try {
      const { auth } = await import("@/lib/firebase/config");
      const { signOut } = await import("firebase/auth");
      if (auth) {
        await signOut(auth);
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-slate-900 border-r border-white/10 flex flex-col hidden md:flex"
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <span className="text-xl font-bold text-white tracking-tight">Aura Admin</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto w-full">
          {[
            { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
            { name: "Orders", href: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
            { name: "Inventory", href: "/admin/inventory", icon: <Package className="w-5 h-5" /> }
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <p className="text-xs text-slate-500 pl-4 mb-2 truncate">Logged in as {user.email}</p>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-medium border border-transparent"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </button>
        </div>
      </motion.aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto relative p-6 md:p-10">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
