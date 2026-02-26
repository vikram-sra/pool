"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Target, ArrowUpRight, Users, CheckCircle2 } from "lucide-react";
import { BRANDS, CAMPAIGNS } from "@/data/campaigns";
import type { Brand } from "@/types";
import LifecycleTracker from "@/components/ui/LifecycleTracker";

const CATEGORIES = ["ALL", "TECH", "APPAREL", "HOME", "RESTAURANTS", "LOCAL"] as const;

export default function EcosystemView() {
    const [search, setSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [activeSubTab, setActiveSubTab] = useState<"funding" | "vote" | "idea">("funding");
    const [activeCategory, setActiveCategory] = useState<string>("ALL");

    const filteredBrands = BRANDS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
    const topFunding = CAMPAIGNS.filter(c => c.lifecycle === "FUNDING").slice(0, 3);
    const topVoting = CAMPAIGNS.filter(c => c.lifecycle === "VOTING").slice(0, 3);
    const trendingCampaigns = activeCategory === "ALL"
        ? CAMPAIGNS.slice(0, 6)
        : CAMPAIGNS.filter(c => c.category === activeCategory).slice(0, 6);

    // ── BRAND DETAIL ──
    if (selectedBrand) {
        const brandCampaigns = CAMPAIGNS.filter((c) => c.brand.toLowerCase().includes(selectedBrand.name.toLowerCase()));
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-nav no-scrollbar pt-safe pointer-events-auto z-10" style={{ background: "#0D0C0B" }}>
                <div className="max-w-5xl mx-auto px-4 md:px-8 pt-3 pb-4">
                    <button
                        onClick={() => setSelectedBrand(null)}
                        aria-label="Back to Explore"
                        className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] mb-6 transition-colors"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                        ← Back to Explore
                    </button>

                    {/* Brand Hero */}
                    <div className="rounded-[var(--radius-xl)] border p-6 md:p-10 mb-6" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", boxShadow: "var(--shadow-card)" }}>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[var(--radius-lg)] flex items-center justify-center border p-3 shrink-0" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                                {selectedBrand.iconPath ? (
                                    <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: selectedBrand.iconHex || '#fff' }}>
                                        <path d={selectedBrand.iconPath} />
                                    </svg>
                                ) : selectedBrand.brandLogo ? (
                                    <img src={selectedBrand.brandLogo} alt={selectedBrand.name} className="w-full h-full object-contain brightness-200" />
                                ) : (
                                    <span className="font-bold text-4xl" style={{ color: "#F5F0EB" }}>{selectedBrand.name[0]}</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2" style={{ color: "#F5F0EB" }}>
                                    {selectedBrand.name} <CheckCircle2 size={20} style={{ color: "#38BDF8" }} />
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>Verified <CheckCircle2 size={10} /></span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Since {selectedBrand.joinedYear || 2019}</span>
                                </div>
                                {selectedBrand.description && <p className="text-[13px] font-medium mt-3 max-w-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{selectedBrand.description}</p>}
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
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[var(--radius-lg)] p-4 md:p-6 border" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", boxShadow: "var(--shadow-card)" }}>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                                <div className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: "#F5F0EB" }}>{s.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sub-tabs */}
                    <div className="flex gap-2 p-1 rounded-[var(--radius-sm)] mb-6 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                        {[{ id: "funding", label: "Funding" }, { id: "vote", label: "Voting" }, { id: "idea", label: "Ideation" }].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                                aria-label={`${tab.label} tab`}
                                className="flex-1 py-2.5 rounded-[10px] font-bold uppercase tracking-wider text-[11px] transition-all duration-200"
                                style={{
                                    background: activeSubTab === tab.id ? "#231F1B" : "transparent",
                                    color: activeSubTab === tab.id ? "#F5F0EB" : "rgba(255,255,255,0.35)",
                                    border: activeSubTab === tab.id ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                                    minHeight: "var(--min-touch)",
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeSubTab === "funding" && (
                            <motion.div key="funding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                {brandCampaigns.length > 0 ? brandCampaigns.map((c) => (
                                    <div key={c.id} className="relative rounded-[var(--radius-lg)] border p-5 md:p-6 transition-all cursor-pointer group" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)" }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Funding Active</div>
                                            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.08)" }}>
                                                {Math.round((c.pledged / c.goal) * 100)}% Funded
                                            </div>
                                        </div>
                                        <h4 className="text-xl md:text-2xl font-bold tracking-tight mb-1.5 transition-colors" style={{ color: "#F5F0EB" }}>{c.title}</h4>
                                        <p className="text-[12px] font-medium mb-5 leading-relaxed max-w-2xl line-clamp-2" style={{ color: "rgba(255,255,255,0.4)" }}>{c.description}</p>
                                        <div className="w-full">
                                            <LifecycleTracker currentStage={c.lifecycle} color={c.color} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center font-bold uppercase tracking-wider text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No active funding</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }

    // ── ECOSYSTEM HUB ──
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[90px] no-scrollbar pt-safe pointer-events-auto" style={{ background: "#0D0C0B" }}>
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-2" style={{ color: "#F5F0EB" }}>Explore</h1>
                        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Live demand signals across the entire pool.</p>
                    </div>
                </header>

                {/* Category filter chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
                            style={{
                                background: activeCategory === cat ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${activeCategory === cat ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                                color: activeCategory === cat ? "#F59E0B" : "rgba(255,255,255,0.4)",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                    {/* LEFT COL: Stats + Trends */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">

                        {/* Total Escrowed */}
                        <div className="p-5 rounded-[var(--radius-xl)] border" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", boxShadow: "var(--shadow-card)" }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(245,158,11,0.12)" }}>
                                <Zap size={14} style={{ color: "#F59E0B" }} />
                            </div>
                            <div className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Total Escrowed</div>
                            <div className="text-3xl font-bold tracking-tight" style={{ color: "#F5F0EB" }}>$24.8M</div>
                        </div>

                        {/* Active Backers */}
                        <div className="p-5 rounded-[var(--radius-xl)] border" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", boxShadow: "var(--shadow-card)" }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(34,197,94,0.12)" }}>
                                <Users size={14} style={{ color: "#22C55E" }} />
                            </div>
                            <div className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Active Backers</div>
                            <div className="text-3xl font-bold tracking-tight" style={{ color: "#F5F0EB" }}>142k</div>
                        </div>

                        {/* Trending Funding */}
                        <div className="col-span-2 rounded-[var(--radius-xl)] border p-5" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", boxShadow: "var(--shadow-card)" }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#F5F0EB" }}>Trending · Funding</span>
                                </div>
                                <ArrowUpRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                            </div>
                            <div className="space-y-3">
                                {topFunding.map(c => (
                                    <div key={c.id} className="flex items-center justify-between group cursor-pointer py-1">
                                        <div>
                                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{c.brand}</div>
                                            <div className="text-sm font-bold transition-colors" style={{ color: "#F5F0EB" }}>{c.title}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] font-bold" style={{ color: "#F59E0B" }}>{Math.round((c.pledged / c.goal) * 100)}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trending Voting */}
                        <div className="col-span-2 rounded-[var(--radius-xl)] border p-5" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", boxShadow: "var(--shadow-card)" }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target size={14} style={{ color: "#C084FC" }} />
                                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#F5F0EB" }}>Trending · Voting</span>
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{topVoting.length} Active</span>
                            </div>
                            <div className="space-y-3">
                                {topVoting.map(c => (
                                    <div key={c.id} className="flex items-center justify-between group cursor-pointer py-1">
                                        <div>
                                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{c.brand}</div>
                                            <div className="text-sm font-bold transition-colors" style={{ color: "#F5F0EB" }}>{c.title}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Ends in 2d</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trending campaigns grid */}
                        {trendingCampaigns.length > 0 && (
                            <div className="col-span-2">
                                <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    {activeCategory === "ALL" ? "All Campaigns" : activeCategory} · {trendingCampaigns.length} active
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {trendingCampaigns.map((c, i) => (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="rounded-[var(--radius-lg)] p-4 border cursor-pointer transition-all hover:border-white/15"
                                            style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", borderLeft: `3px solid ${c.color}` }}
                                        >
                                            <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{c.brand}</div>
                                            <div className="text-[13px] font-bold leading-snug mb-2" style={{ color: "#F5F0EB" }}>{c.title}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${c.color}20`, color: c.color }}>{c.lifecycle}</span>
                                                <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{Math.round((c.pledged / c.goal) * 100)}%</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL: Brands Directory */}
                    <div className="rounded-[var(--radius-xl)] border flex flex-col overflow-hidden lg:h-[calc(100vh-180px)]" style={{ background: "#1A1714", borderColor: "rgba(255,255,255,0.08)", boxShadow: "var(--shadow-card)" }}>
                        <div className="p-5 border-b sticky top-0 z-10" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#1A1714" }}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#F5F0EB" }}>Verified Brands</span>
                                <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{filteredBrands.length}</span>
                            </div>
                            <div className="rounded-[var(--radius-sm)] border p-2.5 flex items-center gap-2 transition-all" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                                <Search size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search partners..."
                                    aria-label="Search brands"
                                    className="bg-transparent border-none outline-none font-semibold w-full text-[12px]"
                                    style={{ color: "#F5F0EB" }}
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
                                    className="w-full relative rounded-[var(--radius-lg)] p-3 flex items-center justify-between group transition-colors text-left"
                                    style={{ background: "transparent", minHeight: "var(--min-touch)" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center p-2 shrink-0 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                                            {brand.iconPath ? (
                                                <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: brand.iconHex || '#fff' }}>
                                                    <path d={brand.iconPath} />
                                                </svg>
                                            ) : brand.brandLogo ? (
                                                <img src={brand.brandLogo} alt={brand.name} className="w-full h-full object-contain brightness-200" />
                                            ) : (
                                                <span className="font-bold text-sm" style={{ color: "#F5F0EB" }}>{brand.name[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold tracking-tight flex items-center gap-1" style={{ color: "#F5F0EB" }}>
                                                {brand.name} <CheckCircle2 size={12} style={{ color: "#38BDF8" }} />
                                            </h3>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{brand.campaigns} Active</p>
                                        </div>
                                    </div>
                                    <div className="w-7 h-7 rounded-full border flex items-center justify-center transition-all" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}>
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
