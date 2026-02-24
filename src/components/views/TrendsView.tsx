"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudLightning, Target, Zap, Edit3, Users, ArrowLeft, TrendingUp } from "lucide-react";
import { CAMPAIGNS } from "@/data/campaigns";
import { CATEGORIES } from "@/constants";
import type { Campaign } from "@/types";
import LifecycleTracker from "@/components/ui/LifecycleTracker";
import StatsRow from "@/components/ui/StatsRow";

export default function TrendsView() {
    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const [activeTrendTab, setActiveTrendTab] = useState<"PLEDGING" | "VOTING" | "SUBMITTING">("PLEDGING");
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const TREND_STAGES: Record<string, string[]> = {
        PLEDGING: ["SPARK", "PLEDGE"],
        VOTING: ["LOCKED"],
        SUBMITTING: ["GREENLIGHT", "PRODUCTION"],
    };
    const filteredCampaigns = CAMPAIGNS.filter((c) => {
        const catMatch = activeCategory === "ALL" || c.category === activeCategory;
        const stageMatch = TREND_STAGES[activeTrendTab]?.includes(c.lifecycle) ?? true;
        return catMatch && stageMatch;
    });
    const tabCount = (tab: string) => CAMPAIGNS.filter((c) => (TREND_STAGES[tab] ?? []).includes(c.lifecycle)).length;

    // ── CAMPAIGN DETAIL ──
    if (selectedCampaign) {
        const progress = (selectedCampaign.pledged / selectedCampaign.goal) * 100;
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[100px] no-scrollbar bg-transparent pt-safe pointer-events-auto">
                <div className="max-w-4xl mx-auto p-5 md:p-10">
                    <button onClick={() => setSelectedCampaign(null)} className="flex items-center gap-2 text-white/50 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-white transition-colors group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <div className="glass-heavy rounded-3xl border border-white/10 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                        {/* Hero band */}
                        <div className="h-2 w-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: selectedCampaign.color, color: selectedCampaign.color }} />
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="glass-dark border border-white/10 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">Verified</span>
                                <span className="font-black text-xs uppercase drop-shadow-[0_0_8px_currentColor]" style={{ color: selectedCampaign.color }}>{selectedCampaign.deadline} LEFT</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_15px_currentColor] leading-none mb-2" style={{ color: selectedCampaign.color }}>{selectedCampaign.title}</h1>
                            <p className="text-sm font-bold font-mono tracking-widest text-white/50 mb-6">by {selectedCampaign.brand}</p>

                            <div className="mb-6"><LifecycleTracker currentStage={selectedCampaign.lifecycle} color={selectedCampaign.color} /></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest mb-3 text-white/50">Concept</h3>
                                    <p className="text-sm font-medium text-white/80 leading-relaxed">{selectedCampaign.description}</p>
                                    {selectedCampaign.variants && selectedCampaign.variants.length > 0 && (
                                        <div className="mt-6 space-y-3">
                                            <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Community Vote</h4>
                                            {selectedCampaign.variants.map((v) => {
                                                const total = selectedCampaign.variants!.reduce((a, b) => a + b.votes, 0);
                                                const pct = Math.round((v.votes / total) * 100);
                                                return (
                                                    <div key={v.id} className="flex items-center gap-3">
                                                        {v.hex && <div className="w-5 h-5 rounded-md border border-white/20 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: v.hex, color: v.hex }} />}
                                                        <span className="text-xs font-bold uppercase flex-1 text-white">{v.label}</span>
                                                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: v.hex || selectedCampaign.color, color: v.hex || selectedCampaign.color }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-[var(--neon-cyan)] w-8 text-right font-mono">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-5">
                                    <div className="flex justify-between font-black uppercase text-[11px] text-white/60">
                                        <span className="text-[var(--neon-cyan)] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">${selectedCampaign.pledged.toLocaleString()}</span>
                                        <span>Goal ${selectedCampaign.goal.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full relative overflow-hidden shadow-[0_0_10px_currentColor]" style={{ backgroundColor: selectedCampaign.color, color: selectedCampaign.color }}>
                                            <div className="absolute inset-0 shimmer" />
                                        </motion.div>
                                    </div>
                                    {selectedCampaign.backers && (
                                        <div className="text-[10px] font-bold text-white/40 uppercase flex items-center gap-2 font-mono"><Users size={12} /> {selectedCampaign.backers.toLocaleString()} backers</div>
                                    )}
                                    <button className="w-full py-4.5 bg-[var(--electric-green)] text-black rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(0,255,102,0.4)] transition-all mt-4">
                                        Lock $100 Allocation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── MAIN TRENDS VIEW ──
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[100px] no-scrollbar bg-transparent pt-safe pointer-events-auto">
            <div className="max-w-7xl mx-auto p-5 md:p-10">

                {/* Header */}
                <header className="mb-10">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] mb-2 flex items-center gap-2">
                        <TrendingUp size={12} /> Market Intelligence
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        Global <span className="gradient-text drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">Trends</span>
                    </h1>
                </header>

                <div className="space-y-10">
                    {/* Stats */}
                    <StatsRow />

                    {/* Bento Grid — Hyper-Growth + Alpha */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--neon-cyan)]/20 to-[var(--neon-pink)]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative glass-heavy rounded-3xl p-6 md:p-8 text-white overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
                                <div className="relative">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-5 flex items-center gap-3">
                                        <CloudLightning className="text-[var(--neon-cyan)] drop-shadow-[0_0_8px_var(--neon-cyan)]" size={26} /> Hyper-Growth
                                    </h2>
                                    <div className="flex flex-wrap gap-2.5">
                                        {["#Y2K_REVIVAL", "#NEOBRUTALISM", "#ANALOG_TECH", "#CYBER_GOTH", "#VANTABLACK", "#CARBON_FIBER", "#TRANSPARENT", "#RAW_ALUMINUM"].map((tag, i) => (
                                            <motion.span key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-3.5 py-2 glass-dark text-white/80 font-black uppercase text-[10px] rounded-xl border border-white/10 hover:border-[var(--neon-cyan)] hover:text-white hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all cursor-pointer drop-shadow-md">{tag}</motion.span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-heavy rounded-3xl p-6 border border-white/10 flex flex-col justify-center items-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[var(--electric-green)] transition-all duration-300">
                            <div className="w-16 h-16 rounded-2xl glass-dark border border-white/10 flex items-center justify-center mb-5 group-hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all">
                                <Target size={28} className="text-[var(--electric-green)] drop-shadow-[0_0_8px_var(--electric-green)]" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-2 text-white">Alpha Signal</h3>
                            <p className="text-[11px] font-medium text-white/50 leading-relaxed font-mono tracking-wide">45% increase in verified demand for titanium-based utility.</p>
                        </div>
                    </div>

                    {/* Demand Ledger */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Demand Ledger</h2>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all duration-300 ${activeCategory === cat
                                            ? "bg-white text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                            : "glass-dark border-white/10 text-white/50 hover:text-white hover:border-white/30"
                                            }`}>{cat}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Sub-tabs */}
                            <div className="grid grid-cols-3 gap-3">
                                {([
                                    { id: "PLEDGING" as const, icon: <Zap size={16} />, count: `${tabCount("PLEDGING")} Active` },
                                    { id: "VOTING" as const, icon: <Target size={16} />, count: `${tabCount("VOTING")} Staging` },
                                    { id: "SUBMITTING" as const, icon: <Edit3 size={16} />, count: `${tabCount("SUBMITTING")} Ready` },
                                ]).map((tab) => (
                                    <button key={tab.id} onClick={() => setActiveTrendTab(tab.id)} className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 text-center group ${activeTrendTab === tab.id
                                        ? "glass-heavy border-[var(--neon-cyan)] text-white shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                                        : "glass-dark border-white/5 text-white/50 hover:border-white/20 hover:text-white"
                                        }`}>
                                        <div className={`${activeTrendTab === tab.id ? "text-[var(--neon-cyan)] drop-shadow-[0_0_8px_var(--neon-cyan)]" : "text-white/40 group-hover:text-white/80"} transition-colors`}>{tab.icon}</div>
                                        <div className="font-black uppercase tracking-widest text-[10px] md:text-xs mt-1">{tab.id}</div>
                                        <div className="hidden md:block text-[9px] font-bold text-white/30 font-mono tracking-widest">{tab.count}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Campaign Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                            <AnimatePresence mode="popLayout">
                                {filteredCampaigns.map((campaign, i) => {
                                    const pct = Math.round((campaign.pledged / campaign.goal) * 100);
                                    return (
                                        <motion.div
                                            key={campaign.id}
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 20 }}
                                            className="group relative cursor-pointer"
                                            onClick={() => setSelectedCampaign(campaign)}
                                        >
                                            {/* Hover glow */}
                                            <div className="absolute -inset-1.5 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: campaign.color }} />

                                            <div className="relative glass-heavy rounded-2xl border border-white/10 overflow-hidden group-hover:border-white/30 shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all duration-300">
                                                {/* Data-driven thumbnail */}
                                                <div className="w-full h-40 md:h-48 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${campaign.color}20 0%, transparent 100%)` }}>
                                                    {/* Radial glow */}
                                                    <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at 50% 40%, ${campaign.color}40 0%, transparent 70%)` }} />

                                                    {/* Centerpiece: brand icon + model type */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl glass-dark flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_20px_currentColor]" style={{ border: `1px solid ${campaign.color}50`, color: campaign.color }}>
                                                            <span className="text-xl md:text-3xl font-black leading-none drop-shadow-[0_0_8px_currentColor]" style={{ color: campaign.color }}>{campaign.brand[0]}</span>
                                                        </div>
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/5">{campaign.modelType}</span>
                                                    </div>

                                                    {/* Lifecycle chip top-left */}
                                                    <div className="absolute top-3 left-3">
                                                        <span className="px-2 py-1 text-[7px] font-black uppercase tracking-widest rounded-lg text-white shadow-[0_0_10px_currentColor]" style={{ backgroundColor: campaign.color, color: campaign.color }}>{campaign.lifecycle}</span>
                                                    </div>

                                                    {/* Deadline bottom-right */}
                                                    <div className="absolute bottom-3 right-3 glass-dark px-2 py-1 rounded-md border border-white/5">
                                                        <span className="text-[7.5px] font-black uppercase drop-shadow-[0_0_5px_currentColor]" style={{ color: campaign.color }}>{campaign.deadline}</span>
                                                    </div>
                                                </div>

                                                <div className="p-4 md:p-5">
                                                    <h4 className="text-xs md:text-sm font-black uppercase tracking-tighter text-white mb-1 line-clamp-1 group-hover:text-[var(--neon-cyan)] transition-colors">{campaign.title}</h4>
                                                    <p className="text-[9px] md:text-[10px] font-bold font-mono tracking-widest text-white/40 mb-4">{campaign.brand}</p>
                                                    <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase mb-2">
                                                        <span className="flex items-center gap-1.5 text-white/50"><Users size={10} />{campaign.squadsCount}</span>
                                                        <span className="tabular-nums font-mono drop-shadow-[0_0_5px_currentColor]" style={{ color: campaign.color }}>{pct}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: campaign.color, color: campaign.color }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
