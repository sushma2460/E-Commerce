"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Plus, Lock, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/components/products/ProductCard";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
    }, quantity);
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="py-12 md:py-20 min-h-screen max-w-6xl mx-auto px-4 md:px-0">
      <Link href="/catalog" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Image Carousel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden glass-card p-2"
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/5">
            <Image 
              src={product.images[0] || "https://images.unsplash.com/photo-placeholder"} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
          </div>
        </motion.div>

        {/* Right: Product Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-2">
            <span className="text-sm font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {product.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 mt-4">
            {product.name}
          </h1>
          
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8 border-b border-white/10 pb-8">
            ${product.price.toFixed(2)}
          </div>

          <div className="prose prose-invert mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-slate-400 leading-relaxed">
              {product.description || "A premium, hand-curated item crafted perfectly to match your style parameters. Designed meticulously with industry-leading precision."}
            </p>
          </div>

          {/* Add To Cart Form */}
          <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Quantity</span>
              <div className="flex items-center gap-4 bg-slate-900 rounded-lg p-1 border border-white/10">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-4 text-center font-medium text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Availability</span>
              {product.stock > 0 ? (
                <span className="text-emerald-400 font-medium">In Stock ({product.stock} left)</span>
              ) : (
                <span className="text-rose-400 font-medium">Out of Stock</span>
              )}
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                product.stock === 0 
                  ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
                  : added 
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              }`}
            >
              {product.stock === 0 ? (
                "Out of Stock"
              ) : !user ? (
                <>
                  <Lock className="w-5 h-5" /> Sign In to Buy
                </>
              ) : added ? (
                <>
                  <Check className="w-5 h-5" /> Added to Cart
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Add to Cart — ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
