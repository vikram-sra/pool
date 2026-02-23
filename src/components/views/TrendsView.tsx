"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudLightning, Target, Zap, Edit3, Users, X, ArrowLeft, TrendingUp } from "lucide-react";
import { CAMPAIGNS } from "@/data/campaigns";
import { CATEGORIES } from "@/constants";
import type { Campaign } from "@/types";
import LifecycleTracker from "@/components/ui/LifecycleTracker";
import StatsRow from "@/components/ui/StatsRow";

export default function TrendsView() {
    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const [activeTrendTab, setActiveTrendTab] = useState<"PLEDGING" | "VOTING" | "SUBMITTING">("PLEDGING");
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const filteredCampaigns = activeCategory === "ALL" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.category === activeCategory);

    // ── CAMPAIGN DETAIL ──
    if (selectedCampaign) {
        const progress = (selectedCampaign.pledged / selectedCampaign.goal) * 100;
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[100px] no-scrollbar bg-[#F5F4F0] dot-grid pt-safe pointer-events-auto">
                <div className="max-w-4xl mx-auto p-5 md:p-10">
                    <button onClick={() => setSelectedCampaign(null)} className="flex items-center gap-2 text-[#1C1C1C]/50 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-[#1C1C1C] transition-colors group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <div className="glass rounded-2xl border border-[#1C1C1C]/5 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                        {/* Hero band */}
                        <div className="h-2 w-full" style={{ backgroundColor: selectedCampaign.color }} />
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="glass-dark text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg">Verified</span>
                                <span className="font-black text-xs uppercase" style={{ color: selectedCampaign.color }}>{selectedCampaign.deadline} LEFT</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-none mb-2">{selectedCampaign.title}</h1>
                            <p className="text-sm font-semibold text-[#1C1C1C]/40 mb-6">by {selectedCampaign.brand}</p>

                            <div className="mb-6"><LifecycleTracker currentStage={selectedCampaign.lifecycle} color={selectedCampaign.color} /></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#1C1C1C]/5">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest mb-3 text-[#1C1C1C]/50">Concept</h3>
                                    <p className="text-sm font-medium text-[#1C1C1C]/70 leading-relaxed">{selectedCampaign.description}</p>
                                    {selectedCampaign.variants && selectedCampaign.variants.length > 0 && (
                                        <div className="mt-6 space-y-2">
                                            <h4 className="text-[9px] font-black uppercase tracking-widest text-[#1C1C1C]/35 mb-2">Community Vote</h4>
                                            {selectedCampaign.variants.map((v) => {
                                                const total = selectedCampaign.variants!.reduce((a, b) => a + b.votes, 0);
                                                const pct = Math.round((v.votes / total) * 100);
                                                return (
                                                    <div key={v.id} className="flex items-center gap-3">
                                                        {v.hex && <div className="w-4 h-4 rounded-md border border-[#1C1C1C]/10" style={{ backgroundColor: v.hex }} />}
                                                        <span className="text-xs font-bold uppercase flex-1">{v.label}</span>
                                                        <div className="w-20 h-1.5 bg-[#1C1C1C]/5 rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ backgroundColor: v.hex || selectedCampaign.color }} />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-[#1C1C1C]/30 w-7 text-right">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between font-black uppercase text-[10px] text-[#1C1C1C]/50">
                                        <span>${selectedCampaign.pledged.toLocaleString()}</span>
                                        <span>Goal ${selectedCampaign.goal.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-3 bg-[#1C1C1C]/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full relative overflow-hidden" style={{ backgroundColor: selectedCampaign.color }}>
                                            <div className="absolute inset-0 shimmer" />
                                        </motion.div>
                                    </div>
                                    {selectedCampaign.backers && (
                                        <div className="text-[9px] font-bold text-[#1C1C1C]/30 uppercase flex items-center gap-1"><Users size={10} /> {selectedCampaign.backers.toLocaleString()} backers</div>
                                    )}
                                    <button className="w-full py-4 bg-[#1C1C1C] text-white rounded-xl font-black uppercase tracking-wider text-sm hover:shadow-[0_4px_20px_rgba(28,28,28,0.3)] transition-all">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[100px] no-scrollbar bg-[#F5F4F0] dot-grid pt-safe pointer-events-auto">
            <div className="max-w-7xl mx-auto p-5 md:p-10">

                {/* Header */}
                <header className="mb-10">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[#1C1C1C]/30 font-black uppercase tracking-[0.2em] text-[9px] mb-2 flex items-center gap-2">
                        <TrendingUp size={12} /> Market Intelligence
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-[0.85]">
                        Global <span className="gradient-text">Trends</span>
                    </h1>
                </header>

                <div className="space-y-10">
                    {/* Stats */}
                    <StatsRow />

                    {/* Bento Grid — Hyper-Growth + Alpha */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#34D399]/20 to-[#38BDF8]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                            <div className="relative glass-dark rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                                <div className="relative">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-5 flex items-center gap-3">
                                        <CloudLightning className="text-[#34D399]" size={24} /> Hyper-Growth
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {["#Y2K_REVIVAL", "#NEOBRUTALISM", "#ANALOG_TECH", "#CYBER_GOTH", "#VANTABLACK", "#CARBON_FIBER", "#TRANSPARENT", "#RAW_ALUMINUM"].map((tag, i) => (
                                            <motion.span key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-3 py-1.5 bg-white/10 text-white/80 font-black uppercase text-[10px] rounded-lg border border-white/10 hover:bg-[#34D399]/20 hover:border-[#34D399]/30 hover:text-white transition-all cursor-pointer backdrop-blur-sm">{tag}</motion.span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="glass rounded-2xl p-6 border border-[#1C1C1C]/5 flex flex-col justify-center items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                            <div className="w-14 h-14 rounded-xl bg-[#1C1C1C] flex items-center justify-center mb-4"><Target size={24} className="text-[#34D399]" /></div>
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-1.5">Alpha Signal</h3>
                            <p className="text-[10px] font-medium text-[#1C1C1C]/40 leading-relaxed">45% increase in verified demand for titanium-based utility.</p>
                        </div>
                    </div>

                    {/* Demand Ledger */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1C1C1C]">Demand Ledger</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {CATEGORIES.map((cat) => (
                                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all duration-200 ${activeCategory === cat
                                            ? "bg-[#1C1C1C] text-white border-[#1C1C1C]"
                                            : "glass border-[#1C1C1C]/10 text-[#1C1C1C]/50 hover:text-[#1C1C1C] hover:border-[#1C1C1C]/30"
                                            }`}>{cat}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Sub-tabs */}
                            <div className="grid grid-cols-3 gap-2">
                                {([
                                    { id: "PLEDGING" as const, icon: <Zap size={14} />, count: "128 Active" },
                                    { id: "VOTING" as const, icon: <Target size={14} />, count: "45 Staging" },
                                    { id: "SUBMITTING" as const, icon: <Edit3 size={14} />, count: "812 Ideas" },
                                ]).map((tab) => (
                                    <button key={tab.id} onClick={() => setActiveTrendTab(tab.id)} className={`p-3 md:p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1.5 text-center ${activeTrendTab === tab.id
                                        ? "glass-dark text-white border-white/10 shadow-md"
                                        : "glass border-[#1C1C1C]/5 text-[#1C1C1C] hover:border-[#1C1C1C]/15"
                                        }`}>
                                        <div className={activeTrendTab === tab.id ? "text-[#34D399]" : "text-[#1C1C1C]/40"}>{tab.icon}</div>
                                        <div className="font-black uppercase tracking-tighter text-[10px] md:text-xs">{tab.id}</div>
                                        <div className="hidden md:block text-[8px] font-bold opacity-40 uppercase tracking-widest">{tab.count}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Campaign Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                            <AnimatePresence mode="popLayout">
                                {filteredCampaigns.map((campaign, i) => {
                                    const pct = Math.round((campaign.pledged / campaign.goal) * 100);
                                    return (
                                        <motion.div
                                            key={campaign.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: i * 0.03, type: "spring", stiffness: 200, damping: 20 }}
                                            className="group relative cursor-pointer"
                                            onClick={() => setSelectedCampaign(campaign)}
                                        >
                                            {/* Hover glow */}
                                            <div className="absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundColor: campaign.color }} />

                                            <div className="relative bg-white rounded-2xl border border-[#1C1C1C]/8 overflow-hidden group-hover:border-[#1C1C1C]/15 group-hover:shadow-md transition-all duration-300">
                                                {/* Data-driven thumbnail */}
                                                <div className="w-full h-36 md:h-44 relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${campaign.color}1a 0%, ${campaign.color}08 100%)` }}>
                                                    {/* Radial glow */}
                                                    <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 45% 55%, ${campaign.color}2e 0%, transparent 65%)` }} />
                                                    {/* Centerpiece: brand icon + model type */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${campaign.color}1a`, border: `1.5px solid ${campaign.color}30` }}>
                                                            <span className="text-lg md:text-xl font-black leading-none" style={{ color: campaign.color }}>{campaign.brand[0]}</span>
                                                        </div>
                                                        <span className="text-[7px] font-black uppercase tracking-[0.18em] text-[#1C1C1C]/25">{campaign.modelType}</span>
                                                    </div>
                                                    {/* Lifecycle chip top-left */}
                                                    <div className="absolute top-2.5 left-2.5">
                                                        <span className="px-1.5 py-[3px] text-[6.5px] font-black uppercase tracking-widest rounded-md text-white" style={{ backgroundColor: campaign.color }}>{campaign.lifecycle}</span>
                                                    </div>
                                                    {/* Deadline bottom-right */}
                                                    <div className="absolute bottom-2.5 right-2.5">
                                                        <span className="text-[7px] font-black uppercase" style={{ color: campaign.color }}>{campaign.deadline}</span>
                                                    </div>
                                                </div>

                                                <div className="p-3 md:p-4">
                                                    <h4 className="text-[11px] md:text-sm font-black uppercase tracking-tighter text-[#1C1C1C] mb-0.5 line-clamp-1">{campaign.title}</h4>
                                                    <p className="text-[8px] md:text-[9px] font-semibold text-[#1C1C1C]/40 mb-2.5">{campaign.brand}</p>
                                                    <div className="flex justify-between text-[7px] md:text-[8px] font-black uppercase mb-1.5">
                                                        <span className="flex items-center gap-0.5 text-[#1C1C1C]/35"><Users size={7} />{campaign.squadsCount}</span>
                                                        <span className="tabular-nums" style={{ color: campaign.color }}>{pct}%</span>
                                                    </div>
                                                    <div className="w-full h-1 md:h-1.5 bg-[#1C1C1C]/6 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ backgroundColor: campaign.color }} />
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
