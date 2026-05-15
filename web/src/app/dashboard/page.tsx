"use client";

import { useEffect, useState } from "react";
import { Wallet, Award, Leaf, Satellite, ShieldCheck, ShieldAlert, ArrowRight, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ValueGapVisual from "@/components/ValueGapVisual";
import AICBreakdown from "@/components/AICBreakdown";
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
  const [progress, setProgress] = useState(16);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Check role
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

        if (creditData) {
          setCredits(creditData);
          setProgress(Math.min(100, 16 + (creditData.gap_factor * 100)));
        }
        if (farmData) setFarm(farmData);
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-primary rounded-2xl mb-4 animate-pulse">
            <Leaf className="text-accent" size={32} />
          </div>
          <p className="text-primary font-bold">Loading your Trust Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="p-4 bg-accent rounded-2xl inline-block mb-4">
            <Leaf className="text-primary" size={32} />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-6">Complete the intake flow first to generate your Impact Credits.</p>
          <Link href="/intake" className="inline-flex items-center gap-2 bg-primary text-accent px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">
            Start Intake <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const ndviScore = credits ? ((credits.w_regen - 0.3) / 1.2) : null;

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      {/* Header */}
      <header className="bg-primary text-accent sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-accent/20 rounded-lg">
              <Leaf size={18} className="text-accent" />
            </div>
            <div>
              <div className="font-bold text-sm">Trust Dashboard</div>
              {farmer.full_name && (
                <div className="text-accent/70 text-xs">{farmer.full_name} · {farmer.village || "Village"}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {farmer.is_verified ? (
              <span className="flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                <ShieldCheck size={12} /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                <ShieldAlert size={12} /> Pending Ward Verification
              </span>
            )}
            <button onClick={handleLogout} className="text-accent/60 hover:text-accent">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Annadata Wallet */}
        <section className="bg-primary text-accent p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <Wallet size={18} />
              <span className="text-sm font-semibold uppercase tracking-wider">Annadata Wallet</span>
            </div>
            <div className="text-5xl font-extrabold mb-2">
              {credits ? credits.total_aic.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0"}{" "}
              <span className="text-2xl font-medium opacity-60">AIC</span>
            </div>
            <p className="text-accent/70 text-sm max-w-md">
              Your Annadata Impact Credits represent your recognized contribution — verified by satellite, validated by your Ward Member.
            </p>

            {/* Quick stats strip */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
              {[
                { label: "Farm Area", value: farm ? `${farm.area_hectares.toFixed(2)} ha` : "—" },
                { label: "Yearly Yield", value: farmer.yearly_yield ? `₹${farmer.yearly_yield.toLocaleString()}` : "—" },
                { label: "NDVI Score", value: ndviScore !== null ? ndviScore.toFixed(2) : "—" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-accent/60 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Gap Visual */}
        <ValueGapVisual finalPercentage={progress} />

        {/* NDVI / Satellite Card */}
        {credits && (
          <section className="bg-gradient-to-br from-emerald-950 to-primary p-6 rounded-3xl text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <Satellite size={20} className="text-emerald-300" />
              </div>
              <h2 className="font-bold text-lg">Satellite Intelligence</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">NDVI Score</div>
                <div className="text-3xl font-extrabold text-emerald-300">
                  {ndviScore !== null ? ndviScore.toFixed(3) : "N/A"}
                </div>
                <div className="text-xs text-white/50 mt-1">Sentinel-2 · Last 90 days</div>
                {/* NDVI bar */}
                {ndviScore !== null && (
                  <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${ndviScore * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">W_regen Multiplier</div>
                <div className="text-3xl font-extrabold text-emerald-300">
                  {credits.w_regen.toFixed(2)}
                </div>
                <div className="text-xs text-white/50 mt-1">Range: 0.3 – 1.5</div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-emerald-300 rounded-full transition-all duration-1000"
                    style={{ width: `${((credits.w_regen - 0.3) / 1.2) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AIC Breakdown */}
        {credits && farm && (
          <AICBreakdown
            wSocial={credits.w_social}
            wRegen={credits.w_regen}
            gapFactor={credits.gap_factor}
            areaHectares={farm.area_hectares}
            yearlyYield={farmer.yearly_yield}
            totalAic={credits.total_aic}
          />
        )}

        {/* Social Profile Card */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-primary mb-4 flex items-center gap-2">
            <Award size={18} /> Social Impact Profile
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Family", value: farmer.total_family },
              { label: "Female Members", value: farmer.female_members },
              { label: "Unmarried Girls", value: farmer.unmarried_girls },
              { label: "W_social Score", value: credits?.w_social.toFixed(2) ?? "—" },
            ].map((item) => (
              <div key={item.label} className="bg-accent/30 rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-primary">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* No credits yet */}
        {!credits && (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">No AIC credits calculated yet.</p>
            <Link href="/intake" className="inline-flex items-center gap-2 bg-primary text-accent px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors text-sm">
              Complete Intake Flow <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
