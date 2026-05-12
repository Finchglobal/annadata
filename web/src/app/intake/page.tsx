"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowLeft, Map as MapIcon, Sprout, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MapDraw = dynamic(() => import("@/components/MapDraw"), { ssr: false });

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    totalFamily: "",
    femaleMembers: "",
    unmarriedGirls: "",
    yearlyYield: "",
    areaHectares: 0,
    geojson: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePolygonDrawn = (areaHectares: number, geojson: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setFormData({ ...formData, areaHectares, geojson });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      // 1. Call RPC to insert farmer and farm (PostGIS)
      const { data: farmerId, error: rpcError } = await supabase.rpc('handle_farmer_intake', {
        p_total_family: parseInt(formData.totalFamily) || 0,
        p_female_members: parseInt(formData.femaleMembers) || 0,
        p_unmarried_girls: parseInt(formData.unmarriedGirls) || 0,
        p_yearly_yield: parseFloat(formData.yearlyYield) || 0,
        p_area_hectares: formData.areaHectares,
        p_geojson: (formData.geojson as any).geometry, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      if (rpcError) throw rpcError;

      // 2. Invoke Edge Function to calculate AIC
      const { error: edgeError } = await supabase.functions.invoke('calculate-satellite-impact', {
        body: {
          farmer_id: farmerId,
          area_hectares: formData.areaHectares,
          total_family: parseInt(formData.totalFamily) || 0,
          female_members: parseInt(formData.femaleMembers) || 0,
          unmarried_girls: parseInt(formData.unmarriedGirls) || 0,
          yearly_yield: parseFloat(formData.yearlyYield) || 0,
        }
      });

      if (edgeError) throw edgeError;

      router.push("/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 border border-primary/10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            {step === 1 && <><Users /> Step 1: Social</>}
            {step === 2 && <><Sprout /> Step 2: Yield</>}
            {step === 3 && <><MapIcon /> Step 3: Map</>}
          </h2>
          <div className="text-sm font-semibold text-primary/60">Step {step} of 3</div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Total Family Members</label>
              <input
                type="number"
                name="totalFamily"
                value={formData.totalFamily}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Female Members</label>
              <input
                type="number"
                name="femaleMembers"
                value={formData.femaleMembers}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Unmarried Girls</label>
              <input
                type="number"
                name="unmarriedGirls"
                value={formData.unmarriedGirls}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. 1"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Yearly Yield (Absolute INR)</label>
              <p className="text-sm text-gray-500 mb-2">The total value you received for your crops this year.</p>
              <input
                type="number"
                name="yearlyYield"
                value={formData.yearlyYield}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="₹ e.g. 150000"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <p className="font-semibold mb-2">Draw your farm polygon on the map</p>
            <MapDraw onPolygonDrawn={handlePolygonDrawn} />
            {formData.areaHectares > 0 && (
              <p className="text-primary font-bold bg-accent p-3 rounded-lg text-center">
                Calculated Area: {formData.areaHectares.toFixed(2)} Hectares
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-10">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${
              step === 1 ? "opacity-50 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <ArrowLeft size={20} /> Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-primary text-accent px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors"
            >
              Next <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || formData.areaHectares === 0}
              className="flex items-center gap-2 bg-primary text-accent px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit to Ledger"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
