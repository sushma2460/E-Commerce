"use client";

import { useEffect, useState, Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import ProductCard, { Product } from "@/components/products/ProductCard";
import { Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { ProductCardSkeleton } from "@/components/ui/Skeleton";

function CatalogContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!db) throw new Error("Firestore not initialized");
        const querySnapshot = await getDocs(collection(db, "products"));
        const items: Product[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(items);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setTimeout(() => setLoading(false), 800); // Slight delay for smoother animation feel
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query)
  );

  return (
    <div className="py-12 min-h-screen">
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">Premium Collection</h1>
          <p className="text-slate-400 max-w-xl">Curated items from our exclusive catalog. Find your next favorite piece seamlessly.</p>
        </div>
        
        {/* Helper feature for database seeding */}
        <button 
          onClick={async () => {
            await fetch('/api/seed', { method: 'POST' });
            window.location.reload();
          }}
          className="glass-card hover:bg-white/10 px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors self-center md:self-auto"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          Seed Dummy Data
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-32 glass-card rounded-2xl">
          <p className="text-xl text-slate-300 font-medium mb-4">No products found matching "{query}".</p>
          <p className="text-slate-400">Try adjusting your style search or mapping different terms.</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
