"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Loader2, Users, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SystemUser {
  id: string;
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
          // ✅ FIXED (db!)
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
      // ✅ FIXED (db!)
      await updateDoc(doc(db!, "users", userId), { role: newRole });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as "user" | "admin" } : u
        )
      );
    } catch (e) {
      console.error("Failed to update role", e);
      alert("Permission denied. Check Firestore rules.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-32 flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-32 text-center text-white">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Access Revoked</h1>
        <p className="text-slate-400 mt-2">
          Administrative privileges required.
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="text-indigo-400 flex items-center gap-2 text-sm font-bold mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            User Governance
          </h1>
        </div>

        <span className="text-slate-400">
          {users.length} Users
        </span>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <motion.tr key={u.id}>
                <td className="p-4">
                  <p className="text-white font-bold">
                    {u.displayName || "User"}
                  </p>
                  <p className="text-sm text-slate-400">{u.email}</p>
                </td>

                <td className="p-4">
                  {u.role}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleAdmin(u.id, u.role)}
                    className="text-indigo-400"
                  >
                    {u.role === "admin"
                      ? "Revoke Admin"
                      : "Make Admin"}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}