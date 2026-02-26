"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, Send, Flame, Zap, CheckCircle2, Target, Lightbulb, MessageSquare, Sparkles, Wand2, Moon, Sun } from "lucide-react";
import { BRANDS } from "@/data/campaigns";
import { MOCK_PITCHES, BRAND_PROMPTS, SEED_PITCHES, type ExtractedPitch } from "@/data/pitches";

// ── Time-of-day helper ───────────────────────────────────────────────────────
function getTimeOfDay(): "dawn" | "day" | "sunset" | "night" {
    const h = new Date().getHours();
    if (h >= 5 && h < 8) return "dawn";
    if (h >= 8 && h < 17) return "day";
    if (h >= 17 && h < 20) return "sunset";
    return "night";
}

const TIME_THEMES = {
    dawn: {
        bg: "linear-gradient(165deg, #fef3c7 0%, #fde68a 20%, #fcd9a8 45%, #e8d5f0 70%, #ddd6fe 100%)",
        blobs: ["#fde68a", "#f5d0a9", "#e8d5f0"],
        particleColor: "rgba(253,230,138,0.35)",
        icon: Sun,
    },
    day: {
        bg: "linear-gradient(165deg, #f0f4ff 0%, #dbeafe 20%, #c7d8f5 45%, #e8ecf4 70%, #f5f3ff 100%)",
        blobs: ["#c7d8f5", "#dbeafe", "#e0e7ff"],
        particleColor: "rgba(199,216,245,0.35)",
        icon: Sun,
    },
    sunset: {
        bg: "linear-gradient(165deg, #fce4ec 0%, #e8a0b5 25%, #d4a0c0 50%, #b8a4d4 75%, #8b8ec4 100%)",
        blobs: ["#e8a0b5", "#d4a0c0", "#b8a4d4"],
        particleColor: "rgba(232,160,181,0.35)",
        icon: Moon,
    },
    night: {
        bg: "linear-gradient(165deg, #0f172a 0%, #1a1a3e 30%, #252550 55%, #1a1a3e 80%, #0c0a09 100%)",
        blobs: ["#4a4a8a", "#6a5acd", "#3a3a7a"],
        particleColor: "rgba(106,90,205,0.3)",
        icon: Moon,
    },
};

function getSeedPitches(brand: string): string[] {
    return SEED_PITCHES[brand] ?? [
        "More colorways in the existing lineup.",
        "Sustainable materials without compromising performance.",
    ];
}

// Colorful palette
const BUBBLE_COLORS = [
    { bg: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.2)", accent: "#FF6B6B" },
    { bg: "rgba(75,150,255,0.08)", border: "rgba(75,150,255,0.2)", accent: "#4B96FF" },
    { bg: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.2)", accent: "#C084FC" },
    { bg: "rgba(107,203,119,0.08)", border: "rgba(107,203,119,0.2)", accent: "#6BCB77" },
    { bg: "rgba(255,217,61,0.08)", border: "rgba(255,217,61,0.2)", accent: "#FFD93D" },
    { bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)", accent: "#38BDF8" },
];

function anonName(idx: number): string {
    const adj = ["Swift", "Bold", "Quiet", "Bright", "Keen", "Clear", "Warm", "Sharp"];
    const noun = ["Falcon", "River", "Peak", "Wave", "Stone", "Spark", "Cloud", "Leaf"];
    return `${adj[idx % adj.length]} ${noun[(idx * 3) % noun.length]}`;
}

