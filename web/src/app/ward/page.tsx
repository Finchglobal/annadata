"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, LogOut, CheckCircle, XCircle, Clock, User, MapPin, ArrowRight, LayoutGrid } from "lucide-react";
import Logo from "@/components/Logo";

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

interface WardAssignment {
  id: string;
  ward_number: string;
  district: string;
  state: string;
}

export default function WardPortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "portal">("login");

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Portal state
  const [wardMember, setWardMember] = useState<{ full_name: string } | null>(null);
  const [assignments, setAssignments] = useState<WardAssignment[]>([]);
  const [selectedWard, setSelectedWard] = useState<WardAssignment | null>(null);
  const [farmers, setFarmers] = useState<PendingFarmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const { data: wmAssignments } = await supabase.from("ward_assignments").select("*").eq("user_id", user.id);

      if (profile && wmAssignments && wmAssignments.length > 0) {
        setWardMember(profile);
        setAssignments(wmAssignments);
        setSelectedWard(wmAssignments[0]);
        setStep("portal");
        loadFarmers(wmAssignments[0].ward_number);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedWard) {
      loadFarmers(selectedWard.ward_number);
    }
  }, [selectedWard]);

  async function loadFarmers(wardNum: string) {
    setLoading(true);
    const { data } = await supabase
      .from("farmers")
      .select(`
        id, full_name, village, district,
        total_family, female_members, unmarried_girls,
        yearly_yield, is_verified,
        farmer_verifications (id, status, notes)
      `)
      .eq("district", wardNum)
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

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    const { data: wmAssignments } = await supabase.from("ward_assignments").select("*").eq("user_id", user.id);

    if (!profile || !wmAssignments || wmAssignments.length === 0) {
      setAuthError("No Ward assignments found. Please contact your Super Admin.");
      setAuthLoading(false);
      return;
    }

    setWardMember(profile);
    setAssignments(wmAssignments);
    setSelectedWard(wmAssignments[0]);
    setStep("portal");
    loadFarmers(wmAssignments[0].ward_number);
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
       // Ward member verification record not created via RPC — skip for MVP
    }

    if (status === "approved") {
      await supabase.from("farmers").update({ is_verified: true }).eq("id", farmerId);
    }

    if (selectedWard) loadFarmers(selectedWard.ward_number);
    setActionLoading(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (step === "login") {
    return (
      <div className="min-h-screen bg-[#f8faf5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-emerald-50">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary rounded-[1.5rem] shadow-lg shadow-emerald-900/20">
              <ShieldCheck className="text-accent" size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tighter mb-1 italic">Multi-Ward Access</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-10">Secured Ward Member Portal</p>

          {authError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold border border-red-100">{authError}</div>}

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Official ID (Email)</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium text-sm transition-all"
                placeholder="wardmember@panchayat.gov.in" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Access Key</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-emerald-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium text-sm transition-all"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={authLoading}
              className="w-full bg-primary text-accent py-4 rounded-2xl font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group">
              {authLoading ? "Initializing..." : "Login to Wards"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfa]">
      {/* Header */}
      <header className="bg-primary text-accent px-6 py-5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-accent/20 rounded-xl">
              <ShieldCheck size={24} className="text-accent" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tighter leading-none italic">WARD LEADER PORTAL</div>
              {wardMember && (
                <div className="text-accent/50 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {wardMember.full_name} · Multi-Ward Admin
                </div>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent/60 hover:text-accent transition-colors bg-white/10 px-4 py-2 rounded-full">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Ward Selector Bar */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3 ml-2">
              <LayoutGrid className="text-emerald-600" size={20} />
              <span className="text-xs font-black text-primary uppercase tracking-widest">Select active jurisdiction</span>
           </div>
           <div className="flex flex-wrap gap-2">
              {assignments.map((a) => (
                 <button
                   key={a.id}
                   onClick={() => setSelectedWard(a)}
                   className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedWard?.id === a.id ? "bg-primary text-accent shadow-lg shadow-emerald-900/20" : "bg-emerald-50 text-emerald-900/40 hover:bg-emerald-100"}`}
                 >
                   Ward {a.ward_number} · {a.district}
                 </button>
              ))}
           </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
             <h2 className="text-3xl font-black text-primary tracking-tighter">Queue: {selectedWard?.district}, Ward {selectedWard?.ward_number}</h2>
             <p className="text-sm text-gray-500 font-medium mt-1 italic">Showing farmers joined in this specific ward.</p>
          </div>
          <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest">
            {farmers.filter(f => !f.is_verified).length} pending
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
               <Logo size={48} className="text-emerald-200" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2 italic">No Farmers in Ward {selectedWard?.ward_number}</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">No submissions detected for this jurisdiction yet.</p>
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
                    <div className="font-black text-2xl text-primary tracking-tight italic">{farmer.full_name || "Unnamed Farmer"}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
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
                      <Clock size={14} /> Review Needed
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
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{d.label}</div>
                    <div className="text-xl font-black text-primary">{d.value}</div>
                  </div>
                ))}
              </div>

              {isPending && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
                  <div className="text-sm font-bold text-primary/70 px-4">
                    Verify Level 1 Genesis Claim
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      disabled={actionLoading === farmer.id}
                      onClick={() => handleVerification(farmer.id, verification?.id, "rejected")}
                      className="px-6 py-3 flex items-center justify-center gap-2 text-red-600 bg-white border border-red-100 rounded-full font-black hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                    <button
                      disabled={actionLoading === farmer.id}
                      onClick={() => handleVerification(farmer.id, verification?.id, "approved")}
                      className="px-8 py-3 flex items-center justify-center gap-2 bg-primary text-accent rounded-full font-black hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50"
                    >
                      <CheckCircle size={18} /> {actionLoading === farmer.id ? "Syncing..." : "1-Tap Approve"}
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
