"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, CheckCircle2, Lock, Users, Zap, Info, X, Share2,
    Bookmark, MessageCircle, Heart,
} from "lucide-react";
import { CAMPAIGNS } from "@/data/campaigns";
import { SCROLL_COOLDOWN_MS, WHEEL_DELTA_THRESHOLD } from "@/constants";
import type { Campaign, PledgeState, Squad } from "@/types";
import LifecycleTracker from "@/components/ui/LifecycleTracker";
import PledgeModal from "@/components/ui/PledgeModal";

interface FeedViewProps {
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    currentCampaign: Campaign;
    isInteractingWithObject: React.RefObject<boolean>;
    currentTab: string;
    isZenMode: boolean;
    setIsZenMode: (val: boolean) => void;
    hasInteracted3D: boolean;
}

export default function FeedView({
    currentIndex, setCurrentIndex, currentCampaign, isInteractingWithObject,
    currentTab, isZenMode, setIsZenMode, hasInteracted3D,
}: FeedViewProps) {
    const [pledgeStates, setPledgeStates] = useState<Record<number, PledgeState>>({});
    const [liked, setLiked] = useState<Record<number, boolean>>({});
    const [saved, setSaved] = useState<Record<number, boolean>>({});
    const [activeSheet, setActiveSheet] = useState<"none" | "specs" | "squads" | "comments">("none");
    const [showModal, setShowModal] = useState(false);
    const [feedTab, setFeedTab] = useState<"foryou" | "trending">("foryou");
    const [doubleTapHeart, setDoubleTapHeart] = useState<{ x: number; y: number; id: number } | null>(null);
    const lastScrollTime = useRef(0);

    const currentPledgeState = pledgeStates[currentCampaign.id] ?? "initiated";
    const isLiked = liked[currentCampaign.id] ?? false;
    const isSaved = saved[currentCampaign.id] ?? false;
    const progressPercent = Math.min((currentCampaign.pledged / currentCampaign.goal) * 100, 100);

    const handleNext = useCallback(() => { setCurrentIndex((p: number) => (p + 1) % CAMPAIGNS.length); }, [setCurrentIndex]);
    const handlePrev = useCallback(() => { setCurrentIndex((p: number) => (p - 1 + CAMPAIGNS.length) % CAMPAIGNS.length); }, [setCurrentIndex]);

    // ── WHEEL scroll (desktop) ──
    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || activeSheet !== "none" || showModal) return;
            const now = Date.now();
            if (now - lastScrollTime.current < SCROLL_COOLDOWN_MS) return;
            if (Math.abs(e.deltaY) > WHEEL_DELTA_THRESHOLD) {
                e.deltaY > 0 ? handleNext() : handlePrev();
                lastScrollTime.current = now;
            }
        };
        window.addEventListener("wheel", onWheel, { passive: true });
        return () => window.removeEventListener("wheel", onWheel);
    }, [activeSheet, showModal, handleNext, handlePrev]);

    // ── TOUCH swipe (mobile) — simple, no library ──
    useEffect(() => {
        let startY = 0;
        let startTime = 0;
        let startedOnCanvas = false;

        const onTouchStart = (e: TouchEvent) => {
            const t = e.target as HTMLElement;
            startedOnCanvas = !!t.closest("canvas");
            if (t.closest("button") || t.closest("input") || t.closest("textarea") || startedOnCanvas) return;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (startedOnCanvas || activeSheet !== "none" || showModal) return;
            const endY = e.changedTouches[0].clientY;
            const dist = startY - endY;
            const elapsed = Date.now() - startTime;
            const now = Date.now();
            if (now - lastScrollTime.current < SCROLL_COOLDOWN_MS) return;

            // Need at least 60px swipe OR fast flick (>0.3 px/ms and >30px)
            if (Math.abs(dist) > 60 || (elapsed < 300 && Math.abs(dist) > 30)) {
                dist > 0 ? handleNext() : handlePrev();
                lastScrollTime.current = now;
            }
        };

        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, [activeSheet, showModal, handleNext, handlePrev]);

    const handlePledge = (campaignId: number) => {
        const current = pledgeStates[campaignId] ?? "initiated";
        if (current === "initiated") {
            setPledgeStates(prev => ({ ...prev, [campaignId]: "escrowed" }));
            setTimeout(() => setPledgeStates(prev => ({ ...prev, [campaignId]: "locked" })), 1500);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full pointer-events-none">

            {/* Double-Tap Heart Burst */}
            <AnimatePresence>
                {doubleTapHeart && (
                    <motion.div
                        key={doubleTapHeart.id}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="fixed z-[200] pointer-events-none"
                        style={{ left: doubleTapHeart.x - 36, top: doubleTapHeart.y - 36 }}
                    >
                        <Heart size={72} className="text-[#34D399] fill-[#34D399] drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── BACKGROUND COLOR WASH ── */}
            <div className="absolute inset-0 pointer-events-none z-[0]">
                <motion.div
                    key={currentCampaign.id + "-wash"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.12 }}
                    transition={{ duration: 1 }}
                    className="absolute w-[120%] h-[60%] blur-[120px] rounded-full top-[20%] left-1/2 -translate-x-1/2"
                    style={{ backgroundColor: currentCampaign.color }}
                />
            </div>

            {/* ── VIGNETTE ── */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
                <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/35 via-black/8 to-transparent" />
            </div>

            {/* ── TOP BAR ── */}
            <div className={`absolute top-0 left-0 right-0 z-30 pt-safe pointer-events-auto transition-all duration-500 ${isZenMode ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100"}`}>
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center bg-black/25 backdrop-blur-sm rounded-full p-0.5">
                        {(["foryou", "trending"] as const).map(tab => (
                            <button key={tab} onClick={() => setFeedTab(tab)} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${feedTab === tab ? "bg-white/90 text-[#1C1C1C]" : "text-white/50"}`}>
                                {tab === "foryou" ? "For You" : "Trending"}
                            </button>
                        ))}
                    </div>
                    <div className="bg-black/25 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <span className="text-[9px] font-bold text-white/50 tabular-nums">
                            {String(currentIndex + 1).padStart(2, "0")}<span className="text-white/15 mx-0.5">/</span>{CAMPAIGNS.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── ROTATE HINT ── */}
            <AnimatePresence>
                {!hasInteracted3D && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: 2 }} className="absolute top-[38%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full text-white text-[9px] font-medium uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5">
                            <motion.span animate={{ rotateZ: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="inline-block text-xs">↻</motion.span>
                            Drag to rotate
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── RIGHT SIDEBAR ── */}
            <div className={`absolute right-1.5 z-30 pointer-events-auto flex flex-col items-center gap-2.5 transition-all duration-500 ${activeSheet !== "none" || isZenMode ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100"}`} style={{ bottom: "95px" }}>
                <div className="relative mb-0.5">
                    <div className="w-9 h-9 rounded-full border-[1.5px] border-white/80 flex items-center justify-center font-bold text-[10px] text-white shadow-md" style={{ backgroundColor: currentCampaign.color }}>
                        {currentCampaign.brand.charAt(0)}
                    </div>
                </div>
                <SideBtn icon={<Heart size={22} strokeWidth={isLiked ? 0 : 1.8} className={isLiked ? "fill-[#34D399] text-[#34D399]" : "text-white/80"} />} label={String(currentCampaign.backers ?? 0)} onClick={() => setLiked(prev => ({ ...prev, [currentCampaign.id]: !isLiked }))} />
                <SideBtn icon={<MessageCircle size={22} className="text-white/80" />} label={currentCampaign.squadsCount} onClick={() => setActiveSheet("comments")} />
                <SideBtn icon={<Bookmark size={20} strokeWidth={isSaved ? 0 : 1.8} className={isSaved ? "fill-[#FBBF24] text-[#FBBF24]" : "text-white/80"} />} label="Save" onClick={() => setSaved(prev => ({ ...prev, [currentCampaign.id]: !isSaved }))} />
                <SideBtn icon={<Share2 size={20} className="text-white/80" />} label="Share" onClick={() => { }} />
            </div>

            {/* ── BOTTOM INFO ── */}
            <div className={`absolute bottom-[48px] left-0 right-[44px] z-20 px-3 transition-all duration-500 ${isZenMode ? "opacity-0 translate-y-6" : "opacity-100"}`}>
                <AnimatePresence mode="popLayout">
                    <motion.div key={currentCampaign.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                        <div className="mb-1 w-fit"><LifecycleTracker currentStage={currentCampaign.lifecycle} color={currentCampaign.color} compact /></div>
                        <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-white/70 font-semibold text-[9px] uppercase tracking-wider">{currentCampaign.brand}</span>
                            <CheckCircle2 size={8} className="text-blue-400/60" />
                        </div>
                        <h2 className="text-white font-black text-[17px] uppercase tracking-tight leading-tight mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                            {currentCampaign.title}
                        </h2>
                        <p className="text-white/40 text-[9px] font-medium leading-snug mb-2 line-clamp-1">
                            {currentCampaign.description}
                        </p>

                        <div className="pointer-events-auto">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="flex-1 h-[3px] bg-white/8 rounded-full overflow-hidden">
                                    <motion.div initial={false} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ backgroundColor: currentCampaign.color }} />
                                </div>
                                <span className="text-white/25 text-[8px] font-bold tabular-nums">{Math.round(progressPercent)}%</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setShowModal(true)}
                                    disabled={currentPledgeState !== "initiated"}
                                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[10px] transition-all ${currentPledgeState === "initiated" ? "text-[#1C1C1C]"
                                            : currentPledgeState === "escrowed" ? "bg-white/8 text-white/70"
                                                : "bg-white/5 text-white/40"
                                        }`}
                                    style={currentPledgeState === "initiated" ? { backgroundColor: currentCampaign.color } : undefined}
                                >
                                    {currentPledgeState === "initiated" ? (<><Lock size={11} /> Lock $100</>) : currentPledgeState === "escrowed" ? (<><Zap size={11} className="animate-spin" /> Securing...</>) : (<><CheckCircle2 size={11} /> Secured</>)}
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveSheet("squads")} className="py-2 px-3 rounded-lg bg-white/8 flex items-center gap-1 text-white/50 text-[9px] font-bold">
                                    <Users size={11} /> {currentCampaign.squadsCount}
                                </motion.button>
                            </div>

                            <div className="flex items-center gap-1 mt-1">
                                <ShieldCheck size={7} className="text-[#34D399]/60" />
                                <span className="text-white/15 text-[7px] font-medium uppercase tracking-wider">Escrow protected · {currentCampaign.deadline}</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── BOTTOM SHEETS ── */}
            <AnimatePresence>
                {activeSheet !== "none" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-auto" onClick={() => setActiveSheet("none")}>
                        <div className="absolute inset-0 bg-black/40" />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="absolute bottom-0 left-0 right-0 h-[55vh] bg-[#F5F4F0] rounded-t-2xl flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-center pt-2 pb-1"><div className="w-8 h-1 bg-[#1C1C1C]/10 rounded-full" /></div>
                            <div className="flex justify-between items-center px-4 pb-2 border-b border-[#1C1C1C]/5">
                                <h3 className="text-sm font-black uppercase tracking-tight text-[#1C1C1C]">
                                    {activeSheet === "specs" ? "Specs" : activeSheet === "squads" ? "Squads" : "Discussion"}
                                </h3>
                                <button onClick={() => setActiveSheet("none")} className="w-7 h-7 rounded-full bg-[#1C1C1C]/5 flex items-center justify-center"><X size={14} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar p-4 text-[#1C1C1C]">
                                {activeSheet === "specs" && (
                                    <div className="space-y-2">
                                        {currentCampaign.specs.map((s: string, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-[#1C1C1C]/5">
                                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentCampaign.color }} />
                                                <span className="font-semibold text-xs">{s}</span>
                                            </motion.div>
                                        ))}
                                        {currentCampaign.variants && currentCampaign.variants.length > 0 && (
                                            <div className="mt-4">
                                                <div className="text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/25 mb-2">Community Vote</div>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {currentCampaign.variants.map(v => {
                                                        const total = currentCampaign.variants!.reduce((a, b) => a + b.votes, 0);
                                                        const pct = Math.round((v.votes / total) * 100);
                                                        return (
                                                            <div key={v.id} className="bg-white/60 rounded-lg p-2 border border-[#1C1C1C]/5 text-center">
                                                                {v.hex && <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: v.hex }} />}
                                                                <div className="text-[8px] font-bold">{v.label}</div>
                                                                <div className="text-[7px] text-[#1C1C1C]/25">{pct}%</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeSheet === "squads" && (
                                    <div className="space-y-2">
                                        <div className="bg-white/60 rounded-lg p-4 border border-[#1C1C1C]/5 text-center">
                                            <div className="text-[8px] font-bold text-[#1C1C1C]/20 uppercase tracking-widest mb-1">Total Pooled</div>
                                            <div className="text-2xl font-black" style={{ color: currentCampaign.color }}>
                                                ${currentCampaign.squads.reduce((a: number, sq: Squad) => a + parseInt(sq.amount.replace(/\D/g, "")) * 100, 0).toLocaleString()}
                                            </div>
                                        </div>
                                        {currentCampaign.squads.map((sq: Squad, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex justify-between items-center bg-white/60 rounded-lg p-3 border border-[#1C1C1C]/5" style={{ borderLeft: `2px solid ${currentCampaign.color}` }}>
                                                <div>
                                                    <span className="font-bold text-xs">{sq.name}</span>
                                                    {sq.members && <span className="text-[8px] text-[#1C1C1C]/20 ml-1">{sq.members}</span>}
                                                </div>
                                                <span className="font-bold text-[#1C1C1C]/30 text-xs">{sq.amount}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                {activeSheet === "comments" && (
                                    <div className="space-y-3">
                                        {[
                                            { user: "SneakerGod", avatar: "S", text: "This is gonna sell out so fast 🔥", time: "2h", likes: 42 },
                                            { user: "TechNinja", avatar: "T", text: "The specs on this are insane.", time: "4h", likes: 28 },
                                            { user: "DesignFan", avatar: "D", text: "Finally someone making what we want", time: "6h", likes: 15 },
                                            { user: "RetroWave", avatar: "R", text: "Pledged day one. Future of retail.", time: "12h", likes: 67 },
                                        ].map((c, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-2">
                                                <div className="w-7 h-7 rounded-full bg-[#1C1C1C]/5 flex items-center justify-center font-bold text-[10px] text-[#1C1C1C]/30 shrink-0">{c.avatar}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-[10px]">{c.user}</span>
                                                        <span className="text-[8px] text-[#1C1C1C]/15">{c.time}</span>
                                                    </div>
                                                    <p className="text-[11px] text-[#1C1C1C]/50 mt-0.5">{c.text}</p>
                                                    <button className="text-[8px] text-[#1C1C1C]/15 mt-0.5 flex items-center gap-0.5"><Heart size={7} /> {c.likes}</button>
                                                </div>
                                            </motion.div>
                                        ))}
                                        <div className="sticky bottom-0 pt-2 bg-[#F5F4F0] border-t border-[#1C1C1C]/5 flex items-center gap-2">
                                            <input placeholder="Add a comment..." className="flex-1 bg-[#1C1C1C]/5 rounded-full px-3 py-2 text-[11px] outline-none placeholder-[#1C1C1C]/15" />
                                            <button className="text-[10px] font-bold" style={{ color: currentCampaign.color }}>Post</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PledgeModal campaign={currentCampaign} isOpen={showModal} onClose={() => setShowModal(false)} onPledge={handlePledge} pledgeState={currentPledgeState} />
        </motion.div>
    );
}

function SideBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <motion.button onClick={onClick} whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0">
            {icon}
            <span className="text-white/40 text-[8px] font-medium">{label}</span>
        </motion.button>
    );
}
