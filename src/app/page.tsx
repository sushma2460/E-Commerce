"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Tag, Star, Zap, Globe } from "lucide-react";
import Image from "next/image";

const categories = [
  { name: "Apparel", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80", count: "42 Items" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", count: "128 Items" },
  { name: "Bags", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80", count: "15 Items" },
  { name: "Footwear", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80", count: "36 Items" },
];

export default function Home() {
  const { user, loading } = useAuth();

  // 1. Authenticated Home Dashboard View
  if (!loading && user) {
    return (
      <div className="flex flex-col gap-20 pb-20 pt-10">
        <section className="max-w-7xl mx-auto w-full px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
            
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3 fill-current" /> Active Aura Member
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Welcome back, <br />
                <span className="text-indigo-400">{user.displayName || user.email?.split('@')[0]}</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg font-medium">
                Your premium dashboard is ready. Discover new drops tailored to your aesthetic or track your latest luxury acquisitions.
              </p>
              <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                <Link href="/catalog" className="bg-white text-slate-950 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                  Continue Shopping <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/profile" className="glass-card hover:bg-white/5 px-8 py-4 rounded-xl font-bold text-white transition-colors">
                  View Orders
                </Link>
              </div>
            </div>

            <div className="w-full md:w-80 grid grid-cols-2 gap-4">
              {[
                { label: "Orders", value: "Track", icon: <Truck className="w-5 h-5" />, href: "/profile" },
                { label: "Cart", value: "Review", icon: <ShoppingBag className="w-5 h-5" />, href: "/cart" },
                { label: "Catalog", value: "Explore", icon: <Globe className="w-5 h-5" />, href: "/catalog" },
                { label: "Profile", value: "Edit", icon: <Star className="w-5 h-5" />, href: "/profile" },
              ].map((stat, i) => (
                <Link key={i} href={stat.href} className="glass-card p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors group text-center">
                  <div className="text-indigo-400 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                    <p className="text-sm font-bold text-white">{stat.value}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Global Categories & Discoveries */}
        <section className="max-w-7xl mx-auto w-full px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Handpicked Collections</h2>
            <Link href="/catalog" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">View All Series</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link href={`/catalog?q=${cat.name.toLowerCase()}`} key={idx} className="group relative h-[350px] rounded-3xl overflow-hidden glass-card">
                <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
                  <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                  <p className="text-indigo-400 text-xs font-medium">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Membership Perks */}
        <section className="max-w-7xl mx-auto w-full px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 space-y-4">
            <Tag className="w-8 h-8 text-pink-400" />
            <h3 className="text-xl font-bold text-white">Member Pricing</h3>
            <p className="text-slate-400 text-sm">Your Aura status automatically grants you 10% off on all eligible accessories.</p>
          </div>
          <div className="glass-card p-8 space-y-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Priority Auth</h3>
            <p className="text-slate-400 text-sm">Every purchase you make receives a digital certificate of authenticity stored in your profile.</p>
          </div>
          <div className="glass-card p-8 space-y-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Flash Early Access</h3>
            <p className="text-slate-400 text-sm">You are in the loop for next week's exclusive limited series drop.</p>
          </div>
        </section>
      </div>
    );
  }

  // 2. Unauthenticated Discovery Landing Page View
  return (
    <div className="flex flex-col gap-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Star className="w-3 h-3 fill-current" />
            New Season Collection Available
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
            REDESIGNING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              MODERN LUXURY
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Discover a hand-curated ecosystem of premium essentials crafted for those who demand precision, quality, and timeless aesthetic.
          </p>

          {!loading && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login" className="group bg-white text-slate-950 px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/catalog" className="glass-card hover:bg-white/5 px-10 py-5 rounded-2xl font-bold text-lg text-white transition-all">
                Browse Series
              </Link>
            </div>
          )}
        </motion.div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15),transparent_70%)]" />
      </section>

      {/* Category Showcase */}
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Curated Categories</h2>
            <p className="text-slate-400 text-lg">Every piece selected with extreme uncompromising standards.</p>
          </div>
          <Link href="/catalog" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-2 transition-colors">
            View All Series <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <Image 
                src={cat.image} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">{cat.count}</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{cat.name}</h3>
              </div>
              <Link href={`/catalog?q=${cat.name.toLowerCase()}`} className="absolute inset-0 z-10" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 md:row-span-1 glass-card p-10 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
            <Globe className="w-12 h-12 text-indigo-400 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-2">Global Luxury Shipping</h3>
            <p className="text-slate-400 max-w-md">Our logistics ecosystem is engineered for cross-border speed. Experience 48-hour delivery in major cities.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-10 flex flex-col justify-center items-center text-center"
          >
            <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Auth Guaranteed</h3>
            <p className="text-slate-400">Every single SKU is verified by our master curators for 100% authenticity.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-10 flex flex-col justify-end group"
          >
            <Zap className="w-10 h-10 text-yellow-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-2">Aura Lightning</h3>
            <p className="text-slate-400">Instant transactions with one-click payment processing.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 glass-card p-10 flex flex-col justify-center relative overflow-hidden"
          >
            <Image 
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80" 
              alt="Background" 
              fill 
              className="object-cover opacity-10 absolute inset-0 -z-10"
            />
            <Tag className="w-12 h-12 text-pink-400 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-2">The Member's Loop</h3>
            <p className="text-slate-400 max-w-md">Join over 10,000 fashion enthusiasts receiving weekly early-access drops and invitation-only style audits.</p>
          </motion.div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto w-full px-4 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 md:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">READY TO EVOLVE YOUR CLOSET?</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-medium">Be the first to know about our next limited drop. Secure your aura membership today.</p>
          <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-bold text-xl inline-block transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)]">
            Create Free Account
          </Link>
        </motion.div>
      </section>

    </div>
  );
}

