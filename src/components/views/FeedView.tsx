"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, CheckCircle2, Lock, Users, Zap, Info, X, Share2,
    Bookmark, MessageCircle, Heart, Maximize2, Move, RotateCcw, Hand,
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
    zenYOffset: number;
    setZenYOffset: (val: number) => void;
    zenXOffset: number;
    setZenXOffset: (val: number) => void;
    hasInteracted3D: boolean;
    isPitchOpen?: boolean;
    dragProgressRef: React.MutableRefObject<number>;
    pledgeState: PledgeState;
    onPledge: (campaignId: number) => void;
}

export default function FeedView({
    currentIndex, setCurrentIndex, currentCampaign, isInteractingWithObject,
    currentTab, isZenMode, setIsZenMode, zenYOffset, setZenYOffset, zenXOffset, setZenXOffset, hasInteracted3D, isPitchOpen, dragProgressRef, pledgeState, onPledge
}: FeedViewProps) {
    const [liked, setLiked] = useState<Record<number, boolean>>({});
    const [saved, setSaved] = useState<Record<number, boolean>>({});

    // Hydrate from localStorage after mount (avoids SSR mismatch)
    useEffect(() => {
        try { setLiked(JSON.parse(localStorage.getItem('dp-liked') ?? '{}')); } catch { }
        try { setSaved(JSON.parse(localStorage.getItem('dp-saved') ?? '{}')); } catch { }
    }, []);
    const [activeSheet, setActiveSheet] = useState<"none" | "specs" | "squads" | "comments">("none");
    const [showModal, setShowModal] = useState(false);
    const [feedTab, setFeedTab] = useState<"foryou" | "trending">("foryou");
    const [doubleTapHeart, setDoubleTapHeart] = useState<{ x: number; y: number; id: number } | null>(null);
    const [commentInput, setCommentInput] = useState("");
    const [userComments, setUserComments] = useState<Record<number, Array<{ user: string; text: string }>>>({});
    const [toast, setToast] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(0);
    const lastScrollTime = useRef(0);
    const sheetStartY = useRef(0);

    const isLiked = liked[currentCampaign.id] ?? false;
    const isSaved = saved[currentCampaign.id] ?? false;
    const progressPercent = Math.min((currentCampaign.pledged / currentCampaign.goal) * 100, 100);

    const handleNext = useCallback(() => { setCurrentIndex((p: number) => (p + 1) % CAMPAIGNS.length); }, [setCurrentIndex]);
    const handlePrev = useCallback(() => { setCurrentIndex((p: number) => (p - 1 + CAMPAIGNS.length) % CAMPAIGNS.length); }, [setCurrentIndex]);

    // Show onboarding on first visit
    useEffect(() => {
        if (!localStorage.getItem('dp-onboarded')) {
            setShowOnboarding(true);
        }
    }, []);

    const dismissOnboarding = () => {
        setShowOnboarding(false);
        localStorage.setItem('dp-onboarded', 'true');
    };

    // Toast helper
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2200);
    };

    // ── WHEEL scroll (desktop) ──
    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || activeSheet !== "none" || showModal || isPitchOpen) return;
            const now = Date.now();
            if (now - lastScrollTime.current < SCROLL_COOLDOWN_MS) return;
            if (Math.abs(e.deltaY) > WHEEL_DELTA_THRESHOLD) {
                e.deltaY > 0 ? handleNext() : handlePrev();
                lastScrollTime.current = now;
            }
        };
        window.addEventListener("wheel", onWheel, { passive: true });
        return () => window.removeEventListener("wheel", onWheel);
    }, [activeSheet, showModal, isPitchOpen, handleNext, handlePrev]);

    // ── TOUCH swipe (mobile) ──
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

            const dt = now - lastMoveTime;
            const recentDy = lastMoveY - endY;
            const velocity = dt > 0 ? Math.abs(recentDy) / dt : 0;

            const isFlick = velocity > 0.3 && Math.abs(totalDist) > 15;
            const isSwipe = Math.abs(totalDist) > 50;

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
    useEffect(() => { try { localStorage.setItem('dp-liked', JSON.stringify(liked)); } catch { } }, [liked]);
    useEffect(() => { try { localStorage.setItem('dp-saved', JSON.stringify(saved)); } catch { } }, [saved]);

    const handleShare = async () => {
        const data = { title: `${currentCampaign.title} — The Demand Pool`, text: `${currentCampaign.title} by ${currentCampaign.brand}`, url: window.location.href };
        try {
            if (navigator.share) {
                await navigator.share(data);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                showToast("Link copied to clipboard");
            }
        } catch { }
    };

    const handlePostComment = () => {
        if (!commentInput.trim()) return;
        setUserComments(prev => ({ ...prev, [currentCampaign.id]: [...(prev[currentCampaign.id] ?? []), { user: "You", text: commentInput.trim() }] }));
        setCommentInput("");
    };

    const handlePledge = () => {
        setShowModal(true);
    };

    const ONBOARDING_STEPS = [
        { title: "Welcome to The Demand Pool", desc: "Swipe through products that brands are considering. Your pledge signals real demand." },
        { title: "Pledge = Power", desc: "Tap \"Pledge Now\" to back a product. Your funds are held in escrow — 100% refundable if the goal isn't met." },
        { title: "Shape What Gets Made", desc: "Vote on variants, join squads, and pitch your own ideas. Brands listen when there's money behind the signal." },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full pointer-events-none">

            {/* ── ONBOARDING OVERLAY ── */}
            <AnimatePresence>
                {showOnboarding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto"
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismissOnboarding} />
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="relative glass-heavy rounded-[var(--radius-xl)] p-7 mx-6 max-w-sm w-full z-10"
                            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)" }}
                        >
                            {/* Step indicators */}
                            <div className="flex items-center gap-1.5 mb-6">
                                {ONBOARDING_STEPS.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ width: i === onboardingStep ? 28 : 6, opacity: i <= onboardingStep ? 1 : 0.25 }}
                                        transition={{ duration: 0.25 }}
                                        className="h-1.5 rounded-full bg-gray-900"
                                        style={{ minWidth: 6 }}
                                    />
                                ))}
                            </div>
                            {/* Step icon */}
                            <div className="w-11 h-11 rounded-[var(--radius-md)] bg-gray-900 flex items-center justify-center mb-5">
                                {onboardingStep === 0 ? <Zap size={20} className="text-white" /> : onboardingStep === 1 ? <Lock size={20} className="text-white" /> : <Users size={20} className="text-white" />}
                            </div>
                            <h3 className="text-[21px] font-bold tracking-tight text-gray-900 leading-tight mb-2.5">{ONBOARDING_STEPS[onboardingStep].title}</h3>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-7">{ONBOARDING_STEPS[onboardingStep].desc}</p>
                            <div className="flex gap-3">
                                <button onClick={dismissOnboarding} className="px-5 py-3 rounded-[var(--radius-sm)] text-[13px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                                    Skip
                                </button>
                                <button
                                    onClick={() => {
                                        if (onboardingStep < ONBOARDING_STEPS.length - 1) {
                                            setOnboardingStep(s => s + 1);
                                        } else {
                                            dismissOnboarding();
                                        }
                                    }}
                                    className="flex-1 py-3 rounded-[var(--radius-sm)] bg-gray-900 text-white text-[13px] font-bold hover:bg-gray-800 transition-colors"
                                >
                                    {onboardingStep < ONBOARDING_STEPS.length - 1 ? "Next" : "Get Started"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── TOAST ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="toast"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

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
                        <Heart size={72} className="text-[#F43F5E] fill-[#F43F5E] drop-shadow-md" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── VERY SUBTLE COLOR WASH ── */}
            <div className="absolute inset-0 pointer-events-none z-[0] opacity-10 mix-blend-multiply">
                <motion.div
                    key={currentCampaign.id + "-wash"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5, scale: [1, 1.1, 1], x: [0, 20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-[120%] h-[120%] blur-[120px] rounded-full top-[-10%] left-[-10%]"
                    style={{ backgroundColor: currentCampaign.color }}
                />
            </div>

            {/* ── LIGHT VIGNETTE ── */}
            <div className={`absolute inset-0 pointer-events-none z-[1] transition-opacity duration-500 ${isZenMode ? "opacity-0" : "opacity-100"}`}>
                <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-white via-white/80 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-white/90 via-white/20 to-transparent" />
            </div>

            {/* ── TOP BAR ── */}
            <div className={`absolute top-0 left-0 right-0 z-30 pt-safe pointer-events-auto transition-all duration-150 ${isZenMode ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100"}`}>
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center glass rounded-full p-0.5">
                        {(["foryou", "trending"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFeedTab(tab)}
                                aria-label={tab === "foryou" ? "Discover feed" : "Trending feed"}
                                className={`px-3 py-1.5 rounded-full text-[11px] transition-all ${feedTab === tab ? "bg-white text-gray-900 font-bold shadow-sm" : "text-gray-400 font-medium hover:text-gray-700"}`}
                            >
                                {tab === "foryou" ? "Discover" : "Trending"}
                            </button>
                        ))}
                    </div>
                    {/* Pagination */}
                    <div className="glass rounded-full px-2.5 py-1.5">
                        <span className="text-[11px] font-semibold text-gray-700 tabular-nums">
                            {currentIndex + 1}<span className="text-gray-400 mx-0.5">/</span>{CAMPAIGNS.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── ZEN MODE EXIT + CONTROLS ── */}
            <AnimatePresence>
                {isZenMode && (
                    <>
                        {/* Exit button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setIsZenMode(false)}
                            aria-label="Exit zen mode"
                            className="absolute top-14 right-4 z-50 w-11 h-11 rounded-full glass flex items-center justify-center shadow-md pointer-events-auto"
                        >
                            <X size={20} className="text-gray-800" />
                        </motion.button>

                        {/* Control tips — animated up from bottom */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="absolute left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-3 px-4"
                            style={{ bottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
                        >
                            {/* Horizontal X slider */}
                            <div className="pointer-events-auto flex items-center gap-3" style={{ width: 220 }}>
                                <span className="text-[14px] font-black text-black">←</span>
                                <input
                                    type="range"
                                    min="-0.8"
                                    max="0.8"
                                    step="0.02"
                                    value={zenXOffset}
                                    onChange={(e) => setZenXOffset(parseFloat(e.target.value))}
                                    aria-label="Adjust horizontal position"
                                    className="zen-slider flex-1"
                                />
                                <span className="text-[14px] font-black text-black">→</span>
                            </div>

                            {/* Tips bar */}
                            <div className="flex items-center gap-4 glass rounded-2xl px-5 py-3 shadow-lg">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    <RotateCcw size={12} className="text-gray-400" /> Drag
                                </div>
                                <div className="w-px h-4 bg-gray-200" />
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    <Hand size={12} className="text-gray-400" /> Pinch
                                </div>
                                <div className="w-px h-4 bg-gray-200" />
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    <Move size={12} className="text-gray-400" /> Slide
                                </div>
                            </div>
                        </motion.div>

                        {/* Vertical Y-axis slider — absolute positioned to align with the exit button gutter */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="absolute right-4 top-[32%] z-50 pointer-events-none flex flex-col items-center gap-1 w-11"
                            style={{ height: 220 }}
                        >
                            <span className="text-[14px] font-black text-black">↑</span>
                            <div className="relative flex-1 flex items-center justify-center w-full min-h-[200px]">
                                <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.02"
                                    value={zenYOffset}
                                    onChange={(e) => setZenYOffset(parseFloat(e.target.value))}
                                    aria-label="Adjust vertical position"
                                    className="zen-slider absolute transform -rotate-90 origin-center pointer-events-auto cursor-pointer"
                                    style={{ width: "200px", zIndex: 60 }}
                                />
                            </div>
                            <span className="text-[14px] font-black text-black">↓</span>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── ROTATE HINT ── */}
            <AnimatePresence>
                {!hasInteracted3D && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: 2 }} className="absolute top-[38%] left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
                        <div className="glass rounded-full text-gray-700 text-[11px] font-semibold uppercase tracking-widest px-5 py-2.5 flex items-center gap-2">
                            <motion.span animate={{ rotateZ: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="inline-block text-sm">↻</motion.span>
                            Drag to explore
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── RIGHT SIDEBAR (44px touch targets) ── */}
            <div className={`absolute right-2 z-30 pointer-events-auto flex flex-col items-center gap-2.5 transition-all duration-150 ${activeSheet !== "none" || isZenMode ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100"}`} style={{ bottom: "calc(var(--nav-height) + 12px)" }}>
                <div className="relative mb-1">
                    <div className="w-11 h-11 rounded-full border-[1.5px] border-gray-200 bg-white flex items-center justify-center font-bold text-[14px] text-gray-800 shadow-sm overflow-hidden p-1">
                        {currentCampaign.iconPath ? (
                            <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: currentCampaign.iconHex || '#000' }}>
                                <path d={currentCampaign.iconPath} />
                            </svg>
                        ) : currentCampaign.brandLogo ? (
                            <img src={currentCampaign.brandLogo} alt={currentCampaign.brand} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                            currentCampaign.brand.charAt(0)
                        )}
                    </div>
                </div>
                <SideBtn
                    icon={<Heart size={22} strokeWidth={isLiked ? 0 : 2} className={isLiked ? "fill-[#F43F5E] text-[#F43F5E]" : "text-gray-700"} />}
                    label={String(currentCampaign.backers ?? 0)}
                    ariaLabel={isLiked ? "Unlike this product" : "Like this product"}
                    onClick={() => {
                        setLiked(prev => ({ ...prev, [currentCampaign.id]: !isLiked }));
                        if (!isLiked) showToast("Added to your likes");
                    }}
                />
                <SideBtn
                    icon={<MessageCircle size={22} className="text-gray-700" />}
                    label={currentCampaign.squadsCount}
                    ariaLabel="Open comments"
                    onClick={() => { setActiveSheet("comments"); }}
                />
                <SideBtn
                    icon={<Bookmark size={20} strokeWidth={isSaved ? 0 : 2} className={isSaved ? "fill-gray-900 text-gray-900" : "text-gray-700"} />}
                    label={isSaved ? "Saved" : "Save"}
                    ariaLabel={isSaved ? "Remove from saved" : "Save this product"}
                    onClick={() => {
                        setSaved(prev => ({ ...prev, [currentCampaign.id]: !isSaved }));
                        showToast(isSaved ? "Removed from saved" : "Saved for later");
                    }}
                />
                <SideBtn
                    icon={<Share2 size={20} className="text-gray-700" />}
                    label="Share"
                    ariaLabel="Share this product"
                    onClick={() => { handleShare(); }}
                />
            </div>

            {/* ── BOTTOM INFO ── */}
            <div className={`absolute left-0 right-[60px] z-20 px-3 transition-all duration-150 ${isZenMode ? "opacity-0 translate-y-6" : "opacity-100"}`} style={{ bottom: "calc(var(--nav-height) + 8px)" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCampaign.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="glass-heavy p-3.5 rounded-[var(--radius-lg)]"
                        style={{ borderLeft: `3px solid ${currentCampaign.color}` }}
                    >
                        <div className="flex items-center gap-2 mb-1.5 w-fit">
                            {currentCampaign.iconPath ? (
                                <div className="h-6 w-6 flex items-center justify-center bg-transparent rounded-md">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: currentCampaign.iconHex || '#000' }}>
                                        <path d={currentCampaign.iconPath} />
                                    </svg>
                                </div>
                            ) : currentCampaign.brandLogo ? (
                                <div className="h-6 flex items-center bg-transparent rounded-md">
                                    <img src={currentCampaign.brandLogo} alt={currentCampaign.brand} className="h-5 object-contain" />
                                </div>
                            ) : (
                                <span className="text-gray-500 font-semibold text-[11px] uppercase tracking-wider">{currentCampaign.brand}</span>
                            )}
                            <LifecycleTracker currentStage={currentCampaign.lifecycle} color={currentCampaign.color} compact />
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${currentCampaign.color}18`, color: currentCampaign.color }}>
                                {currentCampaign.lifecycle}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-0.5">
                            <h2 className="text-gray-900 font-bold text-[15px] tracking-tight leading-none">
                                {currentCampaign.title}
                            </h2>
                            <CheckCircle2 size={12} className="text-blue-500 shrink-0" />
                        </div>

                        <p className="text-gray-600 text-[11px] font-medium leading-snug mb-2 line-clamp-2">
                            {currentCampaign.description}
                        </p>

                        <div className="pointer-events-auto">
                            {/* Progress Bar */}
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: currentCampaign.color }}
                                    />
                                </div>
                                <span className="text-gray-900 text-[10px] font-bold tabular-nums">
                                    {Math.round(progressPercent)}%
                                </span>
                            </div>
                            {/* Goal + backer context */}
                            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 mb-2 tabular-nums">
                                <span>${currentCampaign.pledged >= 1000 ? `${(currentCampaign.pledged / 1000).toFixed(1)}k` : currentCampaign.pledged} of ${currentCampaign.goal >= 1000 ? `${(currentCampaign.goal / 1000).toFixed(0)}k` : currentCampaign.goal}</span>
                                <span>{(currentCampaign.backers ?? 0).toLocaleString()} backers</span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                                {/* Pledge Now Button */}
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={pledgeState === "initiated" ? handlePledge : undefined}
                                    disabled={pledgeState !== "initiated"}
                                    className="flex-[2] py-2 px-3 rounded-[var(--radius-sm)] flex items-center justify-center gap-1.5 font-semibold text-[12px] text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: pledgeState === "locked" ? "#059669" : pledgeState === "escrowed" ? "#888" : currentCampaign.color,
                                        opacity: pledgeState === "escrowed" ? 0.75 : 1,
                                    }}
                                    aria-label={`Pledge for ${currentCampaign.title}`}
                                >
                                    {pledgeState === "locked" ? (
                                        <><CheckCircle2 size={14} /> Pledged</>
                                    ) : pledgeState === "escrowed" ? (
                                        <>Securing…</>
                                    ) : (
                                        <>Pledge Now</>
                                    )}
                                </motion.button>

                                {/* Details Button */}
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setActiveSheet("specs")}
                                    aria-label="View product details"
                                    className="flex-1 py-2 rounded-[var(--radius-sm)] bg-gray-100 hover:bg-gray-200 text-gray-800 text-[12px] font-semibold transition-all flex items-center justify-center"
                                >
                                    Details
                                </motion.button>
                            </div>

                            <div className="flex items-center justify-center w-full gap-1 mt-1.5">
                                <ShieldCheck size={10} className="text-emerald-500 shrink-0" />
                                <span className="text-gray-500 text-[10px] font-semibold">Fully refundable until {currentCampaign.deadline}</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── PLEDGE MODAL ── */}
            <PledgeModal
                campaign={currentCampaign}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onPledge={(id) => { onPledge(id); setShowModal(false); showToast("Pledge locked — zero risk, fully refundable"); }}
                pledgeState={pledgeState}
            />

            {/* ── BOTTOM SHEETS ── */}
            <AnimatePresence>
                {activeSheet !== "none" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-auto" onClick={() => setActiveSheet("none")}>
                        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="absolute bottom-0 left-0 right-0 h-[65vh] bg-white rounded-t-[var(--radius-xl)] border-t border-gray-200 flex flex-col overflow-hidden"
                            style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.1)" }}
                        >
                            <div
                                className="flex justify-center pt-4 pb-2 cursor-grab"
                                onTouchStart={(e) => { sheetStartY.current = e.touches[0].clientY; }}
                                onTouchEnd={(e) => { const dy = e.changedTouches[0].clientY - sheetStartY.current; if (dy > 60) setActiveSheet("none"); }}
                            ><div className="w-12 h-1.5 bg-gray-300 rounded-full" /></div>

                            <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-100 mt-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {activeSheet === "specs" ? "Product Details" : activeSheet === "squads" ? "Backers" : "Community Reviews"}
                                </h3>
                                <button
                                    onClick={() => setActiveSheet("none")}
                                    aria-label="Close panel"
                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600"
                                    style={{ minWidth: "var(--min-touch)", minHeight: "var(--min-touch)" }}
                                ><X size={18} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                                {activeSheet === "specs" && (
                                    <div className="space-y-4">
                                        {currentCampaign.specs.map((s: string, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 bg-gray-50 rounded-[var(--radius-md)] p-4 border border-gray-100">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentCampaign.color }} />
                                                <span className="font-semibold text-sm text-gray-800">{s}</span>
                                            </motion.div>
                                        ))}
                                        {currentCampaign.variants && currentCampaign.variants.length > 0 && (
                                            <div className="mt-8">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">Available Options</div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {currentCampaign.variants.map(v => {
                                                        const total = currentCampaign.variants!.reduce((a, b) => a + b.votes, 0);
                                                        const pct = Math.round((v.votes / total) * 100);
                                                        return (
                                                            <div key={v.id} className="bg-gray-50 rounded-[var(--radius-md)] p-4 border border-gray-200 text-center transition-transform hover:scale-105 shadow-sm">
                                                                {v.hex && <div className="w-full h-6 rounded-md mb-3 border border-gray-200/50" style={{ backgroundColor: v.hex }} />}
                                                                <div className="text-[12px] font-semibold text-gray-800">{v.label}</div>
                                                                <div className="text-[11px] text-gray-500 mt-1">{pct}% backed</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeSheet === "squads" && (
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[var(--radius-xl)] p-6 border border-gray-200 text-center relative overflow-hidden mb-6">
                                            <div className="relative z-10">
                                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                                                    <Zap size={14} className="text-amber-500" /> Total Pledged
                                                </div>
                                                <div className="text-4xl font-black tracking-tight" style={{ color: currentCampaign.color }}>
                                                    ${currentCampaign.squads.reduce((a: number, sq: Squad) => a + parseInt(sq.amount.replace(/\D/g, "")) * 100, 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-4">Top Groups</h4>
                                        {currentCampaign.squads.map((sq: Squad, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex justify-between items-center bg-white rounded-[var(--radius-md)] p-4 border border-gray-200 shadow-sm" style={{ borderLeft: `3px solid ${currentCampaign.color}` }}>
                                                <div>
                                                    <span className="font-bold text-sm text-gray-900">{sq.name}</span>
                                                    {sq.members && <span className="text-[12px] text-gray-500 ml-2">{sq.members} members</span>}
                                                </div>
                                                <span className="font-bold text-gray-800 text-sm">{sq.amount}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {activeSheet === "comments" && (
                                    <div className="space-y-6">
                                        {[
                                            { user: "Sarah J.", avatar: "S", text: "Just locked in my pledge! I've been waiting for a reissue for years.", time: "2h", likes: 42 },
                                            { user: "Tech Reviewer", avatar: "T", text: "The spec sheet looks incredible. If they actually deliver on the battery life, this is a game changer.", time: "4h", likes: 28 },
                                            { user: "David M.", avatar: "D", text: "Love the clean design here.", time: "6h", likes: 15 },
                                            { user: "Anna K.", avatar: "A", text: "Backed! Need this ASAP.", time: "12h", likes: 67 },
                                        ].map((c, i) => (
                                            <motion.div key={`seed-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-500 shrink-0 border border-gray-200">{c.avatar}</div>
                                                <div className="flex-1 min-w-0 pb-4 border-b border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-gray-900">{c.user}</span>
                                                        <span className="text-[12px] text-gray-400">{c.time}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{c.text}</p>
                                                    <button
                                                        aria-label={`Like comment by ${c.user}`}
                                                        className="text-[12px] text-gray-500 mt-2 flex items-center gap-1.5 hover:text-rose-500 transition-colors"
                                                    ><Heart size={14} /> {c.likes}</button>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* User-posted comments */}
                                        {(userComments[currentCampaign.id] ?? []).map((c, i) => (
                                            <motion.div key={`user-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm" style={{ backgroundColor: currentCampaign.color }}>{c.user[0]}</div>
                                                <div className="flex-1 min-w-0 pb-4 border-b border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-gray-900">{c.user}</span>
                                                        <span className="text-[12px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Just now</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{c.text}</p>
                                                </div>
                                            </motion.div>
                                        ))}

                                        <div className="sticky bottom-0 pt-4 pb-safe bg-white -mx-6 px-6 border-t border-gray-100 flex items-center gap-3">
                                            <input
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                                                placeholder="Ask a question or leave a comment..."
                                                aria-label="Write a comment"
                                                className="flex-1 bg-gray-100 rounded-full px-5 py-3.5 text-sm text-gray-900 outline-none placeholder-gray-500 border border-transparent focus:border-gray-300 focus:bg-white transition-all shadow-inner"
                                            />
                                            <button
                                                onClick={handlePostComment}
                                                aria-label="Post comment"
                                                className="text-sm font-bold px-4 py-2.5 rounded-full"
                                                style={{ color: currentCampaign.color, backgroundColor: `${currentCampaign.color}15`, minHeight: "var(--min-touch)" }}
                                            >Post</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SideBtn({ icon, label, ariaLabel, onClick }: { icon: React.ReactNode; label: string; ariaLabel: string; onClick: () => void }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={ariaLabel}
            className="flex flex-col items-center gap-1 transition-all"
            style={{ minWidth: "var(--min-touch)", minHeight: "var(--min-touch)" }}
        >
            <div className="glass-surface p-2.5 rounded-full flex items-center justify-center" style={{ minWidth: 44, minHeight: 44 }}>
                {icon}
            </div>
            <span className="text-gray-600 text-[11px] font-semibold tracking-wide">{label}</span>
        </motion.button>
    );
}
