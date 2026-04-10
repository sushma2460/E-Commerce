"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Loader2, Users, ShieldCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SystemUser {
  id: string; // auth uid
  email: string;
  role: "user" | "admin";
  displayName?: string;
}

export default function AdminUsers() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const snapshot = await getDocs(collection(db!, "users"));
          const fetched: SystemUser[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            fetched.push({ id: d.id, ...data } as SystemUser);
          });
          setUsers(fetched);
        } catch (e) {
          console.error("Failed to fetch users", e);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  const toggleAdmin = async (userId: string, currentRole: string) => {

    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateDoc(doc(db!, "users", userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (e) {
      console.error("Failed to update role", e);
      alert("Permission denied. Check Firestore security rules.");
    }
  };

  if (authLoading || loading) return (
    <div className="py-32 flex justify-center items-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="py-32 text-center text-white">
      <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold">Access Revoked</h1>
      <p className="text-slate-400 mt-2">Administrative privileges are required to view governance data.</p>
    </div>
  );

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-indigo-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-4 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4">
            <Users className="w-10 h-10 text-indigo-500" />
            User Governance
          </h1>
        </div>
        <span className="text-slate-500 font-bold uppercase tracking-widest bg-white/5 py-2 px-4 rounded-xl border border-white/10">
          {users.length} Registered Identities
        </span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-6 text-xs uppercase tracking-widest font-black text-slate-500">Identity</th>
                <th className="p-6 text-xs uppercase tracking-widest font-black text-slate-500">Privilege Level</th>
                <th className="p-6 text-xs uppercase tracking-widest font-black text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <p className="text-white font-bold">{u.displayName || "Anonymous Member"}</p>
                    <p className="text-slate-500 text-xs font-mono mt-1">{u.email}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === "admin" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-slate-500/20 text-slate-400 border border-white/10"
                      }`}>
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => toggleAdmin(u.id, u.role || "user")}
                      className={`text-xs font-bold py-2 px-4 rounded-lg transition-all ${u.role === "admin" ? "text-rose-400 hover:bg-rose-500/10" : "text-indigo-400 hover:bg-indigo-500/10"
                        }`}
                    >
                      {u.role === "admin" ? "Revoke Admin" : "Promote to Admin"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
