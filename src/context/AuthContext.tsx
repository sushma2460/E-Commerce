"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase/config";
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface UserData {
  role?: "user" | "admin";
  savedAddresses?: any[];
  email?: string;
  displayName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true,
  isAdmin: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && db) {
        // 1. One-time healing check for missing profiles
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          console.log("Initializing missing user profile...");
          await setDoc(userDocRef, {
            email: currentUser.email,
            displayName: currentUser.displayName || "Aura Member",
            role: "user",
            createdAt: serverTimestamp(),
            savedAddresses: []
          }, { merge: true });
        }

        // 2. Real-time synchronization
        const unsubDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          }
          setLoading(false);
        });
        
        return () => unsubDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Admin Detection logic (Fallback to email list for initial setup, then prefer DB role)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = userData?.role === "admin" || (user?.email === adminEmail);

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
