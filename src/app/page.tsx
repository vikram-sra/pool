"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { CAMPAIGNS, BRANDS } from "@/data/campaigns";
import { CAMERA_POSITION, CAMERA_FOV } from "@/constants";
import type { TabId } from "@/types";
import { X, ChevronDown, Send } from "lucide-react";

import ThreeScene from "@/components/three/ThreeScene";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import BottomNav from "@/components/ui/BottomNav";
import FeedView from "@/components/views/FeedView";
import TrendsView from "@/components/views/TrendsView";
import BrandsView from "@/components/views/BrandsView";
import ProfileView from "@/components/views/ProfileView";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabId>("FEED");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [hasInteracted3D, setHasInteracted3D] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const isInteractingWithObject = useRef(false);

  const currentCampaign = CAMPAIGNS[currentIndex % CAMPAIGNS.length];

  useEffect(() => {
    const handleUp = () => { isInteractingWithObject.current = false; };
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => { window.removeEventListener("pointerup", handleUp); window.removeEventListener("pointercancel", handleUp); };
  }, []);

  return (
    <div className="fixed inset-0 w-[100dvw] h-[100dvh] bg-black overflow-hidden">
      {/* 3D CANVAS */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${currentTab === "FEED" ? "opacity-100 z-10" : "opacity-0 -z-50"}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F4F0] via-[#E8E6E1] to-[#D8D6D0]" />
        <div className="absolute inset-0">
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Canvas
                dpr={typeof navigator !== "undefined" && ((navigator as any).deviceMemory ?? 8) <= 4 ? [1, 1.5] : [1, 2]}
                camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
                gl={{ preserveDrawingBuffer: true }}
                style={{ touchAction: "none" }}
              >
                <ThreeScene
                  currentCampaign={currentCampaign}
                  currentIndex={currentIndex}
                  onInteractionStart={() => { isInteractingWithObject.current = true; setHasInteracted3D(true); }}
                  onToggleZen={() => setIsZenMode((p) => !p)}
                />
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Non-feed backgrounds */}
      {currentTab !== "FEED" && <div className="absolute inset-0 bg-[#F5F4F0] z-10" />}

      {/* VIEW LAYER */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          {currentTab === "FEED" && (
            <FeedView
              key="feed"
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              currentCampaign={currentCampaign}
              isInteractingWithObject={isInteractingWithObject}
              currentTab={currentTab}
              isZenMode={isZenMode}
              setIsZenMode={setIsZenMode}
              hasInteracted3D={hasInteracted3D}
              isPitchOpen={showPitch}
            />
          )}
          {currentTab === "TRENDS" && <TrendsView key="trends" />}
          {currentTab === "BRANDS" && <BrandsView key="brands" />}
          {currentTab === "PROFILE" && <ProfileView key="profile" />}
        </AnimatePresence>
      </div>

      {/* BOTTOM NAV */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
        <BottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          hidden={isZenMode && currentTab === "FEED"}
          onPitch={() => setShowPitch(true)}
        />
      </div>

      {/* PITCH SHEET */}
      <AnimatePresence>
        {showPitch && <PitchSheet onClose={() => setShowPitch(false)} initialBrand={BRANDS.find(b => currentCampaign.brand.toLowerCase().startsWith(b.name.toLowerCase()))?.name} />}
      </AnimatePresence>
    </div>
  );
}

function PitchSheet({ onClose, initialBrand }: { onClose: () => void; initialBrand?: string }) {
  const [selectedBrand, setSelectedBrand] = useState(initialBrand ?? "");
  const [pitchText, setPitchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-[#F5F4F0] rounded-t-2xl flex flex-col overflow-hidden max-h-[80vh]"
      >
        <div className="flex justify-center pt-2.5 pb-1"><div className="w-8 h-1 bg-[#1C1C1C]/10 rounded-full" /></div>
        <div className="flex justify-between items-center px-4 pb-3">
          <h3 className="text-lg font-black uppercase tracking-tighter text-[#1C1C1C]">Pitch an Idea</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#1C1C1C]/5 flex items-center justify-center"><X size={14} /></button>
        </div>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto no-scrollbar">
          {/* Brand selector */}
          <div>
            <label className="block text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/30 mb-1.5">Select Brand</label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between bg-white rounded-xl border border-[#1C1C1C]/10 p-3 text-left"
              >
                <span className={`text-sm font-semibold ${selectedBrand ? "text-[#1C1C1C]" : "text-[#1C1C1C]/25"}`}>
                  {selectedBrand || "Choose a brand to pitch to..."}
                </span>
                <ChevronDown size={16} className={`text-[#1C1C1C]/30 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#1C1C1C]/10 shadow-lg z-10 max-h-48 overflow-y-auto no-scrollbar">
                    {BRANDS.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => { setSelectedBrand(b.name); setShowDropdown(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#1C1C1C]/3 transition-colors border-b border-[#1C1C1C]/3 last:border-0"
                      >
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: b.hue }}>{b.name[0]}</div>
                        <div>
                          <div className="text-xs font-bold text-[#1C1C1C]">{b.name}</div>
                          <div className="text-[8px] text-[#1C1C1C]/30">{b.campaigns} campaigns</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pitch text */}
          <div>
            <label className="block text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/30 mb-1.5">Your Idea</label>
            <textarea
              value={pitchText}
              onChange={e => setPitchText(e.target.value)}
              placeholder="Describe the product you want to see exist..."
              className="w-full bg-white rounded-xl border border-[#1C1C1C]/10 p-3 text-sm font-medium text-[#1C1C1C] placeholder-[#1C1C1C]/15 outline-none focus:border-[#1C1C1C]/20 resize-none h-28 leading-relaxed"
            />
            <div className="text-right mt-1">
              <span className="text-[8px] text-[#1C1C1C]/20 font-medium">{pitchText.length}/500</span>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={!selectedBrand || !pitchText.trim()}
            className="w-full py-3 bg-[#1C1C1C] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#1C1C1C]/90 transition-all"
          >
            <Send size={14} /> Submit Pitch
          </button>

          <p className="text-[8px] text-center text-[#1C1C1C]/20 font-medium leading-relaxed px-4">
            Pitches are reviewed by brand partners within 7 days. Top ideas advance to community voting.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
