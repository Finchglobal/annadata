"use client";

import { useEffect, useState } from "react";
import { Award, Satellite, ShieldCheck, ArrowRight, LogOut, CheckCircle2, Lock, Navigation, TrendingUp, Leaf, RefreshCw, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FarmerData {
  id: string;
  full_name: string | null;
  village: string | null;
  district: string | null;
  total_family: number;
  female_members: number;
  unmarried_girls: number;
  yearly_yield: number;
  is_verified: boolean;
  is_ward_verified: boolean;
  current_tier: number;
  ndvi_score: number | null;
  w_social_score: number | null;
  reward_balance: number;
}

interface FarmData {
  area_hectares: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadData() {
    try {
      setIsRefreshing(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();

      if (profile?.role === "admin") { router.push("/admin"); return; }
      if (profile?.role === "ward_member") { router.push("/ward"); return; }

      const { data: farmerData } = await supabase
        .from("farmers")
        .select("id, full_name, village, district, total_family, female_members, unmarried_girls, yearly_yield, is_verified, is_ward_verified, current_tier, ndvi_score, w_social_score, reward_balance")
        .eq("user_id", user.id)
        .single();

      if (farmerData) {
        setFarmer(farmerData);
        const { data: farmData } = await supabase
          .from("farms").select("area_hectares")
          .eq("farmer_id", farmerData.id)
          .order("created_at", { ascending: false }).limit(1).single();
        if (farmData) setFarm(farmData);
      }
    } catch (error) {
      console.error("Dashboard failed to load:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  // Initial load and polling mechanism for Satellite data
  useEffect(() => {
    loadData();

    // Poll every 3 seconds if NDVI is exactly the default 0.65 or null, 
    // waiting for Edge Function to finish
    const interval = setInterval(() => {
      setFarmer((prev) => {
        if (prev && (prev.ndvi_score === null || prev.ndvi_score === 0.65)) {
          loadData();
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading && !farmer) {
    return (
      <div className="min-h-screen bg-[#fcfdfa] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-primary rounded-full shadow-xl animate-pulse">
            <Logo className="text-accent" size={32} />
          </div>
          <div className="text-primary font-bold animate-pulse">Loading Satellite Data...</div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-[#fcfdfa] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="p-4 bg-accent/30 rounded-2xl inline-block mb-4">
            <Logo className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-black text-primary mb-2">Welcome to Annadata</h2>
          <p className="text-gray-600 mb-8 font-medium">To calculate your impact, we need to locate your farm and record your data.</p>
          <Link href="/intake" className="inline-flex items-center gap-2 bg-primary text-accent px-8 py-4 rounded-full font-bold hover:bg-emerald-900 transition-all shadow-xl hover:scale-105 active:scale-95">
            Start Genesis Trace <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const currentTier   = farmer.current_tier || 1;
  const areaHectares  = farm?.area_hectares || 0;
  const ndviScore     = farmer.ndvi_score;
  const wSocialScore  = farmer.w_social_score;
  const rewardBalance = farmer.reward_balance || 0;
  const isSmallholder = areaHectares > 0 && areaHectares < 2.0;

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-foreground font-sans pb-20">
      {/* Header */}
      <header className="bg-primary text-accent sticky top-0 z-50 shadow-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Logo size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-black text-sm tracking-wide">FINANCIAL COMPASS</div>
              <div className="text-accent/80 text-xs font-semibold">{farmer.full_name || "Annadata"}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadData}
              className={`p-2 bg-white/10 rounded-full text-accent transition-all ${isRefreshing ? 'animate-spin' : 'hover:bg-white/20 hover:scale-110'}`}
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-black/20 rounded-full px-3 py-1">
              <span className={`w-2 h-2 rounded-full ${farmer.is_ward_verified ? 'bg-green-400' : farmer.is_verified ? 'bg-blue-400' : 'bg-yellow-400 animate-pulse'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {farmer.is_ward_verified ? 'Ward Verified' : farmer.is_verified ? 'Admin Verified' : 'Pending'}
              </span>
            </div>
            <button onClick={handleLogout} className="text-accent/60 hover:text-accent p-2 hover:bg-white/10 rounded-full transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8 mt-6">

        {/* Financial Compass Hero */}
        <section className="bg-primary text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-accent/20 transition-colors duration-700 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-bold uppercase tracking-widest mb-8">
              <Navigation size={14} /> Level {currentTier} Impact Unlocked
            </div>
            
            <div className="text-sm font-bold text-accent/80 uppercase tracking-[0.2em] mb-2">Unrecognized Value</div>
            
            {ndviScore === 0.65 ? (
              <div className="mb-8 flex flex-col items-center">
                <div className="text-3xl font-black tracking-tighter text-accent/50 animate-pulse mb-2">
                  Calculating via Satellite...
                </div>
                <div className="text-sm font-medium text-accent/60 max-w-sm">
                  Google Earth Engine is analyzing 90 days of Sentinel-2 multispectral imagery for your farm. This takes about 5 seconds.
                </div>
              </div>
            ) : (
              <div className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-accent transition-all duration-1000 scale-100 animate-in zoom-in-95">
                <span className="text-4xl md:text-5xl opacity-80 mr-1">₹</span>
                {rewardBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
            )}

            <p className="text-accent/70 font-medium max-w-lg mb-8">
              This is the true absolute value of your social and environmental labor, bridging the 84% gap extracted by the supply chain.
            </p>

            {isSmallholder && (
              <div className="w-full bg-accent text-primary px-6 py-4 rounded-2xl flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <Award className="text-alert" size={24} />
                  <div className="text-left">
                    <div className="font-black">Smallholder Dividend Active</div>
                    <div className="text-xs font-bold opacity-70">1.5× Inverse Weighting Applied</div>
                  </div>
                </div>
                <div className="font-black text-xl">+50%</div>
              </div>
            )}
            {farmer.is_ward_verified && (
              <div className="w-full mt-4 bg-green-500/20 border border-green-400/30 text-green-200 px-6 py-4 rounded-2xl flex items-center gap-3">
                <ShieldCheck size={20} />
                <div className="text-left">
                  <div className="font-black text-sm">Ward Member Verified</div>
                  <div className="text-xs opacity-70">Your impact claim is officially endorsed. Reward unlocked.</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Impact Journey */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-primary/5">
          <h3 className="text-xl font-black text-primary mb-8 flex items-center gap-2">
            <ShieldCheck className="text-accent fill-primary" /> The Impact Journey
          </h3>
          <div className="space-y-4">
            {[
              { tier: 1, label: "Genesis", sub: "Map & Farm Trace", done: currentTier >= 1 },
              { tier: 2, label: "Resilience", sub: "Social Data & Family Pulse", done: currentTier >= 2 },
              { tier: 3, label: "Verified", sub: "Agri-Log & Yield Data", done: currentTier >= 3 },
            ].map(({ tier, label, sub, done }) => {
              const active = currentTier === tier - 1;
              return (
                <div key={tier} className={`p-5 rounded-2xl border-2 transition-all ${done ? 'border-primary/20 bg-primary/5' : active ? 'border-accent bg-white shadow-sm' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${done ? 'bg-primary text-accent' : active ? 'bg-accent text-primary' : 'bg-gray-200 text-gray-500'}`}>
                        {done ? <CheckCircle2 size={20} /> : active ? tier : <Lock size={16} />}
                      </div>
                      <div>
                        <h4 className={`font-black ${done || active ? 'text-primary' : 'text-gray-500'}`}>{label}</h4>
                        <p className="text-sm font-semibold text-gray-500">{sub}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {done ? (
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Completed</span>
                      ) : active ? (
                        <Link href="/intake" className="text-sm font-bold bg-primary text-accent px-4 py-2 rounded-full hover:bg-emerald-900 transition-colors">Unlock</Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Verified Data Ledger */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-primary/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-primary flex items-center gap-2">
              <Satellite className="text-accent fill-primary" /> Verified Data Ledger
            </h3>
            {ndviScore === 0.65 && (
              <span className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <RefreshCw size={12} className="animate-spin" /> Analyzing Imagery...
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-5 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Farm Area</div>
              <div className="text-2xl font-black text-primary">{areaHectares > 0 ? `${areaHectares.toFixed(2)} ha` : "—"}</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Yearly Yield</div>
              <div className="text-2xl font-black text-primary">{farmer.yearly_yield > 0 ? `₹${farmer.yearly_yield.toLocaleString()}` : "—"}</div>
            </div>
            <div className={`p-5 rounded-2xl transition-colors ${ndviScore === 0.65 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 hover:bg-primary/5'}`}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Leaf size={10} /> NDVI Score
              </div>
              <div className="text-2xl font-black text-primary">
                {ndviScore === 0.65 ? "..." : (ndviScore != null ? ndviScore.toFixed(3) : "—")}
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingUp size={10} /> Social Multiplier
              </div>
              <div className="text-2xl font-black text-primary">
                {wSocialScore != null ? `${(wSocialScore * 100).toFixed(0)}%` : "—"}
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Users size={10} /> Dependents
              </div>
              <div className="text-2xl font-black text-primary">
                {farmer.total_family}
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Award size={10} /> Ward Status
              </div>
              <div className={`text-sm font-black mt-2 ${farmer.is_ward_verified ? 'text-green-600' : 'text-amber-600'}`}>
                {farmer.is_ward_verified ? 'Verified ✅' : 'Pending Review ⏳'}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
