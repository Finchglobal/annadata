"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, Users, Plus, Trash2, CheckCircle, MapPin, ChevronDown, ChevronUp, Info } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  role: 'farmer' | 'ward_member' | 'admin';
  email?: string;
}

interface Farmer {
  user_id: string;
  full_name: string;
  village: string;
  district: string;
  total_family: number;
  female_members: number;
  unmarried_girls: number;
  yearly_yield: number;
  is_verified?: boolean;
}

interface Assignment {
  id: string;
  user_id: string;
  ward_number: string;
  district: string;
  state: string;
}

export default function AdminPortal() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  // Form State
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [newWard, setNewWard] = useState({ ward_number: "", district: "", state: "Uttar Pradesh" });

  useEffect(() => {
    checkAdmin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      alert("Access Denied: Super Admin privileges required.");
      router.push("/dashboard");
      return;
    }

    setIsAdmin(true);
    fetchData();
  }

  async function fetchData() {
    const { data: p } = await supabase.from("profiles").select("*");
    const { data: a } = await supabase.from("ward_assignments").select("*");
    const { data: f } = await supabase.from("farmers").select("*");
    setProfiles(p || []);
    setAssignments(a || []);
    setFarmers(f || []);
  }

  async function promoteToWardMember(userId: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "ward_member" })
      .eq("id", userId);
    
    if (error) alert(error.message);
    else fetchData();
  }

  async function verifyFarmer(farmerId: string) {
    const { error } = await supabase
      .from("farmers")
      .update({ is_verified: true })
      .eq("user_id", farmerId);
      
    if (error) alert(error.message);
    else fetchData();
  }

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !newWard.ward_number) return;

    const { error } = await supabase
      .from("ward_assignments")
      .insert({
        user_id: selectedUser,
        ...newWard
      });

    if (error) alert(error.message);
    else {
      setNewWard({ ...newWard, ward_number: "", district: "" });
      fetchData();
    }
  }

  async function removeAssignment(id: string) {
    await supabase.from("ward_assignments").delete().eq("id", id);
    fetchData();
  }

  if (!isAdmin) return <div className="p-20 text-center">Checking credentials...</div>;

  return (
    <div className="min-h-screen bg-[#fcfdfa] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-900/20">
              <ShieldAlert className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tighter">Super Admin Control</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Onboarding & Governance</p>
            </div>
          </div>
          <button onClick={() => router.push("/")} className="text-sm font-bold text-primary hover:underline">Exit Admin</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* User List & Promotion */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50">
              <div className="flex items-center gap-2 mb-6">
                <Users className="text-emerald-600" />
                <h2 className="text-xl font-black text-primary italic">Platform Users</h2>
              </div>
              
              <div className="space-y-4">
                {profiles.map((p) => {
                  const fData = farmers.find(f => f.user_id === p.id);
                  const displayName = p.full_name || fData?.full_name || "Unnamed User";
                  const isExpanded = expandedUser === p.id;
                  
                  return (
                  <div key={p.id} className="flex flex-col bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <div className="font-bold text-primary">{displayName}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{p.role}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.role === "farmer" && (
                          <button 
                            onClick={() => promoteToWardMember(p.id)}
                            className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-200 transition-colors"
                          >
                            Promote
                          </button>
                        )}
                        {p.role === "ward_member" && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase px-4 py-2">
                            <CheckCircle size={12} /> Ward Member
                          </span>
                        )}
                        <button 
                          onClick={() => setExpandedUser(isExpanded ? null : p.id)}
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-gray-100 text-sm">
                        <h4 className="font-bold text-primary flex items-center gap-2 mb-3">
                          <Info size={16} className="text-accent" />
                          User Details
                        </h4>
                        {fData ? (
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500 font-bold uppercase tracking-wider block mb-1">Location</span>
                              <span className="font-medium text-gray-800">{fData.village}, {fData.district}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-bold uppercase tracking-wider block mb-1">Yearly Yield</span>
                              <span className="font-medium text-gray-800">₹{fData.yearly_yield?.toLocaleString() || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-bold uppercase tracking-wider block mb-1">Family</span>
                              <span className="font-medium text-gray-800">{fData.total_family} Members ({fData.female_members} F, {fData.unmarried_girls} UG)</span>
                            </div>
                            {fData.is_verified === false && (
                              <div className="col-span-2 mt-2">
                                <button
                                  onClick={() => verifyFarmer(fData.user_id)}
                                  className="w-full bg-primary text-accent py-2 rounded-xl text-xs font-bold hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                  <CheckCircle size={14} /> 1-Tap Verify (Admin Override)
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No intake form submitted yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>
          </div>

          {/* Onboarding Form */}
          <div className="space-y-6">
            <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-xl font-black text-accent mb-6 flex items-center gap-2 italic">
                <Plus size={20}/> Assign New Ward
              </h3>
              
              <form onSubmit={addAssignment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Select Ward Member</label>
                  <select 
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-sm outline-none focus:bg-white/20"
                  >
                    <option value="" className="text-primary">-- Choose Member --</option>
                    {profiles.filter(p => p.role === 'ward_member').map(p => (
                      <option key={p.id} value={p.id} className="text-primary">{p.full_name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Ward Num</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12"
                      value={newWard.ward_number}
                      onChange={(e) => setNewWard({...newWard, ward_number: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-sm outline-none focus:bg-white/20" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">District</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Atarra"
                      value={newWard.district}
                      onChange={(e) => setNewWard({...newWard, district: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-sm outline-none focus:bg-white/20" 
                    />
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-accent text-primary p-4 rounded-xl font-black hover:scale-[1.02] transition-transform mt-4">
                  Confirm Assignment
                </button>
              </form>
            </div>

            {/* Current Assignments */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-lg">
              <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Active Assignments</h4>
              <div className="space-y-3">
                {assignments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <div className="text-[10px] font-black text-emerald-800">{profiles.find(p => p.id === a.user_id)?.full_name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                        <MapPin size={10} /> Ward {a.ward_number}, {a.district}
                      </div>
                    </div>
                    <button onClick={() => removeAssignment(a.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
