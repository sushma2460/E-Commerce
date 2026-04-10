import { motion } from "framer-motion";
import { Plus, Check, Lock } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
    }, 1);
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card group flex flex-col overflow-hidden hover:border-indigo-500/50 transition-colors"
    >
      <Link href={`/catalog/${product.id}`} className="relative aspect-[4/5] w-full bg-white/5 overflow-hidden block">
        <Image 
          src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-rose-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white tracking-wide shadow-lg cursor-default">
            Low Stock
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <Link href={`/catalog/${product.id}`}>
              <h3 className="font-semibold text-slate-100 leading-tight hover:text-indigo-400 transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>
          <span className="font-bold text-white whitespace-nowrap">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <div className="mt-auto pt-4">
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              product.stock === 0 
                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                : added 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/10 hover:bg-indigo-600 border border-white/5 hover:border-indigo-500 hover:text-white text-slate-300"
            }`}
          >
            {product.stock === 0 ? (
              "Out of Stock"
            ) : !user ? (
              <>
                <Lock className="w-4 h-4" /> Sign In to Buy
              </>
            ) : added ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
