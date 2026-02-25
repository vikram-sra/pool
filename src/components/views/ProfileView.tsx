"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Camera, LogOut, Lock, Activity, CheckCircle2, Zap, Shield, Star, Award } from "lucide-react";
import { USER_PROFILE } from "@/data/campaigns";

export default function ProfileView() {
    const [isEditing, setIsEditing] = useState(false);
    const user = USER_PROFILE;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full overflow-y-auto pb-[90px] no-scrollbar bg-gray-50 pt-safe pointer-events-auto z-10">
            <div className="max-w-4xl mx-auto p-5 md:p-10">
                {!isEditing ? (
                    <div className="space-y-8">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-[0.85] mb-2">
                                    My Portal
                                </h1>
                                <p className="text-sm font-semibold text-gray-400 flex items-center gap-2"><Shield size={14} className="text-blue-600" /> Authenticated</p>
                            </div>
                            <motion.button
                                onClick={() => setIsEditing(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white rounded-xl p-3 border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm transition-all duration-200"
                            >
                                <Edit3 size={18} strokeWidth={2.5} />
                            </motion.button>
                        </header>

                        {/* Profile Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl font-black text-gray-900 border border-gray-200 shadow-sm">
                                        {user.initials}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm">
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 text-gray-900">{user.name}</h2>
                                    <p className="font-bold uppercase tracking-widest text-[10px] text-gray-400 mb-5">{user.tier} • {user.title}</p>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        {user.tags.map((tag) => (
                                            <span key={tag} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[9px] font-black tracking-widest text-gray-500 uppercase">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Escrowed", value: user.assetsEscrowed, icon: Lock, color: "#111" },
                                { label: "Squads", value: String(user.activeSquads).padStart(2, "0"), icon: Star, color: "#2563EB" },
                                { label: "Pledges", value: String(user.pledges.length).padStart(2, "0"), icon: Zap, color: "#059669" },
                                { label: "Rank", value: "#142", icon: Award, color: "#D97706" },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <s.icon size={14} style={{ color: s.color }} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{s.label}</span>
                                    </div>
                                    <div className="text-2xl font-black text-gray-900">{s.value}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Active Allocations */}
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-5 flex items-center gap-2 text-gray-900">
                                <Lock size={16} className="text-gray-400" /> Active Allocation
                            </h3>
                            <div className="space-y-3">
                                {user.pledges.map((pledge, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.08 }}
                                        className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: pledge.color }} />
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest mb-1 text-gray-400">{pledge.brand}</div>
                                                <div className="font-black text-lg uppercase text-gray-900 group-hover:text-blue-600 transition-colors">{pledge.title}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-gray-900">{pledge.amount}</div>
                                            <div className="text-[9px] text-gray-400 uppercase font-black flex items-center gap-1 justify-end mt-1">
                                                {pledge.status === "Locked" ? <Lock size={10} /> : pledge.status === "Greenlit" ? <Zap size={10} /> : <Activity size={10} />} {pledge.status}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="pb-8">
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-5 flex items-center gap-2 text-gray-900">
                                <Award size={16} className="text-gray-400" /> Achievements
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
                                        className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 text-center ${!badge.unlocked ? "opacity-30 grayscale" : ""}`}
                                    >
                                        <span className="text-2xl mb-1">{badge.emoji}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{badge.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8">
                        <header className="flex justify-between items-end">
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-[0.85]">Update<br />Identity</h1>
                            <button onClick={() => setIsEditing(false)} className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-sm">Save</button>
                        </header>
                        <div className="space-y-6 max-w-2xl">
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col items-center gap-5 shadow-sm">
                                <div className="relative group cursor-pointer">
                                    <div className="w-28 h-28 rounded-3xl bg-gray-100 flex items-center justify-center text-4xl font-black text-gray-900 border border-gray-200 shadow-sm transition-transform group-hover:scale-105">
                                        {user.initials}
                                    </div>
                                    <div className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="text-white" size={28} />
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tap to upload</p>
                            </div>
                            <div className="space-y-5 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                {[{ label: "Public Alias", val: user.name }, { label: "Email", val: user.email }, { label: "Bio", val: user.bio }].map((field, i) => (
                                    <div key={i}>
                                        <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">{field.label}</label>
                                        <input type="text" defaultValue={field.val} className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 font-bold text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-inner" />
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-5 rounded-xl bg-red-50 text-red-600 border border-red-100 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
