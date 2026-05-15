"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Role-based redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else if (profile?.role === "ward_member") {
        router.push("/ward");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-primary rounded-[1.5rem] shadow-xl shadow-emerald-900/20 mb-4">
            <Leaf className="text-accent" size={36} />
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tighter italic">Annadata AIC</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Impact Credit System · India</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-emerald-50">
          <h2 className="text-2xl font-black text-primary tracking-tighter mb-1 italic">Welcome Back</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Sign in to your wallet — farmers, ward members, and admins all use the same portal.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium text-sm transition-all bg-[#f8faf5] focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium text-sm transition-all bg-[#f8faf5] focus:bg-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-accent py-4 rounded-2xl font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-emerald-50" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-emerald-50" />
          </div>

          <p className="text-center text-sm text-gray-400">
            New farmer?{" "}
            <Link href="/signup" className="text-primary font-black hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <ShieldCheck size={12} className="text-emerald-400" />
          Secured by Supabase Auth · Panchayati Raj Trust Layer
        </div>
      </div>
    </div>
  );
}
