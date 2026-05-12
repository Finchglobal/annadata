"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Award, Leaf } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [aicValue, setAicValue] = useState(0);
  const [progress, setProgress] = useState(16); // Starting at 16% value gap
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch farmer ID
      const { data: farmer } = await supabase
        .from("farmers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (farmer) {
        // Fetch impact credits
        const { data: credits } = await supabase
          .from("impact_credits")
          .select("total_aic, gap_factor")
          .eq("farmer_id", farmer.id)
          .order("calculated_at", { ascending: false })
          .limit(1)
          .single();

        if (credits) {
          setAicValue(credits.total_aic);
          // Calculate new progress (Base 16% + (gap_factor * something)?
          // Let's assume Gap Factor represents the 84% gap multiplier, so we just show 16 + (gap_factor * 100) or similar.
          // For the visual hook, let's say progress is 16 + (credits.gap_factor * 100) capped at 100.
          // Actually, gap_factor = 0.84. So 16 + (0.84 * 100) = 100.
          setProgress(Math.min(100, 16 + (credits.gap_factor * 100)));
        }
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary font-bold animate-pulse">Loading Trust Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="max-w-4xl mx-auto flex justify-between items-center py-6 mb-8 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary" />
          <h1 className="text-2xl font-bold text-primary">Trust Dashboard</h1>
        </div>
        <div className="text-sm font-semibold bg-accent text-primary px-4 py-2 rounded-full">
          Farmer ID: Authenticated
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        
        {/* Annadata Wallet Section */}
        <section className="bg-primary text-accent p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={120} />
          </div>
          <h2 className="text-xl font-medium mb-2 opacity-90">Annadata Wallet Balance</h2>
          <div className="text-5xl font-extrabold mb-4">
            {aicValue === 0 ? "Calculating..." : `${aicValue.toLocaleString()} AIC`}
          </div>
          <p className="max-w-md opacity-80 text-sm">
            This absolute value represents your recognized hardship, social impact, and regenerative farming practices.
          </p>
        </section>

        {/* The 16% Gap Visualization */}
        <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-primary" size={28} />
            <h2 className="text-2xl font-bold text-primary">Bridging the Value Gap</h2>
          </div>
          
          <p className="text-gray-600 mb-8 max-w-2xl">
            Historically, Annadatas receive only <strong className="text-red-500">16%</strong> of the final consumer value. Your Impact Credits are dynamically bridging this gap towards 100% true value realization.
          </p>

          <div className="relative pt-8 pb-4">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-100">
                  Current Market Share (16%)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-accent">
                  True Value (100%)
                </span>
              </div>
            </div>
            
            <div className="overflow-hidden h-6 mb-4 text-xs flex rounded-full bg-red-100 relative">
              {/* Base 16% */}
              <div style={{ width: "16%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 z-10"></div>
              
              {/* Animated Bridged Gap */}
              <div 
                style={{ width: `${progress - 16}%`, transition: "width 2s cubic-bezier(0.4, 0, 0.2, 1)" }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-primary font-bold justify-center bg-accent border-l-2 border-white z-0"
              >
                {progress > 16 && `${(progress - 16).toFixed(0)}% Bridged via AIC`}
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
               <div className="text-xl font-bold text-primary">
                 Total Realized Value: {progress}%
               </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex items-start gap-4">
            <div className="p-3 bg-accent rounded-full text-primary">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Social Premium</h3>
              <p className="text-gray-600 text-sm">Verified through Ward Protocol based on family composition and gender focus.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex items-start gap-4">
            <div className="p-3 bg-accent rounded-full text-primary">
              <Leaf size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Regenerative Multiplier</h3>
              <p className="text-gray-600 text-sm">Satellite verified NDWI & NDVI scores integrated via Google Earth Engine.</p>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
}
