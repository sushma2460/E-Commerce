"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Loader2, Plus, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminInventory() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "Apparel",
    stock: "10",
    imageUrl: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setLoading(true);
    setSuccess(false);

    try {
      await addDoc(collection(db!, "products"), {
        name: product.name,
        price: parseFloat(product.price),
        category: product.category,
        stock: parseInt(product.stock),
        images: [product.imageUrl],
        description: product.description,
        createdAt: serverTimestamp(),
      });
      
      setSuccess(true);
      // Reset form on success
      setProduct({
        name: "", price: "", category: "Apparel", stock: "10", imageUrl: "", description: ""
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to push product to Firestore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Push to Catalog</h1>
      <p className="text-slate-400 mb-8 w-full max-w-2xl">
        Deploy new items directly to the Discovery Catalog using external Unsplash/Web image URIs.
      </p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 rounded-2xl max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Product Name</label>
              <input required type="text" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cyberpunk Hoodie" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Price (USD)</label>
              <input required type="number" step="0.01" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="89.99" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Category</label>
              <select value={product.category} onChange={e => setProduct({...product, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                <option value="Apparel" className="bg-slate-900">Apparel</option>
                <option value="Accessories" className="bg-slate-900">Accessories</option>
                <option value="Bags" className="bg-slate-900">Bags</option>
                <option value="Footwear" className="bg-slate-900">Footwear</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Initial Stock Count</label>
              <input required type="number" value={product.stock} onChange={e => setProduct({...product, stock: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="10" />
            </div>
          </div>

          <div className="space-y-1.5 border-t border-white/10 pt-6">
            <label className="text-sm font-medium text-slate-300 ml-1">External Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input required type="url" value={product.imageUrl} onChange={e => setProduct({...product, imageUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://images.unsplash.com/photo-..." />
            </div>
            <p className="text-xs text-slate-500 pl-1">Image will be natively cached and optimized via Next.js components.</p>
          </div>

          <div className="space-y-1.5 pt-2">
             <label className="text-sm font-medium text-slate-300 ml-1">Product Description</label>
             <textarea rows={3} required value={product.description} onChange={e => setProduct({...product, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="A premium quality item..." />
          </div>

          {success && (
            <div className="text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg">
              Product successfully pushed to DB! It is now live on the Catalog.
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {loading ? "Deploying..." : "Add to Catalog"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
