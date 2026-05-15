"use client";

import { useState } from "react";
import { motion } from "framer-motion";
export default function GapSlider() {
  const [sliderValue, setSliderValue] = useState(100);

  const farmerShare = Math.round(sliderValue * 0.16);
  const gapShare = sliderValue - farmerShare;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-primary/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="text-center mb-10">
        <h3 className="text-2xl font-black text-primary mb-3">The 16% Reality</h3>
        <p className="text-gray-500 font-medium">
          Slide to see how much of the final consumer price actually reaches the farmer.
        </p>
      </div>

      <div className="relative mb-16">
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
          Final Consumer Price: <span className="text-primary text-xl">₹{sliderValue}</span>
        </label>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div className="flex h-24 rounded-2xl overflow-hidden shadow-inner">
        {/* Farmer Share */}
        <motion.div 
          className="bg-alert flex flex-col justify-center items-center text-white relative z-10"
          initial={{ width: "16%" }}
          animate={{ width: "16%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Farmer</span>
          <span className="text-xl md:text-2xl font-black">₹{farmerShare}</span>
        </motion.div>

        {/* The Gap */}
        <motion.div 
          className="bg-primary flex flex-col justify-center items-center text-white"
          initial={{ width: "84%" }}
          animate={{ width: "84%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-80 text-accent">Unrecognized Gap (84%)</span>
          <span className="text-xl md:text-2xl font-black text-accent">₹{gapShare}</span>
        </motion.div>
      </div>

      <p className="text-center mt-8 text-sm font-semibold text-gray-500 leading-relaxed max-w-xl mx-auto">
        The world eats because they work. But they only keep 16%. We measure the other 84% through social and environmental indicators to route rewards back to where they belong.
      </p>
    </div>
  );
}
