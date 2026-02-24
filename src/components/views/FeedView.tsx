"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, CheckCircle2, Lock, Users, Zap, Info, X, Share2,
    Bookmark, MessageCircle, Heart, Maximize2,
} from "lucide-react";
import { CAMPAIGNS } from "@/data/campaigns";
import { SCROLL_COOLDOWN_MS, SWIPE_COOLDOWN_MS, WHEEL_DELTA_THRESHOLD } from "@/constants";
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
    isPitchOpen?: boolean;
    dragProgressRef: React.MutableRefObject<number>;
}

export default function FeedView({
    currentIndex, setCurrentIndex, currentCampaign, isInteractingWithObject,
    currentTab, isZenMode, setIsZenMode, hasInteracted3D, isPitchOpen, dragProgressRef,
}: FeedViewProps) {
    const [pledgeStates, setPledgeStates] = useState<Record<number, PledgeState>>(() => {
        try { return JSON.parse(localStorage.getItem('dp-pledges') ?? '{}'); } catch { return {}; }
    });
    const [liked, setLiked] = useState<Record<number, boolean>>(() => {
        try { return JSON.parse(localStorage.getItem('dp-liked') ?? '{}'); } catch { return {}; }
    });
    const [saved, setSaved] = useState<Record<number, boolean>>(() => {
        try { return JSON.parse(localStorage.getItem('dp-saved') ?? '{}'); } catch { return {}; }
    });
    const [activeSheet, setActiveSheet] = useState<"none" | "specs" | "squads" | "comments">("none");
    const [showModal, setShowModal] = useState(false);
    const [feedTab, setFeedTab] = useState<"foryou" | "trending">("foryou");
    const [doubleTapHeart, setDoubleTapHeart] = useState<{ x: number; y: number; id: number } | null>(null);
    const [commentInput, setCommentInput] = useState("");
    const [userComments, setUserComments] = useState<Record<number, Array<{ user: string; text: string }>>>({});
    const lastScrollTime = useRef(0);
    const sheetStartY = useRef(0);

    const currentPledgeState = pledgeStates[currentCampaign.id] ?? "initiated";
    const isLiked = liked[currentCampaign.id] ?? false;
    const isSaved = saved[currentCampaign.id] ?? false;
    const progressPercent = Math.min((currentCampaign.pledged / currentCampaign.goal) * 100, 100);

    const handleNext = useCallback(() => { setCurrentIndex((p: number) => (p + 1) % CAMPAIGNS.length); }, [setCurrentIndex]);
    const handlePrev = useCallback(() => { setCurrentIndex((p: number) => (p - 1 + CAMPAIGNS.length) % CAMPAIGNS.length); }, [setCurrentIndex]);

    // ── WHEEL scroll (desktop) ──
    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || activeSheet !== "none" || showModal || isPitchOpen) return;
            const now = Date.now();
            if (now - lastScrollTime.current < SCROLL_COOLDOWN_MS) return;
            // Require a deliberate scroll — accumulate delta and only fire once
            // it clearly exceeds the threshold (prevents trackpad micro-nudges)
            if (Math.abs(e.deltaY) > WHEEL_DELTA_THRESHOLD) {
                e.deltaY > 0 ? handleNext() : handlePrev();
                lastScrollTime.current = now;
            }
        };
        window.addEventListener("wheel", onWheel, { passive: true });
        return () => window.removeEventListener("wheel", onWheel);
    }, [activeSheet, showModal, isPitchOpen, handleNext, handlePrev]);

    // ── TOUCH swipe (mobile) — direction-lock gesture system with live drag ──
    useEffect(() => {
        let startY = 0;
        let startX = 0;
        let startTime = 0;
        let lastMoveY = 0;
        let lastMoveTime = 0;
        let phase: "idle" | "detecting" | "swiping" | "blocked" = "idle";

        const onTouchStart = (e: TouchEvent) => {
            const t = e.target as HTMLElement;
            if (t.closest("button") || t.closest("input") || t.closest("textarea")) return;
            if (e.touches.length > 1) return;
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
            lastMoveY = startY;
            lastMoveTime = Date.now();
            startTime = lastMoveTime;
            phase = "detecting";
        };

        const onTouchMove = (e: TouchEvent) => {
            if (phase === "swiping") {
                const dy = e.touches[0].clientY - startY;
                // * 1.4: need ~70% screen drag to fully reveal adjacent model
                const raw = -(dy / window.innerHeight) * 1.4;
                dragProgressRef.current = Math.max(-1, Math.min(1, raw));
                lastMoveY = e.touches[0].clientY;
                lastMoveTime = Date.now();
                return;
            }

            if (phase !== "detecting") return;
            if (activeSheet !== "none" || showModal || isPitchOpen) { phase = "blocked"; return; }
            if (e.touches.length > 1) { phase = "blocked"; return; }

            const dy = e.touches[0].clientY - startY;
            const dx = e.touches[0].clientX - startX;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 12) return;

            if (isInteractingWithObject.current) { phase = "blocked"; return; }

            if (Math.abs(dy) > Math.abs(dx) * 1.3) {
                phase = "swiping";
                const raw = -(dy / window.innerHeight) * 1.4;
                dragProgressRef.current = Math.max(-1, Math.min(1, raw));
                lastMoveY = e.touches[0].clientY;
                lastMoveTime = Date.now();
            } else {
                phase = "blocked";
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            dragProgressRef.current = 0;

            if (phase !== "swiping") { phase = "idle"; return; }

            const endY = e.changedTouches[0].clientY;
            const totalDist = startY - endY;
            const now = Date.now();
            phase = "idle";

            if (now - lastScrollTime.current < SWIPE_COOLDOWN_MS) return;

            // Velocity-based flick: more reliable than time-only detection
            const dt = now - lastMoveTime;
            const recentDy = lastMoveY - endY;
            const velocity = dt > 0 ? Math.abs(recentDy) / dt : 0; // px/ms

            const isFlick = velocity > 0.4 && Math.abs(totalDist) > 20;
            const isSwipe = Math.abs(totalDist) > 80;

            if (isFlick || isSwipe) {
                totalDist > 0 ? handleNext() : handlePrev();
                lastScrollTime.current = now;
            }
        };

        const onTouchCancel = () => {
            dragProgressRef.current = 0;
            phase = "idle";
        };

        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
        window.addEventListener("touchcancel", onTouchCancel, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchCancel);
        };
    }, [activeSheet, showModal, isPitchOpen, handleNext, handlePrev, isInteractingWithObject, dragProgressRef]);

    // Persist to localStorage
    useEffect(() => { try { localStorage.setItem('dp-pledges', JSON.stringify(pledgeStates)); } catch { } }, [pledgeStates]);
    useEffect(() => { try { localStorage.setItem('dp-liked', JSON.stringify(liked)); } catch { } }, [liked]);
    useEffect(() => { try { localStorage.setItem('dp-saved', JSON.stringify(saved)); } catch { } }, [saved]);

    const handlePledge = (campaignId: number) => {
        const current = pledgeStates[campaignId] ?? "initiated";
        if (current === "initiated") {
            setPledgeStates(prev => ({ ...prev, [campaignId]: "escrowed" }));
            setTimeout(() => setPledgeStates(prev => ({ ...prev, [campaignId]: "locked" })), 1500);
        }
    };

    const handleShare = async () => {
        const data = { title: `${currentCampaign.title} — The Demand Pool`, text: `${currentCampaign.title} by ${currentCampaign.brand}`, url: window.location.href };
        try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(window.location.href); } catch { }
    };

    const handlePostComment = () => {
        if (!commentInput.trim()) return;
        setUserComments(prev => ({ ...prev, [currentCampaign.id]: [...(prev[currentCampaign.id] ?? []), { user: "You", text: commentInput.trim() }] }));
        setCommentInput("");
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
            <div className="absolute inset-0 pointer-events-none z-[0] mix-blend-screen">
                <motion.div
                    key={currentCampaign.id + "-wash"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1 }}
                    className="absolute w-[120%] h-[60%] blur-[100px] rounded-full top-[20%] left-1/2 -translate-x-1/2 animate-float"
                    style={{ backgroundColor: currentCampaign.color }}
                />
            </div>

            {/* ── VIGNETTE ── */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
                <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
            </div>

            {/* ── TOP BAR ── */}
            <div className={`absolute top-0 left-0 right-0 z-30 pt-safe pointer-events-auto transition-all duration-500 ${isZenMode ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100"}`}>
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center glass-dark rounded-full p-0.5">
                        {(["foryou", "trending"] as const).map(tab => (
                            <button key={tab} onClick={() => setFeedTab(tab)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${feedTab === tab ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "text-white/50 hover:text-white/80"}`}>
                                {tab === "foryou" ? "For You" : "Trending"}
                            </button>
                        ))}
                    </div>
                    <div className="glass-dark rounded-full px-2.5 py-1">
                        <span className="text-[10px] font-bold text-white tabular-nums tracking-widest">
                            {String(currentIndex + 1).padStart(2, "0")}<span className="text-[var(--neon-cyan)] mx-0.5">/</span>{CAMPAIGNS.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── ZEN MODE EXIT ── */}
            <AnimatePresence>
                {isZenMode && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => setIsZenMode(false)}
                        className="absolute top-14 right-4 z-50 w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
                    >
                        <X size={16} className="text-white/70" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── ROTATE HINT ── */}
            <AnimatePresence>
                {!hasInteracted3D && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: 2 }} className="absolute top-[38%] left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full text-white text-[9px] font-medium uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5">
                            <motion.span animate={{ rotateZ: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="inline-block text-xs">↻</motion.span>
                            Drag to rotate
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full text-white text-[8px] font-medium uppercase tracking-widest px-2.5 py-1 opacity-60">
                            Pinch to zoom
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full text-white text-[8px] font-medium uppercase tracking-widest px-2.5 py-1 opacity-45 flex items-center gap-1.5">
                            <Maximize2 size={9} /> Tap for full screen
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── RIGHT SIDEBAR ── */}
            <div className={`absolute right-3 z-30 pointer-events-auto flex flex-col items-center gap-4 transition-all duration-500 ${activeSheet !== "none" || isZenMode ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100"}`} style={{ bottom: "88px" }}>
                <div className="relative mb-1">
                    <div className="w-11 h-11 rounded-full border border-white/20 glass flex items-center justify-center font-bold text-[12px] text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]" style={{ background: `linear-gradient(135deg, ${currentCampaign.color}50, transparent)` }}>
                        {currentCampaign.brand.charAt(0)}
                    </div>
                </div>
                <SideBtn icon={<Heart size={26} strokeWidth={isLiked ? 0 : 1.8} className={isLiked ? "fill-[var(--neon-pink)] text-[var(--neon-pink)] drop-shadow-[0_0_8px_var(--neon-pink)]" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"} />} label={String(currentCampaign.backers ?? 0)} onClick={() => setLiked(prev => ({ ...prev, [currentCampaign.id]: !isLiked }))} />
                <SideBtn icon={<MessageCircle size={26} className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]" />} label={currentCampaign.squadsCount} onClick={() => setActiveSheet("comments")} />
                <SideBtn icon={<Bookmark size={24} strokeWidth={isSaved ? 0 : 1.8} className={isSaved ? "fill-[#FBBF24] text-[#FBBF24]" : "text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"} />} label="Save" onClick={() => setSaved(prev => ({ ...prev, [currentCampaign.id]: !isSaved }))} />
                <SideBtn icon={<Share2 size={24} className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]" />} label="Share" onClick={handleShare} />
            </div>

            {/* ── BOTTOM INFO ── */}
            <div className={`absolute bottom-[70px] left-0 right-[56px] z-20 px-3 transition-all duration-500 ${isZenMode ? "opacity-0 translate-y-6" : "opacity-100"}`}>
                {/* mode="wait" ensures old content fully exits before new content enters,
                    preventing the ghost where both campaign infos overlap mid-transition */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCampaign.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="mb-0.5 w-fit"><LifecycleTracker currentStage={currentCampaign.lifecycle} color={currentCampaign.color} compact /></div>
                        <div className="flex items-center gap-1">
                            <span className="text-white font-semibold text-[10px] uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">{currentCampaign.brand}</span>
                            <CheckCircle2 size={9} className="text-blue-300" />
                        </div>
                        <h2 className="text-white font-black text-[15px] uppercase tracking-tight leading-tight mb-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                            {currentCampaign.title}
                        </h2>
                        <p className="text-white/75 text-[10px] font-medium leading-snug mb-1.5 line-clamp-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                            {currentCampaign.description}
                        </p>

                        <div className="pointer-events-auto">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
                                    <motion.div initial={false} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ backgroundColor: currentCampaign.color }} />
                                </div>
                                <span className="text-white/70 text-[9px] font-bold tabular-nums">{Math.round(progressPercent)}%</span>
                            </div>

                            <div className="flex items-center gap-1.5 mt-2">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setShowModal(true)}
                                    disabled={currentPledgeState !== "initiated"}
                                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[11px] transition-all border relative overflow-hidden ${currentPledgeState === "initiated"
                                        ? "glass-dark border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                        : currentPledgeState === "escrowed"
                                            ? "bg-white/10 text-white/90 border-white/15"
                                            : "glass text-[var(--electric-green)] border-[var(--electric-green)]"
                                        }`}
                                    style={currentPledgeState === "initiated" ? {
                                        color: currentCampaign.color,
                                    } : undefined}
                                >
                                    {currentPledgeState === "initiated" && <div className="absolute inset-0 opacity-20 pointer-events-none shimmer" style={{ backgroundColor: currentCampaign.color }} />}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        {currentPledgeState === "initiated" ? (<><Lock size={12} /> Lock $100</>) : currentPledgeState === "escrowed" ? (<><Zap size={12} className="animate-spin" /> Securing...</>) : (<><CheckCircle2 size={12} /> Secured</>)}
                                    </span>
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveSheet("squads")} className="py-2.5 px-4 rounded-xl glass-dark border border-[rgba(255,255,255,0.05)] flex items-center gap-1.5 text-white/85 text-[10px] font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-white/10 transition-colors">
                                    <Users size={12} /> {currentCampaign.squadsCount}
                                </motion.button>
                            </div>

                            <div className="flex items-center gap-1 mt-1">
                                <ShieldCheck size={8} className="text-[#34D399]" />
                                <span className="text-white/55 text-[8px] font-medium uppercase tracking-wider">Escrow protected · {currentCampaign.deadline}</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── BOTTOM SHEETS ── */}
            <AnimatePresence>
                {activeSheet !== "none" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-auto" onClick={() => setActiveSheet("none")}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="absolute bottom-0 left-0 right-0 h-[60vh] glass-heavy rounded-t-3xl border-t border-[rgba(255,255,255,0.1)] flex flex-col overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                        >
                            <div
                                className="flex justify-center pt-3 pb-2 cursor-grab"
                                onTouchStart={(e) => { sheetStartY.current = e.touches[0].clientY; }}
                                onTouchEnd={(e) => { const dy = e.changedTouches[0].clientY - sheetStartY.current; if (dy > 60) setActiveSheet("none"); }}
                            ><div className="w-10 h-1.5 bg-white/20 rounded-full" /></div>
                            <div className="flex justify-between items-center px-5 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                                    {activeSheet === "specs" ? "Specs" : activeSheet === "squads" ? "Squads" : "Discussion"}
                                </h3>
                                <button onClick={() => setActiveSheet("none")} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"><X size={16} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar p-5 text-white/90">
                                {activeSheet === "specs" && (
                                    <div className="space-y-3">
                                        {currentCampaign.specs.map((s: string, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 glass-dark rounded-xl p-3 border border-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: currentCampaign.color, color: currentCampaign.color }} />
                                                <span className="font-semibold text-[11px] tracking-wide">{s}</span>
                                            </motion.div>
                                        ))}
                                        {currentCampaign.variants && currentCampaign.variants.length > 0 && (
                                            <div className="mt-5">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Community Vote</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {currentCampaign.variants.map(v => {
                                                        const total = currentCampaign.variants!.reduce((a, b) => a + b.votes, 0);
                                                        const pct = Math.round((v.votes / total) * 100);
                                                        return (
                                                            <div key={v.id} className="glass-dark rounded-xl p-2.5 border border-white/5 text-center transition-transform hover:scale-105">
                                                                {v.hex && <div className="w-full h-5 rounded-md mb-2 shadow-[0_0_10px_currentColor] border border-white/10" style={{ backgroundColor: v.hex, color: v.hex }} />}
                                                                <div className="text-[9px] font-bold tracking-wide">{v.label}</div>
                                                                <div className="text-[8px] text-[var(--neon-cyan)] mt-0.5 font-mono">{pct}%</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeSheet === "squads" && (
                                    <div className="space-y-3">
                                        <div className="glass-dark rounded-xl p-5 border border-white/5 text-center relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 blur-2xl" style={{ backgroundColor: currentCampaign.color }} />
                                            <div className="relative z-10">
                                                <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                                    <Zap size={10} className="text-[var(--neon-cyan)]" /> Total Pooled
                                                </div>
                                                <div className="text-3xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_15px_currentColor]" style={{ color: currentCampaign.color }}>
                                                    ${currentCampaign.squads.reduce((a: number, sq: Squad) => a + parseInt(sq.amount.replace(/\D/g, "")) * 100, 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        {currentCampaign.squads.map((sq: Squad, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex justify-between items-center glass-dark rounded-xl p-3.5 border border-white/5" style={{ borderLeft: `2px solid ${currentCampaign.color}` }}>
                                                <div>
                                                    <span className="font-bold text-[11px] tracking-wide">{sq.name}</span>
                                                    {sq.members && <span className="text-[9px] text-white/40 ml-2 font-mono">{sq.members}</span>}
                                                </div>
                                                <span className="font-bold text-white/50 text-[11px] tabular-nums font-mono">{sq.amount}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                {activeSheet === "comments" && (
                                    <div className="space-y-4">
                                        {[
                                            { user: "SneakerGod", avatar: "S", text: "This is gonna sell out so fast 🔥", time: "2h", likes: 42 },
                                            { user: "TechNinja", avatar: "T", text: "The specs on this are insane.", time: "4h", likes: 28 },
                                            { user: "DesignFan", avatar: "D", text: "Finally someone making what we want", time: "6h", likes: 15 },
                                            { user: "RetroWave", avatar: "R", text: "Pledged day one. Future of retail.", time: "12h", likes: 67 },
                                        ].map((c, i) => (
                                            <motion.div key={`seed-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[11px] text-white/50 shrink-0 border border-white/5">{c.avatar}</div>
                                                <div className="flex-1 min-w-0 pb-3 border-b border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[11px] tracking-wide text-white/80">{c.user}</span>
                                                        <span className="text-[9px] text-white/30 font-mono">{c.time}</span>
                                                    </div>
                                                    <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{c.text}</p>
                                                    <button className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1 hover:text-[var(--neon-pink)] transition-colors"><Heart size={10} /> {c.likes}</button>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {/* User-posted comments */}
                                        {(userComments[currentCampaign.id] ?? []).map((c, i) => (
                                            <motion.div key={`user-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 border border-white/10 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: currentCampaign.color, color: currentCampaign.color }}>{c.user[0]}</div>
                                                <div className="flex-1 min-w-0 pb-3 border-b border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[11px] tracking-wide text-white/80">{c.user}</span>
                                                        <span className="text-[9px] text-[var(--neon-cyan)] font-mono">now</span>
                                                    </div>
                                                    <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{c.text}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        <div className="sticky bottom-0 pt-3 pb-safe bg-transparent -mx-5 px-5 glass-heavy border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2">
                                            <input
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                                                placeholder="Add a transmission..."
                                                className="flex-1 glass-dark rounded-full px-4 py-2.5 text-[11px] text-white outline-none placeholder-white/30 border border-white/10 focus:border-[var(--neon-cyan)] focus:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all font-mono"
                                            />
                                            <button onClick={handlePostComment} className="text-[11px] font-bold uppercase tracking-widest px-3" style={{ color: currentCampaign.color }}>Send</button>
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
        <motion.button onClick={onClick} whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5">
            {icon}
            <span className="text-white/85 text-[9px] font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">{label}</span>
        </motion.button>
    );
}
