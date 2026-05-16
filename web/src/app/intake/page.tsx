"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowLeft, Map as MapIcon, Sprout, Users, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MOCK_LOCATIONS } from "@/lib/indiaData";

const MapDraw = dynamic(() => import("@/components/MapDraw"), { ssr: false });

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    state: "",
    district: "",
    village: "",
    ward: "",
    totalFamily: "",
    femaleMembers: "",
    unmarriedGirls: "",
    yearlyYield: "",
    areaHectares: 0,
    geojson: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const nextStep = () => {
    setErrorMsg(null);
    setStep((s) => s + 1);
  };
  const prevStep = () => {
    setErrorMsg(null);
    setStep((s) => s - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePolygonDrawn = useCallback((areaHectares: number, geojson: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setFormData(prev => ({ ...prev, areaHectares, geojson }));
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      // 1. Call RPC to insert farmer and farm (PostGIS)
      const { data: farmerId, error: rpcError } = await supabase.rpc('handle_farmer_intake', {
        p_full_name: formData.fullName,
        p_village: formData.village,
        p_district: formData.district,
        p_total_family: parseInt(formData.totalFamily) || 0,
        p_female_members: parseInt(formData.femaleMembers) || 0,
        p_unmarried_girls: parseInt(formData.unmarriedGirls) || 0,
        p_yearly_yield: parseFloat(formData.yearlyYield) || 0,
        p_area_hectares: formData.areaHectares,
        p_geojson: (formData.geojson as any).geometry, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      if (rpcError) throw new Error(`Database error: ${rpcError.message}`);

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

      if (edgeError) {
        console.warn("Edge function failed, but database was updated:", edgeError);
        // We don't throw here so the user can still see their profile, 
        // the calculation might happen later or use fallbacks.
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white text-gray-900 shadow-xl rounded-2xl p-8 border border-primary/10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            {step === 1 && <><Users /> Step 1: Identity</>}
            {step === 2 && <><Sprout /> Step 2: Yield</>}
            {step === 3 && <><MapIcon /> Step 3: Map</>}
          </h2>
          <div className="text-sm font-semibold text-primary/60">Step {step} of 3</div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            <strong>Submission Error:</strong> {errorMsg}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value, district: "", village: "", ward: "" });
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="">Select State</option>
                    {Object.keys(MOCK_LOCATIONS).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2 flex items-center gap-1">
                    District <MapPin size={14} className="text-gray-500" />
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={(e) => {
                      setFormData({ ...formData, district: e.target.value, village: "", ward: "" });
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                    disabled={!formData.state}
                  >
                    <option value="">Select District</option>
                    {formData.state && MOCK_LOCATIONS[formData.state] && Object.keys(MOCK_LOCATIONS[formData.state]).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Village</label>
                  <select
                    name="village"
                    value={formData.village}
                    onChange={(e) => {
                      setFormData({ ...formData, village: e.target.value, ward: "" });
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                    disabled={!formData.district}
                  >
                    <option value="">Select Village</option>
                    {formData.state && formData.district && MOCK_LOCATIONS[formData.state]?.[formData.district] && Object.keys(MOCK_LOCATIONS[formData.state][formData.district]).map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Ward</label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                    disabled={!formData.village}
                  >
                    <option value="">Select Ward</option>
                    {formData.state && formData.district && formData.village && MOCK_LOCATIONS[formData.state]?.[formData.district]?.[formData.village] && MOCK_LOCATIONS[formData.state][formData.district][formData.village].map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Total Family</label>
                <input
                  type="number"
                  name="totalFamily"
                  value={formData.totalFamily}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Females</label>
                <input
                  type="number"
                  name="femaleMembers"
                  value={formData.femaleMembers}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Girls (Unm.)</label>
                <input
                  type="number"
                  name="unmarriedGirls"
                  value={formData.unmarriedGirls}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Yearly Yield (Absolute INR)</label>
              <p className="text-sm text-gray-500 mb-2">The total value you received for your crops this year.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  name="yearlyYield"
                  value={formData.yearlyYield}
                  onChange={handleChange}
                  className="w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="150000"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <p className="font-semibold mb-2">Draw your farm polygon on the map</p>
            <MapDraw 
              onPolygonDrawn={handlePolygonDrawn} 
              initialSearch={{
                state: formData.state || "Uttar Pradesh",
                district: formData.district,
                village: formData.village,
                ward: formData.ward
              }}
            />
            {formData.areaHectares > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Calculated Area</div>
                  <div className="text-2xl font-black text-emerald-600">{formData.areaHectares.toFixed(2)} <span className="text-sm font-medium">Hectares</span></div>
                </div>
                <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
                  <Sprout />
                </div>
              </div>
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
              {isSubmitting ? "Submitting to Ledger..." : "Submit to Ledger"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
