"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface ValueGapVisualProps {
  finalPercentage: number;
}

export default function ValueGapVisual({ finalPercentage }: ValueGapVisualProps) {
  const [progress, setProgress] = useState(16);

  useEffect(() => {
    // Small delay to allow the mount animation
    const timer = setTimeout(() => {
      setProgress(finalPercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [finalPercentage]);

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-xl">
          <TrendingUp className="text-primary" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-primary tracking-tight">Bridging the Value Gap</h2>
      </div>

      <p className="text-gray-600 mb-10 max-w-2xl leading-relaxed">
        Historically, Annadatas receive only <strong className="text-red-500 font-bold bg-red-50 px-1 py-0.5 rounded">16%</strong> of the final consumer value. 
        Your Impact Credits are dynamically bridging this gap, recognizing your true contribution to society and the environment.
      </p>

      <div className="relative pt-6 pb-2">
        <div className="flex mb-3 flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold inline-block py-1.5 px-3 uppercase rounded-full text-red-700 bg-red-100 border border-red-200 shadow-sm">
              Current Market Share (16%)
            </span>
          </div>
          <div className="sm:text-right">
            <span className="text-xs font-bold inline-block py-1.5 px-3 uppercase rounded-full text-primary bg-accent border border-primary/20 shadow-sm">
              Target Value (100%)
            </span>
          </div>
        </div>

        {/* Premium Progress Bar */}
        <div className="h-8 w-full bg-gray-100 rounded-full overflow-hidden flex relative shadow-inner border border-gray-200/60">
          
          {/* Base 16% (Red) */}
          <div 
            style={{ width: "16%" }} 
            className="h-full flex items-center justify-center bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-bold shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] z-20"
          >
            16%
          </div>

          {/* Bridged Gap (Green Gradient) */}
          <div 
            style={{ 
              width: `${Math.max(0, progress - 16)}%`, 
              transition: "width 2.5s cubic-bezier(0.22, 1, 0.36, 1)" 
            }} 
            className="h-full flex items-center justify-center bg-gradient-to-r from-primary to-emerald-600 border-l border-white/30 text-accent text-xs font-bold shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] z-10 relative overflow-hidden"
          >
            {/* Shimmer effect inside the green bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            
            {progress > 20 && <span className="relative z-10 px-2 truncate">+{Math.max(0, progress - 16).toFixed(0)}% Bridged</span>}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <div className="inline-flex items-baseline gap-2 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Realized Value</span>
            <span className="text-3xl font-extrabold text-primary">{progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
