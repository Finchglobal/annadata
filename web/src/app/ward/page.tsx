"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, LogOut, CheckCircle, XCircle, Clock, Leaf, User, MapPin, ArrowRight } from "lucide-react";

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
  const [step, setStep] = useState<"login" | "signup" | "portal">("login");

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

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

  async function loadFarmers(wardNum: string) {
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
      .eq("district", wardNum) // Using district field as ward number for MVP mapping
      .order("created_at", { ascending: false });

    setFarmers((data as PendingFarmer[]) || []);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
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
      setAuthError("No Ward Member profile found. If you are a new member, please sign up.");
      setAuthLoading(false);
      return;
    }

    setWardMember(wm);
    setStep("portal");
    loadFarmers(wm.ward_number);
    setAuthLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    // 1. Create Auth User
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'ward_member' } }
    });

    if (authErr) {
      setAuthError(authErr.message);
      setAuthLoading(false);
      return;
    }

    if (!authData.user) {
      setAuthError("Signup failed. Please try again.");
      setAuthLoading(false);
      return;
    }

    // 2. Create Ward Member Profile
    const { error: profileErr } = await supabase
      .from("ward_members")
      .insert({
        user_id: authData.user.id,
        full_name: fullName,
        ward_number: wardNumber,
        district: district,
        state: state
      });

    if (profileErr) {
      setAuthError(`Profile creation failed: ${profileErr.message}`);
      setAuthLoading(false);
      return;
    }

    setWardMember({ full_name: fullName, ward_number: wardNumber });
    setStep("portal");
    loadFarmers(wardNumber);
    setAuthLoading(false);
  }

  async function handleVerification(farmerId: string, verificationId: string | undefined, status: "approved" | "rejected") {
    setActionLoading(farmerId);
    const note = notes[farmerId] || "";

    if (verificationId) {
      await supabase
        .from("farmer_verifications")
        .update({ status, notes: note, verified_at: new Date().toISOString() })
        .eq("id", verificationId);
    } else {
       // Create one if it doesn't exist (though RPC should have created it)
       const { data: wm } = await supabase.from('ward_members').select('id').eq('user_id', (await supabase.auth.getUser()).data.user?.id).single();
       if (wm) {
          await supabase.from("farmer_verifications").insert({
            farmer_id: farmerId,
            ward_member_id: wm.id,
            status,
            notes: note,
            verified_at: new Date().toISOString()
          });
       }
    }

    if (status === "approved") {
      await supabase.from("farmers").update({ is_verified: true }).eq("id", farmerId);
    }

    // Refresh list
    if (wardMember) loadFarmers(wardMember.ward_number);
    setActionLoading(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (step === "login" || step === "signup") {
    return (
      <div className="min-h-screen bg-[#f8faf5] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-emerald-50">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary rounded-[1.5rem] shadow-lg shadow-emerald-900/20">
              <ShieldCheck className="text-accent" size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-primary tracking-tighter mb-1">Ward Member Portal</h1>
          <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10">Panchayati Raj Trust Layer</p>

          <div className="flex bg-emerald-50 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setStep("login"); setAuthError(null); }}
              className={`flex-1 py-2 text-sm font-black rounded-xl transition-all ${step === "login" ? "bg-white text-primary shadow-sm" : "text-emerald-900/40"}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setStep("signup"); setAuthError(null); }}
              className={`flex-1 py-2 text-sm font-black rounded-xl transition-all ${step === "signup" ? "bg-white text-primary shadow-sm" : "text-emerald-900/40"}`}
            >
              Signup
            </button>
          </div>

          {authError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold border border-red-100">{authError}</div>}

          {step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Official Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium text-sm transition-all"
                  placeholder="wardmember@panchayat.gov.in" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Access Key</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium text-sm transition-all"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={authLoading}
                className="w-full bg-primary text-accent py-4 rounded-2xl font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group">
                {authLoading ? "Verifying..." : "Login to Portal"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="Hon. Ramesh Kumar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Ward Number</label>
                  <input type="text" required value={wardNumber} onChange={(e) => setWardNumber(e.target.value)}
                    className="w-full p-3 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                    placeholder="12" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">District</label>
                  <input type="text" required value={district} onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-3 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                    placeholder="Atarra" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="name@panchayat.gov.in" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={authLoading}
                className="w-full bg-primary text-accent py-4 rounded-2xl font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 mt-4">
                {authLoading ? "Initializing..." : "Create Ward Member Profile"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfa]">
      {/* Header */}
      <header className="bg-primary text-accent px-6 py-5 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-accent/20 rounded-xl">
              <ShieldCheck size={24} className="text-accent" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tighter leading-none">WARD PORTAL</div>
              {wardMember && (
                <div className="text-accent/50 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {wardMember.full_name} · Ward {wardMember.ward_number}
                </div>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent/60 hover:text-accent transition-colors bg-white/10 px-4 py-2 rounded-full">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        <div className="flex items-center justify-between">
          <div>
             <h2 className="text-3xl font-black text-primary tracking-tighter">Farmer Verification Queue</h2>
             <p className="text-sm text-gray-400 font-medium mt-1">Reviewing submissions for Ward {wardMember?.ward_number || '—'}</p>
          </div>
          <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest">
            {farmers.filter(f => !f.is_verified).length} submissions pending
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
               <div key={i} className="h-48 bg-gray-100 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && farmers.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-emerald-50 flex flex-col items-center">
            <div className="p-6 bg-emerald-50 rounded-full mb-6">
               <Leaf size={48} className="text-emerald-200" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Queue is Empty</h3>
            <p className="text-gray-400 max-w-xs mx-auto">No new farmer submissions detected in your ward jurisdiction.</p>
          </div>
        )}

        {!loading && farmers.map((farmer) => {
          const verification = farmer.farmer_verifications?.[0];
          const isPending = !verification || verification.status === "pending";
          const isApproved = verification?.status === "approved";
          const isRejected = verification?.status === "rejected";

          return (
            <div key={farmer.id} className={`bg-white rounded-[2.5rem] border-2 p-8 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 ${isApproved ? "border-green-100 bg-green-50/10" : isRejected ? "border-red-100" : "border-emerald-50 shadow-sm"}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center text-primary shadow-inner">
                    <User size={32} />
                  </div>
                  <div>
                    <div className="font-black text-2xl text-primary tracking-tight">{farmer.full_name || "Unnamed Farmer"}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                       <MapPin size={12} /> {farmer.village || "—"} · {farmer.district || "—"}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {isApproved && (
                    <span className="flex items-center gap-2 text-emerald-700 bg-emerald-100 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-200">
                      <CheckCircle size={14} /> Verified
                    </span>
                  )}
                  {isRejected && (
                    <span className="flex items-center gap-2 text-red-600 bg-red-50 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100">
                      <XCircle size={14} /> Rejected
                    </span>
                  )}
                  {isPending && (
                    <span className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-yellow-100">
                      <Clock size={14} /> Needs Review
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Family Size", value: farmer.total_family },
                  { label: "Female Members", value: farmer.female_members },
                  { label: "Unmarried Girls", value: farmer.unmarried_girls },
                  { label: "Reported Yield", value: `₹${farmer.yearly_yield?.toLocaleString()}` },
                ].map((d) => (
                  <div key={d.label} className="bg-[#f8faf5] border border-emerald-50 rounded-3xl p-5 group hover:bg-white hover:border-emerald-200 transition-all">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{d.label}</div>
                    <div className="text-xl font-black text-primary">{d.value}</div>
                  </div>
                ))}
              </div>

              {isPending && (
                <div className="space-y-4">
                  <div className="relative">
                     <textarea
                       value={notes[farmer.id] || ""}
                       onChange={(e) => setNotes((prev) => ({ ...prev, [farmer.id]: e.target.value }))}
                       className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none font-medium"
                       rows={3}
                       placeholder="Add verification notes (e.g. Identity confirmed via Aadhaar)..."
                     />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      disabled={actionLoading === farmer.id}
                      onClick={() => handleVerification(farmer.id, verification?.id, "approved")}
                      className="flex-1 flex items-center justify-center gap-3 bg-primary text-accent py-4 rounded-2xl font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 disabled:opacity-50"
                    >
                      <CheckCircle size={20} /> {actionLoading === farmer.id ? "Syncing..." : "Approve Submission"}
                    </button>
                    <button
                      disabled={actionLoading === farmer.id}
                      onClick={() => handleVerification(farmer.id, verification?.id, "rejected")}
                      className="sm:w-1/3 flex items-center justify-center gap-3 bg-red-50 text-red-600 border-2 border-red-100 py-4 rounded-2xl font-black hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      <XCircle size={20} /> Reject
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
