import Link from "next/link";
import { 
  Leaf, ArrowRight, Satellite, Users, ShieldCheck, 
  TrendingUp, IndianRupee, Sprout, Globe, Shield, 
  CheckCircle2, BarChart3, Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfdfa] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-emerald-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-emerald-900/20">
              <Leaf className="text-accent" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-primary tracking-tighter leading-none">ANNADATA</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Impact Credits</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-primary/60">
            <Link href="#how-it-works" className="hover:text-primary transition-colors">Protocol</Link>
            <Link href="#formula" className="hover:text-primary transition-colors">The Formula</Link>
            <Link href="/ward" className="hover:text-primary transition-colors">Ward Portal</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-primary hover:text-emerald-600 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-primary text-accent px-6 py-2.5 rounded-full text-sm font-black hover:bg-emerald-900 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/10">
              Join the Pilot
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-accent/30 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest animate-fade-in">
              <Zap size={14} className="fill-emerald-700" /> Live Pilot Program · 150k Annadatas
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tight leading-[0.9] max-w-5xl">
              The Farmer Gets <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-primary italic">Only 16% Value.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl font-medium leading-relaxed">
              We&apos;re bridging the 84% gap. Annadata Impact Credits (AIC) recognize social hardship and ecological stewardship—turning trust into traceable financial rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link
                href="/signup"
                className="group relative flex items-center justify-center gap-3 bg-primary text-accent px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-900 transition-all shadow-2xl shadow-emerald-900/20 hover:-translate-y-1"
              >
                Start Intake Flow
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-3 bg-white border-2 border-emerald-100 text-primary px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all"
              >
                Explore Dashboard
              </Link>
            </div>

            {/* Trusted By / Powered By */}
            <div className="pt-20 flex flex-col items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Powered by the SIR Protocol</span>
              <div className="flex flex-wrap justify-center items-center gap-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <div className="flex items-center gap-2 font-black text-xl italic"><Globe size={24}/> Sentinel-2</div>
                <div className="flex items-center gap-2 font-black text-xl italic"><Shield size={24}/> PostGIS</div>
                <div className="flex items-center gap-2 font-black text-xl italic text-emerald-700 underline underline-offset-8 decoration-4">SIR.FARM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <IndianRupee size={120} />
              </div>
              <div className="text-accent font-black text-6xl mb-2">16%</div>
              <div className="text-xl font-bold mb-4 italic text-emerald-100">Current Share</div>
              <p className="text-emerald-50/60 text-sm leading-relaxed">The average Indian farmer receives less than 1/6th of the final market value of their produce. AIC recovers the remaining 84%.</p>
            </div>
            
            <div className="bg-accent text-primary p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Satellite size={120} />
              </div>
              <div className="text-primary font-black text-6xl mb-2">Live</div>
              <div className="text-xl font-bold mb-4 italic text-emerald-900/60">Satellite Proof</div>
              <p className="text-emerald-900/40 text-sm leading-relaxed">No self-declarations. Every credit is backed by 10m-resolution NDVI satellite imagery processed via Google Earth Engine.</p>
            </div>

            <div className="bg-emerald-50 text-emerald-900 p-10 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={120} />
              </div>
              <div className="text-emerald-600 font-black text-6xl mb-2">Trust</div>
              <div className="text-xl font-bold mb-4 italic text-emerald-900/60">Panchayati Validation</div>
              <p className="text-emerald-900/40 text-sm leading-relaxed">The human layer. Elected Ward Members digitally sign off on farmer identity, bridging the gap between tech and community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works: The Protocol ── */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <h2 className="text-5xl font-black text-primary leading-tight">
                A Traceable Path to <br />
                <span className="text-emerald-600">Absolute Rewards.</span>
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                We replaced vague percentages with verifiable impact multipliers. Every AIC point in your wallet is earned through three rigorous stages of truth.
              </p>
              
              <div className="space-y-6">
                {[
                  { step: 1, title: "Social Identity Intake", desc: "Farmers provide family metrics—specifically female dependency and unmarried girls—to calculate the Social Premium multiplier (W_social).", icon: <Users /> },
                  { step: 2, title: "Regen Satellite Audit", desc: "The platform queries Sentinel-2 datasets for the last 90 days. High vegetation scores (NDVI) yield a Regen Multiplier (W_regen) up to 1.5x.", icon: <Satellite /> },
                  { step: 3, title: "Decentralized Ward Approval", desc: "Local Ward Members review submissions. Their digital verification unlocks the credit for payout/trading.", icon: <ShieldCheck /> },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black shrink-0 group-hover:bg-primary group-hover:text-accent transition-colors">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-black text-primary text-lg mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="relative aspect-square bg-emerald-900 rounded-[3rem] p-10 shadow-2xl overflow-hidden group">
                 {/* Visual placeholder for dashboard UI mockup */}
                 <div className="absolute top-10 left-10 right-10 bottom-10 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 p-8">
                    <div className="flex justify-between items-start mb-10">
                       <div>
                          <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-1">Annadata Wallet</div>
                          <div className="text-4xl font-black text-white italic">24,850 <span className="text-lg opacity-40">AIC</span></div>
                       </div>
                       <div className="p-3 bg-accent rounded-2xl text-primary"><IndianRupee /></div>
                    </div>
                    <div className="space-y-4">
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[65%] bg-accent rounded-full animate-shimmer" />
                       </div>
                       <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          <span>16% Yield</span>
                          <span>84% GAP RECOVERY</span>
                       </div>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-4">
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <div className="text-emerald-400 font-black text-xl">1.35x</div>
                          <div className="text-[8px] text-white/40 uppercase font-black tracking-widest mt-1">W_regen</div>
                       </div>
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <div className="text-emerald-400 font-black text-xl">2.10x</div>
                          <div className="text-[8px] text-white/40 uppercase font-black tracking-widest mt-1">W_social</div>
                       </div>
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Formula Breakout ── */}
      <section id="formula" className="py-32 px-6 bg-[#0c1a15] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
          <Globe size={800} />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">The Mathematical Truth</span>
          <h2 className="text-5xl md:text-7xl font-black mb-16 tracking-tighter">
            We Value the <br />
            <span className="italic text-emerald-400 underline decoration-emerald-800 underline-offset-[12px]">Unrecognized.</span>
          </h2>
          
          <div className="p-1 sm:p-2 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 mb-20">
            <div className="bg-emerald-950/50 rounded-[2.8rem] py-20 px-8">
              <div className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-accent">
                AIC = (Area × [W<sub>s</sub> + W<sub>r</sub>]) + (Yield × 0.84)
              </div>
              <p className="text-emerald-200/40 font-mono text-sm uppercase tracking-widest">Traceable Multiplier Algorithm v1.2</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { title: "Social Premium (W_s)", value: "Up to 3.0x", desc: "Incentivizing gender equality and social support systems directly." },
              { title: "Regen Score (W_r)", value: "Satellite Fed", desc: "Dynamic multiplier based on active photosynthesis and water retention." },
              { title: "Value Gap Factor", value: "0.84 Absolute", desc: "Specifically designed to claw back the 84% supply chain value leak." },
            ].map((box) => (
              <div key={box.title} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                <h4 className="font-black text-emerald-400 text-sm uppercase tracking-widest mb-4">{box.title}</h4>
                <div className="text-3xl font-black mb-2">{box.value}</div>
                <p className="text-white/40 text-sm leading-relaxed">{box.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Icons / Badges ── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-16 md:gap-32 items-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter"><BarChart3 /> Real-Time</div>
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter"><ShieldCheck /> Auditable</div>
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter"><CheckCircle2 /> Decentralized</div>
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter"><Sprout /> Regenerative</div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 pb-40">
        <div className="max-w-6xl mx-auto bg-accent rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter leading-none">
              Ready to Claim <br />
              <span className="italic">Your True Impact?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/signup"
                className="bg-primary text-accent px-12 py-6 rounded-2xl font-black text-xl hover:bg-emerald-900 transition-all hover:scale-105 shadow-2xl shadow-emerald-900/40"
              >
                Join the Pilot Now
              </Link>
              <div className="text-primary/40 font-bold uppercase tracking-widest text-xs">
                 No Paperwork · 5 Minute Setup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white py-20 px-6 border-t border-emerald-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-primary rounded-lg">
                <Leaf className="text-accent" size={18} />
              </div>
              <span className="text-xl font-black text-primary tracking-tighter">ANNADATA</span>
            </div>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              Empowering India&apos;s 150,000 Annadatas by bridging the agricultural value gap through satellite verification and human trust protocols.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="font-black text-primary text-xs uppercase tracking-widest">Protocol</h5>
            <div className="flex flex-col gap-3 text-sm text-gray-500 font-bold">
               <Link href="/ward">Ward Member Login</Link>
               <Link href="/signup">Farmer Intake</Link>
               <Link href="/dashboard">Trust Dashboard</Link>
            </div>
          </div>
          <div className="space-y-4 text-right md:text-left">
            <h5 className="font-black text-primary text-xs uppercase tracking-widest">Contact</h5>
            <div className="flex flex-col gap-3 text-sm text-gray-500 font-bold">
               <a href="mailto:impact@sir.farm">impact@sir.farm</a>
               <span>Uttar Pradesh, India</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-emerald-50 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">© 2026 SIR Protocol. Authorized by Social Impact Rewards.</div>
           <div className="flex gap-8 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              <Link href="#">Privacy</Link>
              <Link href="#">Terms</Link>
              <Link href="#">Impact Methodology</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
