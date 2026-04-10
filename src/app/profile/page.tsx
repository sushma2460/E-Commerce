"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert, Package, CheckCircle2, ShoppingBag, Truck, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  items: any[];
  createdAt: any;
  paymentId?: string;
}

export default function UserProfile() {
  const { user, userData, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA"
  });

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "orders"),
        where("userEmail", "==", user.email)
      );

      const fetchOrders = async () => {
        try {
          const snapshot = await getDocs(q);
          const fetched: Order[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.createdAt && typeof data.createdAt.toMillis === "function") {
              data.createdAt = data.createdAt.toMillis();
            }
            fetched.push({ id: doc.id, ...data } as Order);
          });
          
          // Client-side sort to avoid complex index requirements
          setOrders(fetched.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
        } catch (e) {
          console.error("Failed to fetch order history", e);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const currentAddresses = userData?.savedAddresses || [];
    const updatedAddresses = [...currentAddresses, newAddress];

    try {
      await setDoc(doc(db, "users", user.uid), {
        savedAddresses: updatedAddresses
      }, { merge: true });
      setShowAddressModal(false);
      setNewAddress({ label: "Home", street: "", city: "", state: "", zip: "", country: "USA" });
    } catch (e) {
      console.error("Failed to save address", e);
      alert("Error saving address. Please try again.");
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!user || !userData?.savedAddresses) return;
    const updatedAddresses = userData.savedAddresses.filter((_: any, i: number) => i !== index);
    try {
      await setDoc(doc(db, "users", user.uid), {
        savedAddresses: updatedAddresses
      }, { merge: true });
    } catch (e) {
      console.error("Failed to delete address", e);
    }
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="py-32 flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Handle Unauthorized Access
  if (!authLoading && !user) {
    return (
      <div className="py-32 min-h-screen max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Account Synchronization Required</h1>
        <p className="text-slate-400 max-w-md mb-8">You must be securely signed in to your Aura account to view your purchase history and artisanal collection.</p>
        <Link href="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl transition-all">
          Sign In to Access
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto pt-24">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative">
          <Image src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt="Profile" fill className="object-cover" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            {user?.displayName || "Member"}
          </h1>
          <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Aura Elite Member since {new Date(user?.metadata.creationTime || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-8 border-b border-white/10 mb-10 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("orders")}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "orders" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
        >
          Orders
          {activeTab === "orders" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("addresses")}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "addresses" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
        >
          Address Book
          {activeTab === "addresses" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full" />}
        </button>
      </div>

      {activeTab === "orders" ? (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Your artisanal collection is currently empty.</p>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={order.id} className="glass-card overflow-hidden group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 border-b border-white/5">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Transaction Reference</p>
                    <p className="text-white font-mono">{order.id}</p>
                  </div>
                  <div className="space-y-1 md:text-right">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Consigned Total</p>
                    <p className="text-2xl font-black text-white">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 ${
                      order.status === "Delivered" ? "bg-emerald-500/20 text-emerald-400" :
                      order.status === "Shipped" ? "bg-indigo-500/20 text-indigo-400" :
                      "bg-amber-500/20 text-amber-500"
                    }`}>
                      {order.status === "Delivered" ? <CheckCircle2 className="w-4 h-4" /> : 
                       order.status === "Shipped" ? <Truck className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      {order.status}
                    </div>
                    <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Saved Locations</h2>
            <button 
              onClick={() => setShowAddressModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all"
            >
              Add New Address
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!userData?.savedAddresses || userData.savedAddresses.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center">
                <p className="text-slate-400">No saved addresses found. Add one for faster checkout.</p>
              </div>
            ) : (
              userData.savedAddresses.map((addr: any, idx: number) => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={idx} className="glass-card p-6 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full mb-2 inline-block">
                        {addr.label || "Home"}
                      </span>
                      <p className="text-white font-bold text-lg">{addr.street}</p>
                      <p className="text-slate-400 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-slate-400 text-sm tracking-widest">{addr.country}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(idx)}
                      className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-lg glass-card p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Add New Destination</h3>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Label (e.g. Home, Office)</label>
                <input required type="text" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                <input required type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">City</label>
                  <input required type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">State</label>
                  <input required type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ZIP</label>
                  <input required type="text" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Country</label>
                  <input required type="text" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">
                  Save to Profile
                </button>
                <button type="button" onClick={() => setShowAddressModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
