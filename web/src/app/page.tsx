import Link from "next/link";
import { Leaf, ArrowRight, Satellite, Users, ShieldCheck, TrendingUp, IndianRupee, Sprout } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-primary/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <Leaf className="text-accent" size={20} />
            </div>
            <span className="text-xl font-extrabold text-primary tracking-tight">Annadata</span>
            <span className="hidden sm:inline text-xs font-semibold bg-accent text-primary px-2 py-0.5 rounded-full ml-1">Impact Credits</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/ward" className="hidden sm:block text-sm font-semibold text-primary/70 hover:text-primary transition-colors">
              Ward Portal
            </Link>
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
              Login
            </Link>
            <Link href="/signup" className="bg-primary text-accent px-4 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
              Join Pilot
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-800 to-primary pt-24 pb-32 px-6 text-center">
        {/* Decorative circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-accent text-sm font-semibold mb-8">
            <Satellite size={14} /> Satellite-Verified Impact Credits
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            The Farmer Gets{" "}
            <span className="text-accent">Only 16%.</span>
            <br />We&apos;re Changing That.
          </h1>
          
          <p className="text-lg sm:text-xl text-accent/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Annadata Impact Credits (AIC) is a financial instrument that recognizes the unrecognized. 
            Hardship, social contribution, and environmental stewardship of India&apos;s 150,000 Annadatas — 
            verified by satellite and rewarded in absolute INR.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-accent text-primary px-8 py-4 rounded-full font-extrabold text-base hover:bg-white transition-colors shadow-xl"
            >
              Start Your AIC Intake <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-white/20 transition-colors"
            >
              View Trust Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-accent border-y border-primary/10 py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "150,000", label: "Pilot Farmers", icon: <Users size={20} /> },
            { value: "16%", label: "Current Value Share", icon: <TrendingUp size={20} /> },
            { value: "84%", label: "Value Gap to Bridge", icon: <IndianRupee size={20} /> },
            { value: "Satellite", label: "Verified via NDVI/NDWI", icon: <Satellite size={20} /> },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <div className="text-primary/50 mb-1">{stat.icon}</div>
              <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
              <div className="text-xs font-semibold text-primary/60 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-primary mb-4">How AIC Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">A transparent, auditable process from farm to wallet.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Users size={28} />,
                title: "Farmer Intake",
                desc: "Farmers submit their family composition, yearly yield, and draw their farm boundary on the map. No paperwork.",
              },
              {
                step: "02",
                icon: <Satellite size={28} />,
                title: "Satellite Verification",
                desc: "Google Earth Engine analyses the farm polygon using NDVI & NDWI scores from Sentinel-2 to verify regenerative practices.",
              },
              {
                step: "03",
                icon: <ShieldCheck size={28} />,
                title: "Ward Validation",
                desc: "The elected Ward Member digitally validates the farmer's identity and hardship as a human layer of trust.",
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-5xl font-extrabold text-primary/10 absolute top-6 right-6">{item.step}</div>
                <div className="p-3 bg-accent rounded-xl w-fit text-primary mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formula Section ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">The AIC Formula</h2>
          <p className="text-accent/80 mb-12 max-w-xl mx-auto">
            Not a percentage — an absolute reward. Every rupee is traceable.
          </p>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-8 sm:p-12 inline-block text-left">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-accent text-center mb-8">
              AIC = (Area × [W<sub>social</sub> + W<sub>regen</sub>]) + (Yield × Gap_Factor)
            </div>
            <div className="grid sm:grid-cols-3 gap-6 text-sm">
              {[
                { term: "W_social", color: "bg-blue-400/20 border-blue-300/40", desc: "Weighted multiplier for female dependency & social hardship. Higher the dependency, higher the credit." },
                { term: "W_regen", color: "bg-emerald-400/20 border-emerald-300/40", desc: "Environmental score from Google Earth Engine NDVI/NDWI. Greener the farm, higher the reward." },
                { term: "Gap_Factor", color: "bg-orange-400/20 border-orange-300/40", desc: "The 0.84 coefficient designed to recover the 84% value currently lost in the supply chain." },
              ].map((item) => (
                <div key={item.term} className={`border rounded-xl p-4 ${item.color}`}>
                  <div className="font-mono font-bold text-white text-base mb-2">{item.term}</div>
                  <div className="text-white/70 text-xs leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Trust ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-primary mb-4">Built for Trust</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Every layer of the platform is designed for auditability.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: <ShieldCheck />, title: "Panchayati Raj Protocol", desc: "Elected Ward Members act as the final human layer of trust, verifying farmer identity before credits are issued." },
              { icon: <Satellite />, title: "Satellite Intelligence", desc: "NDVI & NDWI analysis from Copernicus Sentinel-2 imagery ensures environmental claims are verified, not self-declared." },
              { icon: <Sprout />, title: "PostGIS Land Registry", desc: "Farm boundaries stored as verifiable geospatial polygons in a tamper-resistant PostGIS database." },
              { icon: <IndianRupee />, title: "Absolute Rewards, Not Percentages", desc: "Farmers receive concrete INR values tied to their AIC score, not vague promises or percentage calculations." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-accent/30 transition-colors">
                <div className="p-3 bg-primary rounded-xl text-accent h-fit shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-accent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-primary mb-4">Ready to Claim Your True Value?</h2>
          <p className="text-primary/70 mb-8 text-lg">
            Join the pilot. Map your farm. See your Annadata Wallet grow.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary text-accent px-10 py-4 rounded-full font-extrabold text-base hover:bg-primary/90 transition-colors shadow-xl"
          >
            Start Intake <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-primary text-accent/60 py-8 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={14} className="text-accent" />
          <span className="font-bold text-accent">Annadata Impact Credits</span>
        </div>
        <p>Authorized by SIR (Social Impact Rewards) & sir.farm Initiative</p>
        <p className="mt-1">Empowering 150,000 Annadatas through Traceable Impact.</p>
      </footer>
    </div>
  );
}
