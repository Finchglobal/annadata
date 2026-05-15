"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Mail, ShieldCheck, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

type Step = "email" | "otp" | "done";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Step 1: Send OTP ──────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // handles both new and existing users
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
    }
    setLoading(false);
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setError(error.message);
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
  }

  // ── Google OAuth ──────────────────────────────────────────────
  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#f0f7f0] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-primary rounded-[1.5rem] shadow-2xl shadow-emerald-900/20 mb-5">
            <Logo className="text-accent" size={36} />
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tighter">Annadata AIC</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Impact Credit Platform · India</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-emerald-50/80">

          {step === "email" && (
            <>
              <h2 className="text-2xl font-black text-primary tracking-tight mb-1">Welcome</h2>
              <p className="text-sm text-gray-400 mb-8">Enter your email — we&apos;ll send a one-time code. Works for everyone: farmers, ward members &amp; admins.</p>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-5 text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Google OAuth */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 text-gray-700 py-4 rounded-2xl font-bold text-sm transition-all mb-5 shadow-sm disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">or use email OTP</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium text-sm transition-all bg-[#f8faf5] focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-accent py-4 rounded-2xl font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>
                    Send OTP Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <button onClick={() => { setStep("email"); setOtp(""); setError(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary mb-6 flex items-center gap-1">
                ← Back
              </button>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-emerald-50 rounded-3xl">
                  <Mail size={32} className="text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-primary tracking-tight mb-1 text-center">Check your email</h2>
              <p className="text-sm text-gray-400 mb-2 text-center">We sent a 6-digit code to</p>
              <p className="text-sm font-black text-primary text-center mb-8">{email}</p>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-5 text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1 text-center">6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full p-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-black text-2xl tracking-[0.5em] text-center transition-all bg-[#f8faf5] focus:bg-white"
                    placeholder="• • • • • •"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-primary text-accent py-4 rounded-2xl font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Sign In"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                Didn&apos;t receive it?{" "}
                <button onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)} className="text-primary font-black hover:underline">
                  Resend code
                </button>
              </p>
            </>
          )}
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <ShieldCheck size={12} className="text-emerald-400" />
          Passwordless · Panchayati Raj Trust Layer
        </div>
      </div>
    </div>
  );
}
