"use client";

import { Users, Satellite, IndianRupee } from "lucide-react";

interface AICBreakdownProps {
  wSocial: number;
  wRegen: number;
  gapFactor: number;
  areaHectares: number;
  yearlyYield: number;
  totalAic: number;
}

export default function AICBreakdown({ wSocial, wRegen, gapFactor, areaHectares, yearlyYield, totalAic }: AICBreakdownProps) {
  const socialContrib = areaHectares * wSocial;
  const regenContrib = areaHectares * wRegen;
  const yieldContrib = yearlyYield * gapFactor;

  const components = [
    {
      icon: <Users size={20} />,
      label: "Social Premium (W_social)",
      description: "Based on family composition & female dependency",
      value: socialContrib,
      multiplier: `W_social = ${wSocial.toFixed(2)}`,
      color: "from-blue-500/10 to-blue-500/5 border-blue-200",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      icon: <Satellite size={20} />,
      label: "Regen Multiplier (W_regen)",
      description: "Live NDVI score from Google Earth Engine",
      value: regenContrib,
      multiplier: `W_regen = ${wRegen.toFixed(2)}`,
      color: "from-emerald-500/10 to-emerald-500/5 border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: <IndianRupee size={20} />,
      label: "Yield Gap Recovery",
      description: "Recovering the 84% supply chain value loss",
      value: yieldContrib,
      multiplier: `Gap = ${gapFactor.toFixed(2)}`,
      color: "from-orange-500/10 to-orange-500/5 border-orange-200",
      iconBg: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-primary mb-6">AIC Credit Breakdown</h2>
      <div className="space-y-4">
        {components.map((comp) => (
          <div
            key={comp.label}
            className={`bg-gradient-to-r ${comp.color} border rounded-2xl p-5 flex items-center gap-4`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${comp.iconBg}`}>{comp.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm">{comp.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{comp.description}</div>
              <div className="text-xs font-mono text-gray-500 mt-1">{comp.multiplier}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-extrabold text-gray-800">
                {comp.value.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">AIC pts</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-dashed border-gray-200 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-500">Total AIC</div>
        <div className="text-3xl font-extrabold text-primary">
          {totalAic.toFixed(2)} <span className="text-base font-medium text-gray-500">credits</span>
        </div>
      </div>
    </section>
  );
}
