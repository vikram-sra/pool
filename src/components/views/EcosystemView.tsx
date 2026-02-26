"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Target, ArrowUpRight, Users, CheckCircle2 } from "lucide-react";
import { BRANDS, CAMPAIGNS } from "@/data/campaigns";
import type { Brand, Campaign } from "@/types";
import LifecycleTracker from "@/components/ui/LifecycleTracker";

export default function EcosystemView() {
    const [search, setSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [activeSubTab, setActiveSubTab] = useState<"funding" | "vote" | "idea">("funding");

    const filteredBrands = BRANDS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

    // ── BRAND DETAIL ──
    if (selectedBrand) {
        const brandCampaigns = CAMPAIGNS.filter((c) => c.brand.toLowerCase().includes(selectedBrand.name.toLowerCase()));
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-nav no-scrollbar bg-gray-50 pt-safe pointer-events-auto z-10">
                <div className="max-w-5xl mx-auto px-4 md:px-8 pt-3 pb-4">
                    <button
                        onClick={() => setSelectedBrand(null)}
                        aria-label="Back to Explore"
                        className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-[11px] mb-6 hover:text-black transition-colors group"
                    >
                        ← Back to Explore
                    </button>

                    {/* Brand Hero */}
                    <div className="bg-white rounded-[var(--radius-xl)] border border-gray-100 p-6 md:p-10 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[var(--radius-lg)] flex items-center justify-center border border-gray-100 bg-gray-50/50 shadow-sm p-3 shrink-0">
                                {selectedBrand.iconPath ? (
                                    <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: selectedBrand.iconHex || '#000' }}>
                                        <path d={selectedBrand.iconPath} />
                                    </svg>
                                ) : selectedBrand.brandLogo ? (
                                    <img src={selectedBrand.brandLogo} alt={selectedBrand.name} className="w-full h-full object-contain mix-blend-multiply" />
                                ) : (
                                    <span className="font-bold text-4xl text-gray-900">{selectedBrand.name[0]}</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                                    {selectedBrand.name} <CheckCircle2 size={20} className="text-blue-600" />
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="bg-gray-100/80 text-gray-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">Verified <CheckCircle2 size={10} /></span>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Since {selectedBrand.joinedYear || 2019}</span>
                                </div>
                                {selectedBrand.description && <p className="text-[13px] font-medium text-gray-500 mt-3 max-w-lg leading-relaxed">{selectedBrand.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Brand Stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                        {[
                            { label: "Total Raised", value: selectedBrand.totalRaised },
                            { label: "Campaigns", value: String(selectedBrand.campaigns) },
                            { label: "Active Now", value: String(brandCampaigns.length) },
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-[var(--radius-lg)] p-4 md:p-6 border border-gray-100" style={{ boxShadow: "var(--shadow-card)" }}>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{s.label}</div>
                                <div className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{s.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sub-tabs */}
                    <div className="flex gap-2 p-1 bg-gray-100/50 rounded-[var(--radius-sm)] mb-6 border border-gray-200/50">
                        {[
                            { id: "funding", label: "Funding" },
                            { id: "vote", label: "Voting" },
                            { id: "idea", label: "Ideation" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                                aria-label={`${tab.label} tab`}
                                className={`flex-1 py-2.5 rounded-[10px] font-bold uppercase tracking-wider text-[11px] transition-all duration-200 ${activeSubTab === tab.id
                                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                                style={{ minHeight: "var(--min-touch)" }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeSubTab === "funding" && (
                            <motion.div key="funding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                {brandCampaigns.length > 0 ? brandCampaigns.map((c) => (
                                    <div key={c.id} className="relative bg-white rounded-[var(--radius-lg)] border border-gray-100 p-5 md:p-6 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Funding Active</div>
                                            <div className="bg-black/5 text-gray-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200/50">
                                                {Math.round((c.pledged / c.goal) * 100)}% Funded
                                            </div>
                                        </div>
                                        <h4 className="text-xl md:text-2xl font-bold tracking-tight mb-1.5 text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</h4>
                                        <p className="text-[12px] font-medium text-gray-500 mb-5 leading-relaxed max-w-2xl line-clamp-2">{c.description}</p>
                                        <div className="w-full">
                                            <LifecycleTracker currentStage={c.lifecycle} color={c.color} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-wider text-xs">No active funding</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }

    // ── ECOSYSTEM HUB (Bento Grid) ──
    const topFunding = CAMPAIGNS.filter(c => c.lifecycle === "FUNDING").slice(0, 3);
    const topVoting = CAMPAIGNS.filter(c => c.lifecycle === "VOTING").slice(0, 3);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[90px] no-scrollbar bg-[#F9FAFB] pt-safe pointer-events-auto">
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-2">Explore</h1>
                        <p className="text-sm font-medium text-gray-500">Live demand signals across the entire pool.</p>
                    </div>
                </header>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                    {/* LEFT COL: Live Network Stats */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[var(--radius-xl)] border border-gray-100" style={{ boxShadow: "var(--shadow-card)" }}>
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                <Zap size={14} />
                            </div>
                            <div className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">Total Escrowed</div>
                            <div className="text-3xl font-bold tracking-tight text-gray-900">$24.8M</div>
                        </div>
                        <div className="bg-white p-5 rounded-[var(--radius-xl)] border border-gray-100" style={{ boxShadow: "var(--shadow-card)" }}>
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <Users size={14} />
                            </div>
                            <div className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">Active Backers</div>
                            <div className="text-3xl font-bold tracking-tight text-gray-900">142k</div>
                        </div>

                        {/* Top Funding Trends */}
                        <div className="col-span-2 bg-white rounded-[var(--radius-xl)] border border-gray-100 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Trending · Funding</span>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {topFunding.map(c => (
                                    <div key={c.id} className="flex items-center justify-between group cursor-pointer py-1">
                                        <div>
                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{c.brand}</div>
                                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] font-bold text-gray-900">{Math.round((c.pledged / c.goal) * 100)}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Voting Trends */}
                        <div className="col-span-2 bg-white rounded-[var(--radius-xl)] border border-gray-100 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target size={14} className="text-purple-500" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Trending · Voting</span>
                                </div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{topVoting.length} Active</span>
                            </div>
                            <div className="space-y-3">
                                {topVoting.map(c => (
                                    <div key={c.id} className="flex items-center justify-between group cursor-pointer py-1">
                                        <div>
                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{c.brand}</div>
                                            <div className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{c.title}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] font-bold text-gray-900">Ends in 2d</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: Brands Directory */}
                    <div className="bg-white rounded-[var(--radius-xl)] border border-gray-100 flex flex-col overflow-hidden lg:h-[calc(100vh-180px)]" style={{ boxShadow: "var(--shadow-card)" }}>
                        <div className="p-5 border-b border-gray-100 glass-heavy sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Verified Brands</span>
                                <span className="text-[10px] font-semibold text-gray-400">{filteredBrands.length}</span>
                            </div>
                            <div className="bg-gray-50 rounded-[var(--radius-sm)] border border-gray-200/60 p-2.5 flex items-center gap-2 focus-within:border-gray-300 focus-within:bg-white transition-all">
                                <Search size={14} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search partners..."
                                    aria-label="Search brands"
                                    className="bg-transparent border-none outline-none font-semibold w-full text-gray-900 placeholder-gray-400 text-[12px]"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                            {filteredBrands.map((brand, i) => (
                                <motion.button
                                    key={brand.name}
                                    onClick={() => setSelectedBrand(brand)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    aria-label={`View ${brand.name} details`}
                                    className="w-full relative bg-transparent hover:bg-gray-50 rounded-[var(--radius-lg)] p-3 flex items-center justify-between group transition-colors text-left"
                                    style={{ minHeight: "var(--min-touch)" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-white border border-gray-100 flex items-center justify-center p-2 shadow-sm shrink-0">
                                            {brand.iconPath ? (
                                                <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: brand.iconHex || '#000' }}>
                                                    <path d={brand.iconPath} />
                                                </svg>
                                            ) : brand.brandLogo ? (
                                                <img src={brand.brandLogo} alt={brand.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <span className="font-bold text-sm text-gray-900">{brand.name[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold tracking-tight text-gray-900 flex items-center gap-1">
                                                {brand.name} <CheckCircle2 size={12} className="text-blue-600" />
                                            </h3>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{brand.campaigns} Active</p>
                                        </div>
                                    </div>
                                    <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-gray-900 group-hover:text-white group-hover:bg-gray-900 transition-all">
                                        <ArrowUpRight size={12} />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
