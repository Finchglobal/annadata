"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/80 backdrop-blur border border-primary/10 rounded-full text-sm font-bold text-primary transition-all shadow-sm"
      >
        <Globe size={16} className="text-primary" />
        <span className="uppercase">{i18n.language}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-emerald-900/10 border border-emerald-50 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-2 space-y-1">
            {languages.map((lng) => (
              <button
                key={lng.code}
                onClick={() => {
                  i18n.changeLanguage(lng.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                  i18n.language === lng.code 
                    ? "bg-accent/20 text-primary font-black" 
                    : "text-gray-600 hover:bg-gray-50 font-semibold"
                }`}
              >
                <span>{lng.native}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">{lng.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
