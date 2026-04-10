"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Loader2, PackageSearch, CheckCircle2, Edit3, X, Save, Truck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  totalAmount: number;
  paymentId: string;
  status: string;
  userEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
  };
  items: any[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Edit State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    userEmail: "",
    street: "",
    city: "",
    country: ""
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      if (!db) return;
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetched: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Firestore Timestamps to plain numbers for Next.js serialization
        if (data.createdAt && typeof data.createdAt.toMillis === "function") {
          data.createdAt = data.createdAt.toMillis();
        }
        fetched.push({ id: doc.id, ...data } as Order);
      });
      setOrders(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!db) return;
    setActionLoading(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      });
      await fetchOrders();
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      userEmail: order.userEmail,
      street: order.shippingAddress?.street || "",
      city: order.shippingAddress?.city || "",
      country: order.shippingAddress?.country || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!db || !editingOrder) return;
    setActionLoading(editingOrder.id);
    try {
      await updateDoc(doc(db, "orders", editingOrder.id), {
        userEmail: editForm.userEmail,
        shippingAddress: {
          street: editForm.street,
          city: editForm.city,
          country: editForm.country
        }
      });
      setEditingOrder(null);
      await fetchOrders();
    } catch (e) {
      console.error("Failed to update order", e);
      alert("Failed to save changes");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full relative">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Order Management</h1>
      <p className="text-slate-400 mb-8 w-full max-w-2xl">
        Monitor transaction lifecycles and modify shipping parameters natively.
      </p>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Synchronizing...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
          <PackageSearch className="w-16 h-16 text-slate-600 mb-4" />
          <p className="text-xl font-medium text-white mb-2">No Transactions Found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-semibold">{order.userEmail}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                    order.status === "Delivered" ? "bg-emerald-500/20 text-emerald-400" : 
                    order.status === "Shipped" ? "bg-blue-500/20 text-blue-400" :
                    "bg-amber-500/20 text-amber-400"
                  }`}>
                    {order.status || "Processing"}
                  </span>
                </div>
                <div className="text-sm text-slate-400 font-mono mb-3"># {order.paymentId || "rzp_manual"}</div>
                
                <div className="text-sm text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Shipping Details</p>
                    <p>{order.shippingAddress?.street}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Package</p>
                    <p>{order.items?.length} items in luxury crate</p>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center justify-between md:items-end gap-4 border-t md:border-t-0 border-white/10 pt-4 md:pt-0 shrink-0">
                <div className="text-2xl font-bold tracking-tight text-white">
                  ${order.totalAmount?.toFixed(2)}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(order)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/10"
                    title="Edit Order"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {(!order.status || order.status === "Processing") && (
                    <button 
                      onClick={() => updateStatus(order.id, "Shipped")}
                      disabled={actionLoading === order.id}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-2"
                    >
                      <Truck className="w-3.5 h-3.5" /> Mark Shipped
                    </button>
                  )}

                  {order.status === "Shipped" && (
                    <button 
                      onClick={() => updateStatus(order.id, "Delivered")}
                      disabled={actionLoading === order.id}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                    </button>
                  )}

                  {order.status === "Delivered" && (
                    <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Delivered
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Order Details</h2>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Customer Email</label>
                <input 
                  type="email"
                  value={editForm.userEmail}
                  onChange={(e) => setEditForm({ ...editForm, userEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Street Address</label>
                  <input 
                    type="text"
                    value={editForm.street}
                    onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">City</label>
                    <input 
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Country</label>
                    <input 
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setEditingOrder(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={actionLoading === editingOrder.id}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                {actionLoading === editingOrder.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

