"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Camera, LogOut, Lock, Activity, CheckCircle2, Zap, Shield, Star, Award } from "lucide-react";
import { USER_PROFILE } from "@/data/campaigns";

export default function ProfileView() {
    const [isEditing, setIsEditing] = useState(false);
    const user = USER_PROFILE;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto no-scrollbar bg-transparent dot-grid pt-safe pointer-events-auto">
            <div className="max-w-4xl mx-auto p-5 md:p-10 pb-32">
                {!isEditing ? (
                    <div className="space-y-8">
                        <header className="flex justify-between items-end">
                            <div>
                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[#1C1C1C]/30 font-black uppercase tracking-[0.2em] text-[9px] mb-2 flex items-center gap-2"><Shield size={12} /> Authenticated</motion.div>
                                <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-[0.85]">
                                    My <span className="gradient-text">Portal</span>
                                </h1>
                            </div>
                            <motion.button
                                onClick={() => setIsEditing(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="glass rounded-xl p-3 border border-[#1C1C1C]/10 text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all duration-200"
                            >
                                <Edit3 size={18} strokeWidth={2.5} />
                            </motion.button>
                        </header>

                        {/* Profile Card */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#34D399]/15 via-[#38BDF8]/15 to-[#C084FC]/15 rounded-3xl blur-xl opacity-60" />
                            <div className="relative glass-dark rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                                <div className="relative flex flex-col md:flex-row items-center gap-6">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-[#34D399] to-[#38BDF8] rounded-2xl blur-sm opacity-50" />
                                        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-[#1C1C1C] border-2 border-white/20 flex items-center justify-center text-3xl font-black">
                                            {user.initials}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#34D399] flex items-center justify-center border-2 border-[#1C1C1C]">
                                            <CheckCircle2 size={16} className="text-[#1C1C1C]" />
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-1">{user.name}</h2>
                                        <p className="font-semibold uppercase tracking-widest text-[10px] text-white/40 mb-4">{user.tier} • {user.title}</p>
                                        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                                            {user.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-0.5 bg-white/8 border border-white/10 rounded-md text-[8px] font-black tracking-widest text-white/50">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Escrowed", value: user.assetsEscrowed, icon: Lock, color: "#34D399" },
                                { label: "Squads", value: String(user.activeSquads).padStart(2, "0"), icon: Star, color: "#38BDF8" },
                                { label: "Pledges", value: String(user.pledges.length).padStart(2, "0"), icon: Zap, color: "#C084FC" },
                                { label: "Rank", value: "#142", icon: Award, color: "#FBBF24" },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="glass rounded-xl p-4 border border-[#1C1C1C]/5">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: s.color + '12' }}>
                                            <s.icon size={10} style={{ color: s.color }} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/30">{s.label}</span>
                                    </div>
                                    <div className="text-xl font-black tabular-nums">{s.value}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Active Allocations */}
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2 text-[#1C1C1C]/70">
                                <Lock size={16} /> Active Allocation
                            </h3>
                            <div className="space-y-3">
                                {user.pledges.map((pledge, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.08 }}
                                        className="group relative"
                                    >
                                        <div className="absolute -inset-0.5 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: pledge.color }} />
                                        <div className="relative glass rounded-xl border border-[#1C1C1C]/5 p-4 flex justify-between items-center group-hover:shadow-sm transition-all" style={{ borderLeft: `3px solid ${pledge.color}` }}>
                                            <div>
                                                <div className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: pledge.color }}>{pledge.brand}</div>
                                                <div className="font-black text-base uppercase">{pledge.title}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-black tabular-nums">{pledge.amount}</div>
                                                <div className="text-[8px] text-[#1C1C1C]/30 uppercase font-bold flex items-center gap-1 justify-end">
                                                    {pledge.status === "Locked" ? <Lock size={8} /> : pledge.status === "Greenlit" ? <Zap size={8} /> : <Activity size={8} />} {pledge.status}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2 text-[#1C1C1C]/70">
                                <Award size={16} /> Achievements
                            </h3>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {[
                                    { emoji: "🔥", label: "Early Backer", unlocked: true },
                                    { emoji: "💎", label: "Diamond Hands", unlocked: true },
                                    { emoji: "🚀", label: "Launch Day", unlocked: true },
                                    { emoji: "👁️", label: "Trend Spotter", unlocked: false },
                                    { emoji: "🏆", label: "Top 100", unlocked: false },
                                ].map((badge, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + i * 0.06 }}
                                        className={`glass rounded-xl border border-[#1C1C1C]/5 p-3 flex flex-col items-center gap-1.5 text-center ${!badge.unlocked ? "opacity-30" : ""}`}
                                    >
                                        <span className="text-2xl">{badge.emoji}</span>
                                        <span className="text-[7px] font-black uppercase tracking-widest text-[#1C1C1C]/50">{badge.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8">
                        <header className="flex justify-between items-end">
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1C1C1C]">Update<br />Identity</h1>
                            <button onClick={() => setIsEditing(false)} className="glass-dark text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-md transition-all">Save</button>
                        </header>
                        <div className="space-y-6 max-w-2xl">
                            <div className="glass rounded-2xl border border-[#1C1C1C]/5 p-8 flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-2xl bg-[#1C1C1C] flex items-center justify-center text-3xl font-black text-white">
                                        {user.initials}
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-blue-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-[#1C1C1C]/25 uppercase tracking-widest">Tap to upload</p>
                            </div>
                            <div className="space-y-4">
                                {[{ label: "Public Alias", val: user.name }, { label: "Email", val: user.email }, { label: "Bio", val: user.bio }].map((field, i) => (
                                    <div key={i}>
                                        <label className="block text-[9px] text-[#1C1C1C]/40 font-black uppercase tracking-widest mb-2">{field.label}</label>
                                        <input type="text" defaultValue={field.val} className="w-full glass rounded-xl border border-[#1C1C1C]/10 p-3.5 font-bold text-sm text-[#1C1C1C] focus:border-[#1C1C1C]/30 outline-none transition-colors" />
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-4 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
