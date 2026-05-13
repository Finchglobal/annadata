"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, LogOut, CheckCircle, XCircle, Clock, Leaf, User } from "lucide-react";

interface PendingFarmer {
  id: string;
  full_name: string | null;
  village: string | null;
  district: string | null;
  total_family: number;
  female_members: number;
  unmarried_girls: number;
  yearly_yield: number;
  is_verified: boolean;
  farmer_verifications: { id: string; status: string; notes: string | null }[];
}

export default function WardPortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "portal">("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Portal state
  const [wardMember, setWardMember] = useState<{ full_name: string; ward_number: string } | null>(null);
  const [farmers, setFarmers] = useState<PendingFarmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: wm } = await supabase
        .from("ward_members")
        .select("full_name, ward_number")
        .eq("user_id", user.id)
        .single();
      if (wm) {
        setWardMember(wm);
        setStep("portal");
        loadFarmers(wm.ward_number);
      }
    });
  }, []);

  async function loadFarmers(wardNumber: string) {
    setLoading(true);
    // Fetch farmers in this ward with their verification status
    const { data } = await supabase
      .from("farmers")
      .select(`
        id, full_name, village, district,
        total_family, female_members, unmarried_girls,
        yearly_yield, is_verified,
        farmer_verifications (id, status, notes)
      `)
      .eq("district", wardNumber) // Using district field to store ward for MVP
      .order("created_at", { ascending: false });

    setFarmers((data as PendingFarmer[]) || []);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setLoginLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: wm } = await supabase
      .from("ward_members")
      .select("full_name, ward_number")
      .eq("user_id", user.id)
      .single();

    if (!wm) {
      setLoginError("No Ward Member profile found for this account. Please contact admin.");
      setLoginLoading(false);
      return;
    }

    setWardMember(wm);
    setStep("portal");
    loadFarmers(wm.ward_number);
    setLoginLoading(false);
  }

  async function handleVerification(farmerId: string, verificationId: string | undefined, status: "approved" | "rejected") {
    setActionLoading(farmerId);
    const note = notes[farmerId] || "";

    if (verificationId) {
      await supabase
        .from("farmer_verifications")
        .update({ status, notes: note, verified_at: new Date().toISOString() })
        .eq("id", verificationId);
    }

    if (status === "approved") {
      await supabase.from("farmers").update({ is_verified: true }).eq("id", farmerId);
    }

    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id !== farmerId) return f;
        return {
          ...f,
          is_verified: status === "approved",
          farmer_verifications: [{ id: verificationId || "", status, notes: note }],
        };
      })
    );
    setActionLoading(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (step === "login") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-primary/10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary rounded-2xl">
              <ShieldCheck className="text-accent" size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-primary mb-1">Ward Member Portal</h1>
          <p className="text-center text-gray-500 mb-8 text-sm">Panchayati Raj Validation System</p>

          {loginError && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{loginError}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="wardmember@panchayat.gov.in" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loginLoading}
              className="w-full bg-primary text-accent py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loginLoading ? "Signing in..." : "Login to Ward Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-accent px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-accent/20 rounded-lg">
              <ShieldCheck size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-bold text-sm">Ward Member Portal</div>
              {wardMember && (
                <div className="text-accent/70 text-xs">{wardMember.full_name} · Ward {wardMember.ward_number}</div>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-accent/70 hover:text-accent">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Pending Farmer Verifications</h2>
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
            {farmers.filter(f => !f.is_verified).length} pending
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-primary/50 animate-pulse">Loading farmers...</div>
        )}

        {!loading && farmers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Leaf size={40} className="text-primary/20 mx-auto mb-3" />
            <p className="text-gray-500">No farmers in your ward yet.</p>
          </div>
        )}

        {!loading && farmers.map((farmer) => {
          const verification = farmer.farmer_verifications?.[0];
          const isPending = !verification || verification.status === "pending";
          const isApproved = verification?.status === "approved";
          const isRejected = verification?.status === "rejected";

          return (
            <div key={farmer.id} className={`bg-white rounded-2xl border p-6 shadow-sm ${isApproved ? "border-green-200" : isRejected ? "border-red-200" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-full text-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-primary">{farmer.full_name || "Unnamed Farmer"}</div>
                    <div className="text-xs text-gray-500">{farmer.village || "—"}, {farmer.district || "—"}</div>
                  </div>
                </div>
                {isApproved && (
                  <span className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                    <CheckCircle size={12} /> Verified
                  </span>
                )}
                {isRejected && (
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                    <XCircle size={12} /> Rejected
                  </span>
                )}
                {isPending && (
                  <span className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-200">
                    <Clock size={12} /> Pending
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total Family", value: farmer.total_family },
                  { label: "Female Members", value: farmer.female_members },
                  { label: "Unmarried Girls", value: farmer.unmarried_girls },
                  { label: "Yearly Yield", value: `₹${farmer.yearly_yield?.toLocaleString()}` },
                ].map((d) => (
                  <div key={d.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-primary">{d.value}</div>
                    <div className="text-xs text-gray-500">{d.label}</div>
                  </div>
                ))}
              </div>

              {isPending && (
                <div className="space-y-3">
                  <textarea
                    value={notes[farmer.id] || ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [farmer.id]: e.target.value }))}
                    className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    rows={2}
                    placeholder="Add verification notes (optional)..."
                  />
                  <div className="flex gap-3">
                    <button
                      disabled={actionLoading === farmer.id}
                      onClick={() => handleVerification(farmer.id, verification?.id, "approved")}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} /> {actionLoading === farmer.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      disabled={actionLoading === farmer.id}
                      onClick={() => handleVerification(farmer.id, verification?.id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
