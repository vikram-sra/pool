"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Search, Target, Zap, Edit3 } from "lucide-react";
import { BRANDS, CAMPAIGNS } from "@/data/campaigns";
import type { Brand } from "@/types";

export default function BrandsView() {
    const [search, setSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [activeSubTab, setActiveSubTab] = useState<"pledge" | "vote" | "idea">("pledge");

    const filteredBrands = BRANDS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

    // ── BRAND DETAIL ──
    if (selectedBrand) {
        const brandCampaigns = CAMPAIGNS.filter((c) => c.brand.toLowerCase().includes(selectedBrand.name.toLowerCase()));
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-nav no-scrollbar bg-transparent pt-safe pointer-events-auto">
                <div className="max-w-5xl mx-auto p-5 md:p-10">
                    <button onClick={() => setSelectedBrand(null)} className="flex items-center gap-2 text-white/50 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-white transition-colors group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Ecosystem
                    </button>

                    {/* Brand Hero */}
                    <div className="glass-heavy rounded-3xl border border-white/10 p-6 md:p-8 mb-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl text-white border border-white/20 shadow-[0_0_15px_currentColor]" style={{ background: `linear-gradient(135deg, ${selectedBrand.hue}50, ${selectedBrand.hue}10)`, color: selectedBrand.hue }}>
                                <span className="drop-shadow-[0_0_8px_currentColor]">{selectedBrand.name[0]}</span>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] flex items-center gap-3">
                                    {selectedBrand.name} <CheckCircle2 size={24} className="text-[var(--neon-cyan)] drop-shadow-[0_0_8px_var(--neon-cyan)]" />
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="glass-dark border border-white/10 text-white px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-md drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">Verified</span>
                                    <span className="text-[10px] font-bold text-white/40 font-mono tracking-widest">Since {selectedBrand.joinedYear || 2019}</span>
                                </div>
                                {selectedBrand.description && <p className="text-[12px] font-medium text-white/60 mt-3 max-w-lg leading-relaxed">{selectedBrand.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Brand Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { label: "Total Raised", value: selectedBrand.totalRaised, color: selectedBrand.hue },
                            { label: "Campaigns", value: String(selectedBrand.campaigns), color: "var(--neon-cyan)" },
                            { label: "Active Now", value: String(brandCampaigns.length), color: "var(--electric-green)" },
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-dark rounded-2xl p-5 border border-white/5 shadow-inner">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</div>
                                <div className="text-2xl md:text-3xl font-black font-mono drop-shadow-[0_0_8px_currentColor]" style={{ color: s.color }}>{s.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sub-tabs */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { id: "pledge", label: "Pledging", icon: <Zap size={16} /> },
                            { id: "vote", label: "Voting", icon: <Target size={16} /> },
                            { id: "idea", label: "Ideation", icon: <Edit3 size={16} /> },
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs border transition-all duration-300 ${activeSubTab === tab.id
                                ? "glass-heavy text-white border-[var(--neon-cyan)] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                                : "glass-dark border-white/5 text-white/50 hover:text-white hover:border-white/20"
                                }`}>
                                <span className={activeSubTab === tab.id ? "text-[var(--neon-cyan)] drop-shadow-[0_0_5px_var(--neon-cyan)]" : ""}>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeSubTab === "pledge" && (
                            <motion.div key="pledge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                {brandCampaigns.length > 0 ? brandCampaigns.map((c) => (
                                    <div key={c.id} className="group relative">
                                        <div className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: c.color }} />
                                        <div className="relative glass-heavy rounded-2xl border border-white/10 p-6 md:p-8 group-hover:border-white/30 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-[0_0_5px_currentColor]" style={{ color: c.color }}>Active</div>
                                                <div className="text-white px-2.5 py-1 text-[9px] font-black uppercase rounded-lg shadow-[0_0_10px_currentColor]" style={{ backgroundColor: c.color, color: c.color }}>
                                                    <span className="text-white drop-shadow-md">{Math.round((c.pledged / c.goal) * 100)}%</span>
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">{c.title}</h4>
                                            <p className="text-[11px] font-medium text-white/50 mb-6 leading-relaxed max-w-2xl">{c.description}</p>
                                            <button className="w-full md:w-auto px-8 py-3.5 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all">Pledge</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center text-white/20 font-black uppercase tracking-widest text-sm">No active campaigns</div>
                                )}
                            </motion.div>
                        )}
                        {activeSubTab === "vote" && (
                            <motion.div key="vote" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                {[{ name: "Eco-Lumina Mesh", votes: "4.2k", rank: "01" }, { name: "Titanium Hinge V2", votes: "3.8k", rank: "02" }, { name: "Bio-Plastic Shell", votes: "2.1k", rank: "03" }].map((v, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4 group">
                                        <span className="text-2xl font-black text-white/20 w-8 tabular-nums font-mono drop-shadow-sm">{v.rank}</span>
                                        <div className="flex-1 glass-dark rounded-2xl border border-white/5 p-5 flex justify-between items-center group-hover:border-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
                                            <span className="font-black uppercase text-sm text-white">{v.name}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] font-bold text-white/40 font-mono tracking-widest">{v.votes}</span>
                                                <button className="px-5 py-2.5 glass border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:border-[var(--electric-green)] hover:text-[var(--electric-green)] hover:shadow-[0_0_10px_rgba(0,255,102,0.3)] transition-all">Vote</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                        {activeSubTab === "idea" && (
                            <motion.div key="idea" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="glass-heavy border border-[var(--neon-pink)] shadow-[0_0_20px_rgba(255,0,255,0.2)] rounded-3xl p-8 text-white">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-[var(--neon-pink)] drop-shadow-[0_0_5px_var(--neon-pink)]">Current Prompt</div>
                                    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight italic">&quot;Modular Travel: How can we make luggage disappear?&quot;</h3>
                                </div>
                                <div className="glass-dark rounded-3xl border border-white/10 p-6 md:p-8">
                                    <textarea placeholder="YOUR CONCEPT IDEA..." className="w-full glass bg-black/40 rounded-2xl border border-white/10 p-5 font-mono text-sm text-white placeholder-white/30 focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] outline-none resize-none mb-6 h-40 transition-all" />
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                                        <p className="text-[9px] font-bold text-white/40 max-w-sm font-mono tracking-widest leading-relaxed">Ideas analyzed by AI after 21 days. Top 5 advance to voting.</p>
                                        <button className="w-full md:w-auto px-10 py-4 bg-[var(--neon-cyan)] text-black rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-all">Submit</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }

    // ── BRAND LIST ──
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-nav no-scrollbar bg-transparent pt-safe pointer-events-auto">
            {/* Background is handled in page.tsx */}
            <div className="max-w-5xl mx-auto p-5 md:p-10">
                <header className="mb-10 space-y-5">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] mb-3 flex items-center gap-2"><Target size={14} /> Ecosystem</motion.div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Verified <span className="gradient-text drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">Brands</span></h1>
                        </div>
                        <div className="w-full md:w-80 glass-dark rounded-2xl border border-white/10 p-4 flex items-center gap-3 focus-within:border-[var(--neon-cyan)] focus-within:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all">
                            <Search size={18} className="text-[var(--neon-cyan)]" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ecosystem..." className="bg-transparent border-none outline-none font-bold font-mono w-full text-white placeholder-white/30 text-sm tracking-widest" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {filteredBrands.map((brand, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 20 }} className="group relative cursor-pointer" onClick={() => setSelectedBrand(brand)}>
                            {/* Hover glow */}
                            <div className="absolute -inset-1.5 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: brand.hue }} />

                            <div className="relative glass-heavy rounded-2xl border border-white/10 p-6 md:p-8 h-full flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:border-white/30 transition-all duration-300 overflow-hidden">
                                {/* Top accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: brand.hue, color: brand.hue }} />

                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center font-black text-2xl border border-white/20 shadow-[0_0_15px_currentColor]" style={{ background: `linear-gradient(135deg, ${brand.hue}40, ${brand.hue}10)`, color: brand.hue }}>
                                            <span className="drop-shadow-[0_0_8px_currentColor]">{brand.name[0]}</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-white/40 font-mono tracking-widest">{brand.joinedYear}</span>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-1.5 flex items-center gap-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                                        {brand.name} <CheckCircle2 size={16} className="text-[var(--neon-cyan)] drop-shadow-[0_0_5px_var(--neon-cyan)]" />
                                    </h2>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6">Verified Partner</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">Raised</div>
                                            <div className="text-xl font-black font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{brand.totalRaised}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">Campaigns</div>
                                            <div className="text-base font-black font-mono text-white/70">{brand.campaigns}</div>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: brand.hue, color: brand.hue }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {filteredBrands.length === 0 && (
                    <div className="py-24 text-center"><h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.2em]">No Partners Found</h3></div>
                )}
            </div>
        </motion.div>
    );
}
