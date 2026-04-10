"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartTotal: number;
  clearCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  cartTotal: 0,
  clearCart: () => {},
  loading: false,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Handshake State
  const hasLoadedFromCloud = useRef(false);
  const isSyncing = useRef(false);
  const initializedAuth = useRef(false);

  // 1. Initial Load: LocalStorage (Fast UX)
  useEffect(() => {
    const saved = localStorage.getItem("aura_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Local load error", e);
      }
    }
    setLoading(false);
  }, []);

  // 2. Auth Transition Handshake
  useEffect(() => {
    const handshake = async () => {
      if (!db) return;

      if (!user) {
        // Handle Logout
        if (initializedAuth.current) {
          console.log("Aura: Clearing local state on logout");
          setCart([]);
          localStorage.removeItem("aura_cart");
          hasLoadedFromCloud.current = false;
        }
        initializedAuth.current = true;
        return;
      }

      // Handle Login or Page Refresh
      console.log("Aura: Synchronizing with cloud for", user.uid);
      isSyncing.current = true;
      setLoading(true);

      try {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        const cloudItems: CartItem[] = cartSnap.exists() ? cartSnap.data().items : [];

        setCart((currentLocal) => {
          // If this is a fresh login transition (merging guest cart), merge.
          // If we have nothing locally, just use cloud.
          if (currentLocal.length > 0 && !hasLoadedFromCloud.current) {
            console.log("Aura: Merging guest items into account...");
            const merged = [...cloudItems];
            currentLocal.forEach(lItem => {
              const idx = merged.findIndex(cItem => cItem.id === lItem.id);
              if (idx > -1) {
                merged[idx].quantity += lItem.quantity;
              } else {
                merged.push(lItem);
              }
            });
            return merged;
          }
          // Otherwise Cloud is the source of truth
          return cloudItems;
        });

        hasLoadedFromCloud.current = true;
      } catch (e) {
        console.error("Cloud handshake failed", e);
      } finally {
        isSyncing.current = false;
        setLoading(false);
        initializedAuth.current = true;
      }
    };

    handshake();
  }, [user]);

  // 3. Selective Persistence
  useEffect(() => {
    // SECURITY GUARD: Never write if we are still fetching or haven't merged yet
    if (loading || isSyncing.current || !initializedAuth.current) return;
    
    // Authenticated users must have successfully loaded from cloud at least once 
    // before we allow them to overwrite their cloud data with a local state.
    if (user && !hasLoadedFromCloud.current) return;

    // Persist to Local
    localStorage.setItem("aura_cart", JSON.stringify(cart));

    // Persist to Cloud
    if (user && db) {
      const persist = async () => {
        try {
          await setDoc(doc(db, "carts", user.uid), {
            items: cart,
            updatedAt: serverTimestamp(), // Use server time for consistency
          }, { merge: true });
        } catch (e) {
          console.error("Cloud persistence failure", e);
        }
      };
      persist();
    }
  }, [cart, user, loading]);

  const addToCart = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => 
          p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);



