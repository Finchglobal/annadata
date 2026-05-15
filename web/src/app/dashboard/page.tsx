"use client";

import { useEffect, useState } from "react";
import { Award, Satellite, ShieldCheck, ArrowRight, LogOut, CheckCircle2, Lock, Navigation } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FarmerData {
  id: string;
  full_name: string | null;
  village: string | null;
  total_family: number;
  female_members: number;
  unmarried_girls: number;
  yearly_yield: number;
  is_verified: boolean;
}

interface CreditData {
  total_aic: number;
  w_social: number;
  w_regen: number;
  gap_factor: number;
  calculated_at: string;
}

interface FarmData {
  area_hectares: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) { router.push("/login"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin");
          return;
        }
        if (profile?.role === "ward_member") {
          router.push("/ward");
          return;
        }

        const { data: farmerData } = await supabase
          .from("farmers")
          .select("id, full_name, village, total_family, female_members, unmarried_girls, yearly_yield, is_verified")
          .eq("user_id", user.id)
          .single();

        if (farmerData) {
          setFarmer(farmerData);

          const [{ data: creditData }, { data: farmData }] = await Promise.all([
            supabase.from("impact_credits")
              .select("total_aic, w_social, w_regen, gap_factor, calculated_at")
              .eq("farmer_id", farmerData.id)
              .order("calculated_at", { ascending: false })
              .limit(1)
              .single(),
            supabase.from("farms")
              .select("area_hectares")
              .eq("farmer_id", farmerData.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),
          ]);

          if (creditData) setCredits(creditData);
          if (farmData) setFarm(farmData);
        }
      } catch (error) {
        console.error("Dashboard failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfa] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="inline-block p-4 bg-primary rounded-full mb-4 shadow-xl">
            <Logo className="text-accent" size={32} />
          </div>
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
          <p className="text-gray-600 mb-8 font-medium">To calculate your financial impact, we need to locate your farm.</p>
          <Link href="/intake" className="inline-flex items-center gap-2 bg-primary text-accent px-8 py-4 rounded-full font-bold hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 hover:scale-105 active:scale-95">
            Start Genesis Trace <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Tier logically instead of DB field for safety
  let currentTier = 1;
  if (farmer.total_family > 0) currentTier = 2;
  if (farmer.yearly_yield > 0) currentTier = 3;

  const areaHectares = farm?.area_hectares || 0;
  const ndviScore = credits ? ((credits.w_regen - 0.3) / 1.2) : 0.65;
  
  // Use absolute INR values instead of abstract credits
  // If base INR is 10,000 per AIC
  const conversionRate = 10000;
  const inrValue = (credits?.total_aic || 0) * conversionRate;
  
  // Is Smallholder (inverse weighting logic visual feedback)
  const isSmallholder = areaHectares > 0 && areaHectares < 2.0;

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-foreground font-sans">
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
            <div className="hidden sm:flex items-center gap-2 bg-black/20 rounded-full px-3 py-1">
              <span className={`w-2 h-2 rounded-full ${farmer.is_verified ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {farmer.is_verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <button onClick={handleLogout} className="text-accent/60 hover:text-accent p-2 hover:bg-white/10 rounded-full transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8 mt-6">
        
        {/* The Financial Compass */}
        <section className="bg-primary text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-accent/20 transition-colors duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-bold uppercase tracking-widest mb-8">
              <Navigation size={14} /> Level {currentTier} Impact Unlocked
            </div>

            <div className="text-sm font-bold text-accent/80 uppercase tracking-[0.2em] mb-2">Unrecognized Value</div>
            <div className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-accent">
              <span className="text-4xl md:text-5xl opacity-80 mr-1">₹</span>
              {inrValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
            
            <p className="text-accent/70 font-medium max-w-lg mb-8">
              This is the true absolute value of your social and environmental labor, bridging the 84% gap extracted by the supply chain.
            </p>

            {isSmallholder && (
              <div className="w-full bg-accent text-primary px-6 py-4 rounded-2xl flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <Award className="text-alert" size={24} />
                  <div className="text-left">
                    <div className="font-black">Smallholder Dividend Active</div>
                    <div className="text-xs font-bold opacity-70">1.5x Inverse Weighting Applied</div>
                  </div>
                </div>
                <div className="font-black text-xl">+50%</div>
              </div>
            )}
          </div>
        </section>

        {/* Tiered Onboarding Journey */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-primary/5">
          <h3 className="text-xl font-black text-primary mb-8 flex items-center gap-2">
            <ShieldCheck className="text-accent fill-primary" /> The Impact Journey
          </h3>

          <div className="space-y-4">
            {/* Level 1 */}
            <div className={`p-5 rounded-2xl border-2 transition-all ${currentTier >= 1 ? 'border-primary/20 bg-primary/5' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentTier >= 1 ? 'bg-primary text-accent' : 'bg-gray-200 text-gray-400'}`}>
                    {currentTier > 1 ? <CheckCircle2 size={20} /> : '1'}
                  </div>
                  <div>
                    <h4 className={`font-black ${currentTier >= 1 ? 'text-primary' : 'text-gray-400'}`}>Genesis</h4>
                    <p className="text-sm font-semibold text-gray-500">Map & UPI Onboarding</p>
                  </div>
                </div>
                <div className="text-right">
                  {currentTier >= 1 ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Completed</span>
                  ) : (
                    <Link href="/intake" className="text-sm font-bold text-primary underline underline-offset-4">Start</Link>
                  )}
                </div>
              </div>
            </div>

            {/* Level 2 */}
            <div className={`p-5 rounded-2xl border-2 transition-all ${currentTier >= 2 ? 'border-primary/20 bg-primary/5' : currentTier === 1 ? 'border-accent bg-white' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentTier >= 2 ? 'bg-primary text-accent' : currentTier === 1 ? 'bg-accent text-primary' : 'bg-gray-200 text-gray-400'}`}>
                    {currentTier > 2 ? <CheckCircle2 size={20} /> : currentTier === 1 ? '2' : <Lock size={16} />}
                  </div>
                  <div>
                    <h4 className={`font-black ${currentTier >= 2 ? 'text-primary' : currentTier === 1 ? 'text-primary' : 'text-gray-400'}`}>Resilience</h4>
                    <p className="text-sm font-semibold text-gray-500">Social Data & Family Pulse</p>
                  </div>
                </div>
                <div className="text-right">
                  {currentTier >= 2 ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Completed</span>
                  ) : currentTier === 1 ? (
                    <Link href="/intake" className="text-sm font-bold bg-primary text-accent px-4 py-2 rounded-full hover:bg-emerald-900 transition-colors">Unlock</Link>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Level 3 */}
            <div className={`p-5 rounded-2xl border-2 transition-all ${currentTier >= 3 ? 'border-primary/20 bg-primary/5' : currentTier === 2 ? 'border-accent bg-white' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentTier >= 3 ? 'bg-primary text-accent' : currentTier === 2 ? 'bg-accent text-primary' : 'bg-gray-200 text-gray-400'}`}>
                    {currentTier >= 3 ? <CheckCircle2 size={20} /> : currentTier === 2 ? '3' : <Lock size={16} />}
                  </div>
                  <div>
                    <h4 className={`font-black ${currentTier >= 3 ? 'text-primary' : currentTier === 2 ? 'text-primary' : 'text-gray-400'}`}>Verified</h4>
                    <p className="text-sm font-semibold text-gray-500">Agri-Log & Yield Data</p>
                  </div>
                </div>
                <div className="text-right">
                  {currentTier >= 3 ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Completed</span>
                  ) : currentTier === 2 ? (
                     <Link href="/intake" className="text-sm font-bold bg-primary text-accent px-4 py-2 rounded-full hover:bg-emerald-900 transition-colors">Unlock</Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verified Data Ledger */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-primary/5">
          <h3 className="text-xl font-black text-primary mb-8 flex items-center gap-2">
            <Satellite className="text-accent fill-primary" /> Verified Data Ledger
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-5 rounded-2xl">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Farm Area</div>
              <div className="text-2xl font-black text-primary">{areaHectares > 0 ? `${areaHectares.toFixed(2)} ha` : "—"}</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Yearly Yield</div>
              <div className="text-2xl font-black text-primary">{farmer.yearly_yield > 0 ? `₹${farmer.yearly_yield.toLocaleString()}` : "—"}</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NDVI Score</div>
              <div className="text-2xl font-black text-primary">{ndviScore > 0 ? ndviScore.toFixed(2) : "—"}</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Female Members</div>
              <div className="text-2xl font-black text-primary">{farmer.female_members > 0 ? farmer.female_members : "—"}</div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
