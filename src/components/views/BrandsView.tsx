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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[100px] no-scrollbar bg-[#F5F4F0] dot-grid pt-safe pointer-events-auto">
                <div className="max-w-5xl mx-auto p-5 md:p-10">
                    <button onClick={() => setSelectedBrand(null)} className="flex items-center gap-2 text-[#1C1C1C]/50 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-[#1C1C1C] transition-colors group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Ecosystem
                    </button>

                    {/* Brand Hero */}
                    <div className="glass rounded-2xl border border-[#1C1C1C]/5 p-6 md:p-8 mb-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-[#1C1C1C] border-2 border-[#1C1C1C]/10 shadow-md" style={{ background: `linear-gradient(135deg, ${selectedBrand.hue}30, ${selectedBrand.hue}10)` }}>
                                {selectedBrand.name[0]}
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1C1C1C] flex items-center gap-2">
                                    {selectedBrand.name} <CheckCircle2 size={20} className="text-blue-500 fill-blue-100" />
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="glass-dark text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md">Verified</span>
                                    <span className="text-[9px] font-bold text-[#1C1C1C]/30">Since {selectedBrand.joinedYear || 2019}</span>
                                </div>
                                {selectedBrand.description && <p className="text-[11px] font-medium text-[#1C1C1C]/40 mt-2 max-w-lg">{selectedBrand.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Brand Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { label: "Total Raised", value: selectedBrand.totalRaised, color: selectedBrand.hue },
                            { label: "Campaigns", value: String(selectedBrand.campaigns), color: "#38BDF8" },
                            { label: "Active Now", value: String(brandCampaigns.length), color: "#34D399" },
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-xl p-4 border border-[#1C1C1C]/5">
                                <div className="text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/30 mb-1">{s.label}</div>
                                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sub-tabs */}
                    <div className="grid grid-cols-3 gap-2 mb-8">
                        {[
                            { id: "pledge", label: "Pledging", icon: <Zap size={14} /> },
                            { id: "vote", label: "Voting", icon: <Target size={14} /> },
                            { id: "idea", label: "Ideation", icon: <Edit3 size={14} /> },
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] md:text-xs border transition-all duration-200 ${activeSubTab === tab.id
                                ? "glass-dark text-white border-white/10"
                                : "glass border-[#1C1C1C]/5 text-[#1C1C1C]/50 hover:text-[#1C1C1C] hover:border-[#1C1C1C]/15"
                                }`}>
                                <span className={activeSubTab === tab.id ? "text-[#34D399]" : ""}>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeSubTab === "pledge" && (
                            <motion.div key="pledge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                {brandCampaigns.length > 0 ? brandCampaigns.map((c) => (
                                    <div key={c.id} className="group relative">
                                        <div className="absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: c.color }} />
                                        <div className="relative glass rounded-2xl border border-[#1C1C1C]/5 p-5 md:p-6 group-hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: c.color }}>Active</div>
                                                <div className="text-white px-2 py-0.5 text-[8px] font-black uppercase rounded-md" style={{ backgroundColor: c.color }}>{Math.round((c.pledged / c.goal) * 100)}%</div>
                                            </div>
                                            <h4 className="text-xl font-black uppercase tracking-tighter mb-1">{c.title}</h4>
                                            <p className="text-[10px] font-medium text-[#1C1C1C]/40 mb-4 leading-relaxed">{c.description}</p>
                                            <button className="w-full py-3 bg-[#1C1C1C] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:shadow-md transition-all">Pledge</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-16 text-center text-[#1C1C1C]/15 font-black uppercase text-sm">No active campaigns</div>
                                )}
                            </motion.div>
                        )}
                        {activeSubTab === "vote" && (
                            <motion.div key="vote" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                {[{ name: "Eco-Lumina Mesh", votes: "4.2k", rank: "01" }, { name: "Titanium Hinge V2", votes: "3.8k", rank: "02" }, { name: "Bio-Plastic Shell", votes: "2.1k", rank: "03" }].map((v, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 group">
                                        <span className="text-xl font-black text-[#1C1C1C]/15 w-7 tabular-nums">{v.rank}</span>
                                        <div className="flex-1 glass rounded-xl border border-[#1C1C1C]/5 p-4 flex justify-between items-center group-hover:shadow-sm transition-all">
                                            <span className="font-black uppercase text-sm">{v.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-[#1C1C1C]/30">{v.votes}</span>
                                                <button className="px-3 py-1.5 bg-[#1C1C1C] text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-[#34D399] hover:text-[#1C1C1C] transition-colors">Vote</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                        {activeSubTab === "idea" && (
                            <motion.div key="idea" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="glass-dark rounded-2xl p-6 text-white">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-[#34D399]">Current Prompt</div>
                                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight italic">&quot;Modular Travel: How can we make luggage disappear?&quot;</h3>
                                </div>
                                <div className="glass rounded-2xl border border-[#1C1C1C]/5 p-6">
                                    <textarea placeholder="YOUR CONCEPT IDEA..." className="w-full glass rounded-xl border border-[#1C1C1C]/10 p-4 font-medium text-sm text-[#1C1C1C] placeholder-[#1C1C1C]/20 focus:border-[#1C1C1C]/30 outline-none resize-none mb-4 h-32" />
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                        <p className="text-[9px] font-bold text-[#1C1C1C]/25 max-w-sm">Ideas analyzed by AI after 21 days. Top 5 advance to voting.</p>
                                        <button className="w-full md:w-auto px-8 py-3.5 bg-[#1C1C1C] text-white rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-md transition-all">Submit</button>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[100px] no-scrollbar bg-[#F5F4F0] dot-grid pt-safe pointer-events-auto">
            <div className="max-w-5xl mx-auto p-5 md:p-10">
                <header className="mb-10 space-y-5">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                        <div>
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[#1C1C1C]/30 font-black uppercase tracking-[0.2em] text-[9px] mb-2 flex items-center gap-2"><Target size={12} /> Ecosystem</motion.div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-[0.85]">Verified <span className="gradient-text">Brands</span></h1>
                        </div>
                        <div className="w-full md:w-72 glass rounded-xl border border-[#1C1C1C]/5 p-3 flex items-center gap-2.5 focus-within:border-[#1C1C1C]/20 transition-colors">
                            <Search size={16} className="text-[#1C1C1C]/30" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..." className="bg-transparent border-none outline-none font-bold w-full text-[#1C1C1C] placeholder-[#1C1C1C]/20 text-sm" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {filteredBrands.map((brand, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 20 }} className="group relative cursor-pointer" onClick={() => setSelectedBrand(brand)}>
                            {/* Hover glow */}
                            <div className="absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundColor: brand.hue }} />

                            <div className="relative bg-white rounded-2xl border border-[#1C1C1C]/8 p-5 md:p-6 h-full flex flex-col justify-between shadow-sm group-hover:border-[#1C1C1C]/20 group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                                {/* Top accent */}
                                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: brand.hue }} />

                                <div>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base border border-[#1C1C1C]/5 shadow-sm" style={{ background: `linear-gradient(135deg, ${brand.hue}25, ${brand.hue}08)` }}>
                                            {brand.name[0]}
                                        </div>
                                        <span className="text-[8px] font-bold text-[#1C1C1C]/25 uppercase tracking-widest">{brand.joinedYear}</span>
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter text-[#1C1C1C] mb-0.5 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                                        {brand.name} <CheckCircle2 size={14} className="text-blue-500 fill-blue-100" />
                                    </h2>
                                    <p className="text-[9px] font-bold text-[#1C1C1C]/25 uppercase tracking-widest mb-5">Verified Partner</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[8px] text-[#1C1C1C]/30 uppercase font-black tracking-widest mb-0.5">Raised</div>
                                            <div className="text-lg font-black">{brand.totalRaised}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[8px] text-[#1C1C1C]/30 uppercase font-black tracking-widest mb-0.5">Campaigns</div>
                                            <div className="text-sm font-black text-[#1C1C1C]/50">{brand.campaigns}</div>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#1C1C1C]/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full" style={{ backgroundColor: brand.hue }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {filteredBrands.length === 0 && (
                    <div className="py-20 text-center"><h3 className="text-xl font-black text-[#1C1C1C]/15 uppercase tracking-widest">No Partners Found</h3></div>
                )}
            </div>
        </motion.div>
    );
}