// ── Stars component for night mode ──────────────────────────────────────────
function Stars() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: Math.random() * 2 + 1,
                        height: Math.random() * 2 + 1,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 70}%`,
                    }}
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                />
            ))}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
type Screen = "landing" | "pad" | "detail";

export default function PitchView() {
    const [subTab, setSubTab] = useState<"pitch" | "vote">("pitch");
    const [screen, setScreen] = useState<Screen>("landing");
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [pitches, setPitches] = useState<ExtractedPitch[]>(MOCK_PITCHES);
    const [detailPitch, setDetailPitch] = useState<ExtractedPitch | null>(null);
    const [tod, setTod] = useState<"dawn" | "day" | "sunset" | "night">("day");

    useEffect(() => { setTod(getTimeOfDay()); }, []);
    const theme = TIME_THEMES[tod];
    const isNight = tod === "night" || tod === "sunset";
    const textColor = isNight ? "text-white" : "text-gray-900";
    const subTextColor = isNight ? "text-white/70" : "text-gray-500";

    const goToPad = (brand: string) => { setSelectedBrand(brand); setScreen("pad"); };
    const goToDetail = (pitch: ExtractedPitch) => { setDetailPitch(pitch); setScreen("detail"); };
    const handleVote = (id: string) => {
        setPitches(prev => prev.map(p => p.id === id && !p.userVoted ? { ...p, voteCount: p.voteCount + 1, userVoted: true } : p));
        setDetailPitch(prev => prev && prev.id === id ? { ...prev, voteCount: prev.voteCount + 1, userVoted: true } : prev);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col overflow-hidden pointer-events-auto z-10 glass"
        >
            {/* Subtle floating ambient dots instead of large blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-indigo-500/5 blur-[80px]"
                        style={{
                            width: 300,
                            height: 300,
                            left: `${20 + i * 30}%`,
                            top: `${30 + i * 20}%`,
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <AnimatePresence mode="wait">
                    {screen === "landing" && (
                        <LandingScreen key="landing" subTab={subTab} setSubTab={setSubTab} pitches={pitches} onVoteDetail={goToDetail} selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} showDropdown={showDropdown} setShowDropdown={setShowDropdown} onGoPad={goToPad} tod={tod} theme={theme} isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
                    )}
                    {screen === "pad" && (
                        <PitchPad key="pad" brand={selectedBrand} onBack={() => setScreen("landing")} isNight={isNight} />
                    )}
                    {screen === "detail" && detailPitch && (
                        <VoteDetail key="detail" pitch={detailPitch} onBack={() => setScreen("landing")} onVote={() => handleVote(detailPitch.id)} isNight={isNight} />
                    )}
                </AnimatePresence>
            </div>
        </motion.div >
    );
}

// ── Screen 1: Landing ────────────────────────────────────────────────────────
function LandingScreen({ subTab, setSubTab, pitches, onVoteDetail, selectedBrand, setSelectedBrand, showDropdown, setShowDropdown, onGoPad, tod, theme, isNight, textColor, subTextColor }: {
    subTab: "pitch" | "vote";
    setSubTab: (t: "pitch" | "vote") => void;
    pitches: ExtractedPitch[];
    onVoteDetail: (p: ExtractedPitch) => void;
    selectedBrand: string;
    setSelectedBrand: (b: string) => void;
    showDropdown: boolean;
    setShowDropdown: (v: boolean) => void;
    onGoPad: (b: string) => void;
    tod: string;
    theme: typeof TIME_THEMES.day;
    isNight: boolean;
    textColor: string;
    subTextColor: string;
}) {
    const TimeIcon = theme.icon;
    return (
        <motion.div key="landing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="flex flex-col h-full max-w-lg mx-auto w-full">

            {/* Header */}
            <div className="px-6 pt-12 pb-4 z-10 border-b border-gray-50 bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-1">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                        <Wand2 size={26} className="text-indigo-500" />
                    </motion.div>
                    <h1 className={`text-3xl font-bold tracking-tight ${textColor}`}>Pitch</h1>
                    <motion.div
                        className="ml-auto"
                        animate={{ rotate: isNight ? [0, 5, 0] : [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <TimeIcon size={18} className="text-slate-400" />
                    </motion.div>
                </div>
                <p className={`text-sm ${subTextColor} mb-5`}>Tell brands what to make next.</p>

                {/* Pill tabs — PITCH first (left), VOTES second (right) */}
                <div className="flex rounded-full p-1 gap-1" style={{ background: isNight ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", border: isNight ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.06)" }}>
                    {(["pitch", "vote"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setSubTab(t)}
                            aria-label={t === "vote" ? "Community votes tab" : "Pitch an idea tab"}
                            className="flex-1 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
                            style={{
                                minHeight: "var(--min-touch)",
                                background: subTab === t
                                    ? (t === "pitch" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #3b82f6, #06b6d4)")
                                    : "transparent",
                                color: subTab === t ? "#fff" : (isNight ? "rgba(255,255,255,0.5)" : "#9CA3AF"),
                                boxShadow: subTab === t ? "0 4px 14px rgba(0,0,0,0.15)" : "none",
                            }}
                        >
                            {t === "pitch" ? <><Lightbulb size={14} /> Pitch</> : <><Target size={14} /> Votes</>}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {subTab === "vote" ? (
                    <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-[120px] flex flex-col gap-3">
                        <div className={`text-[11px] font-bold uppercase tracking-widest ${subTextColor} mb-1 flex items-center gap-2`}>
                            <Flame size={12} className="text-orange-400" /> Top Pitches This Week
                        </div>
                        {pitches.sort((a, b) => b.voteCount - a.voteCount).map((p, i) => {
                            const pct = Math.min((p.voteCount / p.threshold) * 100, 100);
                            const hot = pct >= 80;
                            const colors = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
                            return (
                                <motion.button
                                    key={p.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    onClick={() => onVoteDetail(p)}
                                    aria-label={`View pitch: ${p.title} by ${p.brandName}`}
                                    className="w-full text-left rounded-2xl p-4 active:scale-[0.98] transition-all hover:shadow-lg group overflow-hidden"
                                    style={{
                                        minHeight: "var(--min-touch)",
                                        backgroundColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.92)",
                                        backdropFilter: "blur(16px)",
                                        border: isNight ? `1px solid rgba(255,255,255,0.1)` : `1px solid ${colors.border}`,
                                    }}
                                >
                                    {/* Brand row + hot badge */}
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shrink-0 border" style={{ backgroundColor: isNight ? "rgba(255,255,255,0.05)" : "#fff", borderColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }}>
                                            {p.brandLogo ? (
                                                <img src={p.brandLogo} alt={p.brandName} className={`w-full h-full object-contain ${isNight ? "brightness-200" : "mix-blend-multiply"}`} />
                                            ) : p.iconPath ? (
                                                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: isNight ? '#fff' : (p.iconHex || p.brandHue) }}>
                                                    <path d={p.iconPath} />
                                                </svg>
                                            ) : (
                                                <span className="text-[10px] font-bold" style={{ color: p.brandHue }}>{p.brandName[0]}</span>
                                            )}
                                        </div>
                                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isNight ? "text-white/50" : "text-gray-400"}`}>{p.brandName}</span>
                                        {hot && (
                                            <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shrink-0" style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)" }}>
                                                <Flame size={10} /> Hot
                                            </span>
                                        )}
                                    </div>

                                    {/* Title — wraps naturally */}
                                    <div className={`font-bold text-[15px] leading-snug mb-1.5 ${isNight ? "text-white group-hover:text-purple-300" : "text-gray-900 group-hover:text-purple-600"} transition-colors`}>{p.title}</div>

                                    {/* Summary — 2 line clamp */}
                                    <p className={`text-[12px] font-medium line-clamp-2 mb-3 leading-relaxed ${isNight ? "text-white/50" : "text-gray-600"}`}>{p.summary}</p>

                                    {/* Segmented progress bar */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 flex gap-[2px] h-[5px]">
                                            {Array.from({ length: 12 }).map((_, idx) => {
                                                const threshold = (idx / 12) * 100;
                                                const isFilled = pct >= threshold;
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: isFilled ? 1 : (isNight ? 0.15 : 0.2) }}
                                                        transition={{ duration: 0.3, delay: (i * 0.06) + (idx * 0.02) }}
                                                        className="h-full flex-1 rounded-[2px]"
                                                        style={{ backgroundColor: isFilled ? colors.accent : (isNight ? "rgba(255,255,255,0.2)" : "#D1D5DB") }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: colors.accent }}>
                                            {Math.round(pct)}%
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 px-5 pt-3 pb-[120px] flex flex-col gap-5 overflow-y-auto no-scrollbar">
                        {/* Brand selector card */}
                        <div className="rounded-2xl border p-5" style={{ background: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", borderColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)" }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C084FC, #38BDF8)" }}>
                                    <Target size={14} className="text-white" />
                                </div>
                                <div className={`text-[11px] font-bold uppercase tracking-wider ${subTextColor}`}>Target Brand</div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    aria-label="Select a brand to pitch to"
                                    aria-expanded={showDropdown}
                                    className="w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-colors group"
                                    style={{
                                        minHeight: "var(--min-touch)",
                                        background: isNight ? "rgba(255,255,255,0.05)" : "rgba(249,250,251,0.8)",
                                        borderColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(229,231,235,0.6)",
                                    }}
                                >
                                    <span className={`text-sm font-bold ${selectedBrand ? textColor : subTextColor}`}>
                                        {selectedBrand || "Choose a brand..."}
                                    </span>
                                    <ChevronDown size={18} className={`${subTextColor} transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full left-0 right-0 mt-2 rounded-xl border z-30 max-h-64 overflow-y-auto no-scrollbar"
                                            style={{
                                                background: isNight ? "rgba(30,27,75,0.95)" : "#fff",
                                                borderColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(229,231,235,0.5)",
                                                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                                                backdropFilter: "blur(20px)",
                                            }}
                                        >
                                            {BRANDS.map(b => (
                                                <button
                                                    key={b.name}
                                                    onClick={() => { setSelectedBrand(b.name); setShowDropdown(false); }}
                                                    aria-label={`Select ${b.name}`}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${isNight ? "border-white/5 hover:bg-white/10" : "border-gray-50 hover:bg-purple-50/50"} last:border-0`}
                                                    style={{ minHeight: "var(--min-touch)" }}
                                                >
                                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5 border shrink-0" style={{ background: isNight ? "rgba(255,255,255,0.05)" : "#fff", borderColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(229,231,235,0.5)" }}>
                                                        {b.brandLogo ? (
                                                            <img src={b.brandLogo} alt={b.name} className={`w-full h-full object-contain ${isNight ? "brightness-200" : "mix-blend-multiply"}`} />
                                                        ) : b.iconPath ? (
                                                            <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: isNight ? '#fff' : (b.iconHex || '#000') }}>
                                                                <path d={b.iconPath} />
                                                            </svg>
                                                        ) : (
                                                            <span className={`text-sm font-bold ${textColor}`}>{b.name[0]}</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-bold ${textColor}`}>{b.name}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Brand prompt */}
                        <AnimatePresence>
                            {selectedBrand && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl p-5 overflow-hidden"
                                    style={{ background: isNight ? "rgba(139,92,246,0.15)" : "linear-gradient(135deg, rgba(192,132,252,0.08), rgba(56,189,248,0.08))", border: isNight ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(192,132,252,0.15)" }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #C084FC, #38BDF8)" }} />
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Brand Request</div>
                                    </div>
                                    <p className={`text-sm font-semibold leading-relaxed italic ${textColor}`}>
                                        &ldquo;{BRAND_PROMPTS[selectedBrand] ?? "What product have you always wanted from us?"}&rdquo;
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CTA */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            disabled={!selectedBrand}
                            onClick={() => onGoPad(selectedBrand)}
                            aria-label="Open pitch stream"
                            className="w-full py-4 text-white rounded-full font-bold uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            style={{
                                minHeight: "var(--min-touch)",
                                backgroundImage: selectedBrand ? "linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)" : "none",
                                backgroundColor: selectedBrand ? undefined : (isNight ? "rgba(255,255,255,0.1)" : "#D1D5DB"),
                            }}
                        >
                            <Sparkles size={16} /> Open Pitch Stream
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Screen 2: Pitch Pad ──────────────────────────────────────────────────────
function PitchPad({ brand, onBack, isNight }: { brand: string; onBack: () => void; isNight: boolean }) {
    const brand_ = BRANDS.find(b => b.name === brand);
    const [stream, setStream] = useState<string[]>(getSeedPitches(brand));
    const [inputText, setInputText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const streamRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const seeds = getSeedPitches(brand);
        let idx = 0;
        const interval = setInterval(() => {
            if (idx < seeds.length) { setStream(prev => [...prev, seeds[idx % seeds.length]]); idx++; }
        }, 4000 + Math.random() * 4000);
        return () => clearInterval(interval);
    }, [brand]);

    useEffect(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; }, [stream]);

    const handleSubmit = useCallback(() => {
        const text = inputText.trim();
        if (!text) return;
        setStream(prev => [...prev, text]);
        setInputText("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
    }, [inputText]);

    return (
        <motion.div key="pad" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }} className="flex flex-col h-full max-w-lg mx-auto w-full">
            {/* Header */}
            <div className="px-5 pt-12 pb-3 flex items-center gap-3 z-10 shrink-0" style={{ background: isNight ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderBottom: isNight ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)" }}>
                <button onClick={onBack} aria-label="Go back" className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isNight ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
                    <ChevronLeft size={20} className={isNight ? "text-white/70" : "text-gray-600"} />
                </button>
                <div className="flex items-center gap-2.5 min-w-0">
                    {brand_ && (
                        <div className={`w-9 h-9 rounded-lg p-1.5 flex items-center justify-center shrink-0 border ${isNight ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                            {brand_.brandLogo ? (
                                <img src={brand_.brandLogo} alt={brand_.name} className={`w-full h-full object-contain ${isNight ? "brightness-200" : "mix-blend-multiply"}`} />
                            ) : brand_.iconPath ? (
                                <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: isNight ? '#fff' : (brand_.iconHex || '#000') }}>
                                    <path d={brand_.iconPath} />
                                </svg>
                            ) : (
                                <span className={`text-sm font-bold ${isNight ? "text-white" : "text-gray-900"}`}>{brand_.name[0]}</span>
                            )}
                        </div>
                    )}
                    <div>
                        <div className={`font-bold text-sm tracking-tight ${isNight ? "text-white" : "text-gray-900"}`}>{brand} Stream</div>
                        <div className="text-[11px] font-semibold text-purple-400">{stream.length} ideas</div>
                    </div>
                </div>
            </div>

            {/* Prompt banner */}
            <div className="px-5 py-3 shrink-0" style={{ background: isNight ? "rgba(139,92,246,0.1)" : "linear-gradient(135deg, rgba(192,132,252,0.1), rgba(56,189,248,0.1))", borderBottom: isNight ? "1px solid rgba(139,92,246,0.1)" : "1px solid rgba(192,132,252,0.12)" }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-purple-400">
                    <Sparkles size={10} className="inline mr-1" /> Live Prompt
                </div>
                <p className={`text-sm font-semibold leading-snug italic ${isNight ? "text-white/80" : "text-gray-900"}`}>
                    &ldquo;{BRAND_PROMPTS[brand] ?? "What product have you always wanted from us?"}&rdquo;
                </p>
            </div>

            {/* Stream */}
            <div className="flex-1 min-h-0 relative">
                <div ref={streamRef} className="absolute inset-0 overflow-y-auto no-scrollbar p-4 pb-32">
                    {stream.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                <MessageSquare size={22} className="text-white" />
                            </motion.div>
                            <p className={`text-sm font-semibold mb-1 ${isNight ? "text-white/60" : "text-gray-500"}`}>No pitches yet</p>
                            <p className={`text-[12px] ${isNight ? "text-white/40" : "text-gray-400"}`}>Be the first to share your idea.</p>
                        </div>
                    ) : stream.map((text, i) => {
                        const isMine = i === stream.length - 1 && submitted;
                        const colors = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`mb-3 max-w-[85%] p-4 ${isMine ? "ml-auto rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"}`}
                                style={{
                                    background: isMine ? "linear-gradient(135deg, #4B96FF, #38BDF8)" : (isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)"),
                                    backdropFilter: isMine ? "none" : "blur(12px)",
                                    border: isMine ? "none" : (isNight ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${colors.border}`),
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: isMine ? "rgba(255,255,255,0.3)" : colors.bg, color: isMine ? "#fff" : colors.accent, border: isMine ? "none" : `1px solid ${colors.border}` }}>
                                        {isMine ? "M" : anonName(i).charAt(0)}
                                    </div>
                                    <span className={`text-[10px] font-semibold ${isMine ? "text-blue-100" : (isNight ? "text-white/40" : "text-gray-400")}`}>
                                        {isMine ? "You · Just now" : anonName(i)}
                                    </span>
                                </div>
                                <p className={`text-[13px] font-medium leading-relaxed ${isMine ? "text-white" : (isNight ? "text-white/70" : "text-gray-700")}`}>{text}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-[calc(env(safe-area-inset-bottom)+90px)]" style={{ background: isNight ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.85)", backdropFilter: "blur(24px)", borderTop: isNight ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)" }}>
                <div className="flex gap-2.5 max-w-lg mx-auto">
                    <input
                        value={inputText}
                        onChange={e => setInputText(e.target.value.slice(0, 280))}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        placeholder="Share your idea..."
                        aria-label="Type your pitch"
                        className={`flex-1 rounded-full border px-4 py-3 text-sm font-semibold placeholder-gray-400 outline-none transition-all ${isNight ? "bg-white/5 border-white/10 text-white focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30" : "bg-gray-50/80 border-gray-200/60 text-gray-900 focus:border-purple-300 focus:ring-2 focus:ring-purple-100"}`}
                    />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={!inputText.trim()} aria-label="Submit pitch" className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30 shrink-0 shadow-lg" style={{ background: inputText.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)" : (isNight ? "rgba(255,255,255,0.1)" : "#D1D5DB") }}>
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div key="c" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><CheckCircle2 size={18} className="text-white" /></motion.div>
                            ) : (
                                <motion.div key="s" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Send size={16} className="text-white ml-0.5" /></motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

// ── Screen 3: Vote Detail ────────────────────────────────────────────────────
function VoteDetail({ pitch, onBack, onVote, isNight }: { pitch: ExtractedPitch; onBack: () => void; onVote: () => void; isNight: boolean }) {
    const pct = Math.min((pitch.voteCount / pitch.threshold) * 100, 100);
    const hot = pct >= 80;

    return (
        <motion.div key="detail" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.25 }} className="flex flex-col h-full max-w-lg mx-auto w-full">
            <div className="px-5 pt-12 pb-3 flex items-center gap-3" style={{ background: isNight ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderBottom: isNight ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)" }}>
                <button onClick={onBack} aria-label="Go back" className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isNight ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <ChevronLeft size={20} className={isNight ? "text-white/70" : "text-gray-600"} />
                </button>
                <span className={`font-bold text-sm tracking-tight ${isNight ? "text-white" : "text-gray-900"}`}>Pitch Details</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-[120px] space-y-5">
                <div className="rounded-2xl p-5 border" style={{ background: isNight ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-2 border rounded-lg px-2.5 py-1.5 ${isNight ? "border-white/10 bg-white/5" : "border-gray-100 bg-white/80"}`}>
                            {pitch.brandLogo ? (
                                <img src={pitch.brandLogo} alt={pitch.brandName} className={`h-4 ${isNight ? "brightness-200" : "mix-blend-multiply"}`} />
                            ) : (
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isNight ? "text-white/70" : "text-gray-600"}`}>{pitch.brandName}</span>
                            )}
                        </div>
                        {hot && <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}><Flame size={12} /> Almost Greenlit</div>}
                    </div>
                    <h2 className={`text-2xl font-bold tracking-tight leading-tight mb-4 ${isNight ? "text-white" : "text-gray-900"}`}>{pitch.title}</h2>
                    <div className="rounded-xl p-4" style={{ background: isNight ? "rgba(139,92,246,0.1)" : "linear-gradient(135deg, rgba(192,132,252,0.06), rgba(56,189,248,0.06))", border: isNight ? "1px solid rgba(139,92,246,0.15)" : "1px solid rgba(192,132,252,0.1)" }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">Community Brief</div>
                        <p className={`text-sm leading-relaxed font-medium ${isNight ? "text-white/60" : "text-gray-700"}`}>{pitch.summary}</p>
                    </div>
                </div>

                <div className="rounded-2xl border p-5" style={{ background: isNight ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)" }}>
                    <div className="flex justify-between items-end mb-3">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isNight ? "text-white/50" : "text-gray-500"}`}>Votes to Greenlight</span>
                        <span className="text-xl font-bold tabular-nums text-purple-400">{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden mb-4" style={{ background: isNight ? "rgba(255,255,255,0.08)" : "rgba(192,132,252,0.1)" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #C084FC, #38BDF8)" }} />
                    </div>
                    <div className={`flex justify-between text-[12px] font-mono tracking-wider font-semibold ${isNight ? "text-white/40" : "text-gray-400"}`}>
                        <span>{pitch.voteCount.toLocaleString()} votes</span>
                        <span>{pitch.threshold.toLocaleString()} needed</span>
                    </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={onVote} disabled={pitch.userVoted} aria-label={pitch.userVoted ? "Already voted" : "Vote for this concept"} className="w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg" style={{ background: pitch.userVoted ? (isNight ? "rgba(255,255,255,0.08)" : "#F3F4F6") : "linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)", color: pitch.userVoted ? (isNight ? "rgba(255,255,255,0.4)" : "#9CA3AF") : "#fff", border: pitch.userVoted ? (isNight ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E7EB") : "none", minHeight: "var(--min-touch)" }}>
                    {pitch.userVoted ? <><CheckCircle2 size={18} /> Voted</> : <><Sparkles size={16} /> Vote For This Concept</>}
                </motion.button>
                <p className={`text-[11px] text-center font-medium leading-relaxed px-6 ${isNight ? "text-white/30" : "text-gray-400"}`}>
                    1 vote per pitch. Threshold met = advance to official pledge campaign.
                </p>
            </div>
        </motion.div>
    );
}
