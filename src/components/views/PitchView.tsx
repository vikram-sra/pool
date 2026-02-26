"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Flame, CheckCircle2, Target, Lightbulb, MessageSquare, Sparkles, Wand2 } from "lucide-react";
import { BRANDS } from "@/data/campaigns";
import { MOCK_PITCHES, BRAND_PROMPTS, SEED_PITCHES, type ExtractedPitch } from "@/data/pitches";

// Concept tags per brand for mockup cards
const BRAND_CONCEPT_TAGS: Record<string, string[]> = {
    Nike: ["retro colorway", "canvas upper", "OG silhouette"],
    Sony: ["hi-res audio", "retro shell", "OLED display"],
    Leica: ["no screen", "M-mount", "minimal"],
    Dyson: ["wearable", "AQI sensor", "urban air"],
    "Teenage Eng": ["modular", "magnetic", "sequencer"],
    Arcteryx: ["alpine", "Gore-Tex Pro", "minimalist"],
    Braun: ["Bauhaus", "faithful reissue", "monochrome"],
    Nintendo: ["retro IP", "limited run", "cartridge"],
    MillerKnoll: ["ergonomic", "WFH", "carbon fiber"],
};

function getConceptTags(p: ExtractedPitch): string[] {
    return BRAND_CONCEPT_TAGS[p.brandName]?.slice(0, 3) ?? ["concept", "community", "demand"];
}

const BRAND_CAMPAIGN_META: Record<string, { deliveryTimeframe: string; minOrders: number; minAmount: string; deliveryDate: string }> = {
    Nike: { deliveryTimeframe: "6-8 months", minOrders: 500, minAmount: "$25,000", deliveryDate: "Q4 2026" },
    Sony: { deliveryTimeframe: "8-12 months", minOrders: 1000, minAmount: "$150,000", deliveryDate: "Q1 2027" },
    Leica: { deliveryTimeframe: "10-14 months", minOrders: 250, minAmount: "$400,000", deliveryDate: "Q3 2026" },
    Arcteryx: { deliveryTimeframe: "8-10 months", minOrders: 300, minAmount: "$120,000", deliveryDate: "Q1 2027" },
    "Teenage Eng": { deliveryTimeframe: "6-9 months", minOrders: 500, minAmount: "$80,000", deliveryDate: "Q4 2026" },
    Braun: { deliveryTimeframe: "6-8 months", minOrders: 400, minAmount: "$60,000", deliveryDate: "Q4 2026" },
    Dyson: { deliveryTimeframe: "12-18 months", minOrders: 2000, minAmount: "$800,000", deliveryDate: "Q4 2027" },
    Nintendo: { deliveryTimeframe: "8-12 months", minOrders: 3000, minAmount: "$300,000", deliveryDate: "Q1 2027" },
    MillerKnoll: { deliveryTimeframe: "6-8 months", minOrders: 200, minAmount: "$90,000", deliveryDate: "Q3 2026" },
};

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

function getSeedPitches(brand: string): string[] {
    return SEED_PITCHES[brand] ?? [
        "More colorways in the existing lineup.",
        "Sustainable materials without compromising performance.",
    ];
}

type Screen = "landing" | "pad" | "detail";

export default function PitchView() {
    const [subTab, setSubTab] = useState<"pitch" | "vote">("pitch");
    const [screen, setScreen] = useState<Screen>("landing");
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [pitches, setPitches] = useState<ExtractedPitch[]>(MOCK_PITCHES);
    const [detailPitch, setDetailPitch] = useState<ExtractedPitch | null>(null);

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
            className="absolute inset-0 flex flex-col overflow-hidden pointer-events-auto z-10"
            style={{ background: "#0D0C0B" }}
        >
            {/* Ambient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full blur-[80px]"
                        style={{
                            width: 300, height: 300,
                            left: `${20 + i * 30}%`, top: `${30 + i * 20}%`,
                            background: i === 0 ? "rgba(245,158,11,0.04)" : i === 1 ? "rgba(192,132,252,0.04)" : "rgba(56,189,248,0.03)",
                        }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <AnimatePresence mode="wait">
                    {screen === "landing" && (
                        <LandingScreen key="landing" subTab={subTab} setSubTab={setSubTab} pitches={pitches} onVoteDetail={goToDetail} selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} onGoPad={goToPad} />
                    )}
                    {screen === "pad" && (
                        <PitchPad key="pad" brand={selectedBrand} onBack={() => setScreen("landing")} />
                    )}
                    {screen === "detail" && detailPitch && (
                        <VoteDetail key="detail" pitch={detailPitch} onBack={() => setScreen("landing")} onVote={() => handleVote(detailPitch.id)} />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ── Landing ──────────────────────────────────────────────────────────────────
function LandingScreen({ subTab, setSubTab, pitches, onVoteDetail, selectedBrand, setSelectedBrand, onGoPad }: {
    subTab: "pitch" | "vote";
    setSubTab: (t: "pitch" | "vote") => void;
    pitches: ExtractedPitch[];
    onVoteDetail: (p: ExtractedPitch) => void;
    selectedBrand: string;
    setSelectedBrand: (b: string) => void;
    onGoPad: (b: string) => void;
}) {
    return (
        <motion.div key="landing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="flex flex-col h-full max-w-lg mx-auto w-full">

            {/* Header */}
            <div className="px-6 pt-12 pb-4 z-10 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(13,12,11,0.85)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-3 mb-1">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                        <Wand2 size={26} style={{ color: "#F59E0B" }} />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#F5F0EB" }}>Pitch</h1>
                </div>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>Tell brands what to make next.</p>

                {/* Pill tabs */}
                <div className="flex rounded-full p-1 gap-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {(["pitch", "vote"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setSubTab(t)}
                            aria-label={t === "vote" ? "Community votes tab" : "Pitch an idea tab"}
                            className="flex-1 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
                            style={{
                                minHeight: "var(--min-touch)",
                                background: subTab === t ? (t === "pitch" ? "linear-gradient(135deg, #F59E0B, #F97316)" : "linear-gradient(135deg, #3b82f6, #06b6d4)") : "transparent",
                                color: subTab === t ? "#fff" : "rgba(255,255,255,0.35)",
                                boxShadow: subTab === t ? "0 4px 14px rgba(0,0,0,0.3)" : "none",
                            }}
                        >
                            {t === "pitch" ? <><Lightbulb size={14} /> Pitch</> : <><Target size={14} /> Votes</>}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ── VOTE TAB ── */}
                {subTab === "vote" ? (
                    <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-[120px] flex flex-col gap-3">
                        <div className="text-[11px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                            <Flame size={12} className="text-orange-400" /> Top Pitches This Week
                        </div>
                        {pitches.sort((a, b) => b.voteCount - a.voteCount).map((p, i) => {
                            const pct = Math.min((p.voteCount / p.threshold) * 100, 100);
                            const hot = pct >= 80;
                            const colors = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
                            const tags = getConceptTags(p);
                            return (
                                <motion.button
                                    key={p.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    onClick={() => onVoteDetail(p)}
                                    aria-label={`View pitch: ${p.title} by ${p.brandName}`}
                                    className="w-full text-left rounded-2xl active:scale-[0.98] transition-all group overflow-hidden"
                                    style={{ minHeight: "var(--min-touch)", backgroundColor: "rgba(26,23,20,0.95)", border: `1px solid ${colors.border}` }}
                                >
                                    {/* Brand color accent bar */}
                                    <div className="h-0.5 w-full" style={{ background: p.brandHue }} />

                                    <div className="p-4">
                                        {/* Brand row */}
                                        <div className="flex items-center gap-2.5 mb-2.5">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shrink-0 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                                                {p.brandLogo ? (
                                                    <img src={p.brandLogo} alt={p.brandName} className="w-full h-full object-contain brightness-200 contrast-200" />
                                                ) : p.iconPath ? (
                                                    <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: p.iconHex || p.brandHue }}>
                                                        <path d={p.iconPath} />
                                                    </svg>
                                                ) : (
                                                    <span className="text-[10px] font-bold" style={{ color: p.brandHue }}>{p.brandName[0]}</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{p.brandName}</span>
                                            {hot && (
                                                <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shrink-0" style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)" }}>
                                                    <Flame size={10} /> Hot
                                                </span>
                                            )}
                                        </div>

                                        {/* Concept tags */}
                                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                                            {tags.map(tag => (
                                                <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${p.brandHue}18`, color: p.brandHue, border: `1px solid ${p.brandHue}35` }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="font-bold text-[15px] leading-snug mb-1.5" style={{ color: "#F5F0EB" }}>{p.title}</div>
                                        <p className="text-[12px] font-medium line-clamp-2 mb-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{p.summary}</p>

                                        {/* Segmented progress bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 flex gap-[2px] h-[5px]">
                                                {Array.from({ length: 12 }).map((_, idx) => {
                                                    const isFilled = pct >= (idx / 12) * 100;
                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: isFilled ? 1 : 0.15 }}
                                                            transition={{ duration: 0.3, delay: (i * 0.06) + (idx * 0.02) }}
                                                            className="h-full flex-1 rounded-[2px]"
                                                            style={{ backgroundColor: isFilled ? colors.accent : "rgba(255,255,255,0.15)" }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: colors.accent }}>{Math.round(pct)}%</span>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                ) : (
                    /* ── PITCH TAB ── */
                    <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 px-5 pt-3 pb-[120px] flex flex-col gap-5 overflow-y-auto no-scrollbar">

                        {/* Brand chip selector */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}>
                                    <Target size={14} className="text-white" />
                                </div>
                                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Target Brand</div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {BRANDS.map(b => (
                                    <button
                                        key={b.name}
                                        onClick={() => setSelectedBrand(selectedBrand === b.name ? "" : b.name)}
                                        aria-label={`Select ${b.name}`}
                                        className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-full transition-all"
                                        style={{
                                            background: selectedBrand === b.name ? `${b.hue}20` : "rgba(255,255,255,0.04)",
                                            border: `1px solid ${selectedBrand === b.name ? `${b.hue}50` : "rgba(255,255,255,0.08)"}`,
                                            color: selectedBrand === b.name ? b.hue : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0">
                                            {b.brandLogo ? (
                                                <img src={b.brandLogo} alt={b.name} className="w-full h-full object-contain brightness-200 contrast-200" />
                                            ) : b.iconPath ? (
                                                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: selectedBrand === b.name ? b.hue : "rgba(255,255,255,0.5)" }}>
                                                    <path d={b.iconPath} />
                                                </svg>
                                            ) : (
                                                <span className="text-[10px] font-bold">{b.name[0]}</span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-bold whitespace-nowrap">{b.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Brand prompt + meta */}
                        <AnimatePresence>
                            {selectedBrand && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl p-5 overflow-hidden"
                                    style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-amber-500" />
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Brand Prompt</div>
                                    </div>
                                    <p className="text-sm font-semibold leading-relaxed italic mb-4" style={{ color: "#F5F0EB" }}>
                                        &ldquo;{BRAND_PROMPTS[selectedBrand] ?? "What product have you always wanted from us?"}&rdquo;
                                    </p>
                                    {BRAND_CAMPAIGN_META[selectedBrand] && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: "Est. Delivery", value: BRAND_CAMPAIGN_META[selectedBrand].deliveryDate },
                                                { label: "Timeframe", value: BRAND_CAMPAIGN_META[selectedBrand].deliveryTimeframe },
                                                { label: "Min Orders", value: BRAND_CAMPAIGN_META[selectedBrand].minOrders.toLocaleString() },
                                                { label: "Min Funding", value: BRAND_CAMPAIGN_META[selectedBrand].minAmount },
                                            ].map(s => (
                                                <div key={s.label} className="rounded-[var(--radius-sm)] p-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                    <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                                                    <div className="text-[12px] font-bold" style={{ color: "#F5F0EB" }}>{s.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                            style={{ minHeight: "var(--min-touch)", background: selectedBrand ? "linear-gradient(135deg, #F59E0B, #F97316)" : "rgba(255,255,255,0.08)" }}
                        >
                            <Sparkles size={16} /> Open Pitch Stream
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Pitch Pad ─────────────────────────────────────────────────────────────────
function PitchPad({ brand, onBack }: { brand: string; onBack: () => void }) {
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
            <div className="px-5 pt-12 pb-3 flex items-center gap-3 z-10 shrink-0" style={{ background: "rgba(13,12,11,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={onBack} aria-label="Go back" className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                    <ChevronLeft size={20} style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
                <div className="flex items-center gap-2.5 min-w-0">
                    {brand_ && (
                        <div className="w-9 h-9 rounded-lg p-1.5 flex items-center justify-center shrink-0 border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                            {brand_.brandLogo ? (
                                <img src={brand_.brandLogo} alt={brand_.name} className="w-full h-full object-contain brightness-200 contrast-200" />
                            ) : brand_.iconPath ? (
                                <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: brand_.iconHex || '#fff' }}>
                                    <path d={brand_.iconPath} />
                                </svg>
                            ) : (
                                <span className="text-sm font-bold" style={{ color: "#F5F0EB" }}>{brand_.name[0]}</span>
                            )}
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-sm tracking-tight" style={{ color: "#F5F0EB" }}>{brand} Stream</div>
                        <div className="text-[11px] font-semibold text-amber-500">{stream.length} ideas</div>
                    </div>
                </div>
            </div>

            <div className="px-5 py-3 shrink-0" style={{ background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.1)" }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-amber-500">
                    <Sparkles size={10} className="inline mr-1" /> Live Prompt
                </div>
                <p className="text-sm font-semibold leading-snug italic" style={{ color: "rgba(255,255,255,0.8)" }}>
                    &ldquo;{BRAND_PROMPTS[brand] ?? "What product have you always wanted from us?"}&rdquo;
                </p>
            </div>

            <div className="flex-1 min-h-0 relative">
                <div ref={streamRef} className="absolute inset-0 overflow-y-auto no-scrollbar p-4 pb-32">
                    {stream.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}>
                                <MessageSquare size={22} className="text-white" />
                            </motion.div>
                            <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>No pitches yet</p>
                            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>Be the first to share your idea.</p>
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
                                    background: isMine ? "linear-gradient(135deg, #F59E0B, #F97316)" : "rgba(26,23,20,0.9)",
                                    border: isMine ? "none" : `1px solid ${colors.border}`,
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: isMine ? "rgba(255,255,255,0.3)" : colors.bg, color: isMine ? "#fff" : colors.accent, border: isMine ? "none" : `1px solid ${colors.border}` }}>
                                        {isMine ? "M" : anonName(i).charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-semibold" style={{ color: isMine ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}>
                                        {isMine ? "You · Just now" : anonName(i)}
                                    </span>
                                </div>
                                <p className="text-[13px] font-medium leading-relaxed" style={{ color: isMine ? "#fff" : "rgba(255,255,255,0.75)" }}>{text}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 pb-[calc(env(safe-area-inset-bottom)+90px)]" style={{ background: "rgba(13,12,11,0.9)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-2.5 max-w-lg mx-auto">
                    <input
                        value={inputText}
                        onChange={e => setInputText(e.target.value.slice(0, 280))}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        placeholder="Share your idea..."
                        aria-label="Type your pitch"
                        className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", color: "#F5F0EB" }}
                    />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={!inputText.trim()} aria-label="Submit pitch" className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30 shrink-0 shadow-lg" style={{ background: inputText.trim() ? "linear-gradient(135deg, #F59E0B, #F97316)" : "rgba(255,255,255,0.08)" }}>
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

// ── Vote Detail ───────────────────────────────────────────────────────────────
function VoteDetail({ pitch, onBack, onVote }: { pitch: ExtractedPitch; onBack: () => void; onVote: () => void }) {
    const pct = Math.min((pitch.voteCount / pitch.threshold) * 100, 100);
    const hot = pct >= 80;
    const tags = getConceptTags(pitch);

    return (
        <motion.div key="detail" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.25 }} className="flex flex-col h-full max-w-lg mx-auto w-full">
            <div className="px-5 pt-12 pb-3 flex items-center gap-3" style={{ background: "rgba(13,12,11,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={onBack} aria-label="Go back" className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                    <ChevronLeft size={20} style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
                <span className="font-bold text-sm tracking-tight" style={{ color: "#F5F0EB" }}>Pitch Details</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-[120px] space-y-5">
                <div className="rounded-2xl p-5 border" style={{ background: "rgba(26,23,20,0.9)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 border rounded-lg px-2.5 py-1.5" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                            {pitch.brandLogo ? (
                                <img src={pitch.brandLogo} alt={pitch.brandName} className="h-4 brightness-200" />
                            ) : (
                                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>{pitch.brandName}</span>
                            )}
                        </div>
                        {hot && <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}><Flame size={12} /> Almost Greenlit</div>}
                    </div>

                    {/* Brand-colored mockup card */}
                    <div className="rounded-xl p-4 mb-4" style={{ background: `linear-gradient(135deg, ${pitch.brandHue}12, ${pitch.brandHue}05)`, border: `1px solid ${pitch.brandHue}25` }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: pitch.brandHue }}>Design Concept</div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${pitch.brandHue}20`, color: pitch.brandHue, border: `1px solid ${pitch.brandHue}40` }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "#F5F0EB" }}>{pitch.title}</h2>
                    </div>

                    <div className="rounded-xl p-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">Community Brief</div>
                        <p className="text-sm leading-relaxed font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{pitch.summary}</p>
                    </div>
                </div>

                <div className="rounded-2xl border p-5" style={{ background: "rgba(26,23,20,0.9)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Votes to Greenlight</span>
                        <span className="text-xl font-bold tabular-nums" style={{ color: "#C084FC" }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #C084FC, #38BDF8)" }} />
                    </div>
                    <div className="flex justify-between text-[12px] font-mono tracking-wider font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                        <span>{pitch.voteCount.toLocaleString()} votes</span>
                        <span>{pitch.threshold.toLocaleString()} needed</span>
                    </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={onVote} disabled={pitch.userVoted} aria-label={pitch.userVoted ? "Already voted" : "Vote for this concept"} className="w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg" style={{ background: pitch.userVoted ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #C084FC, #38BDF8)", color: pitch.userVoted ? "rgba(255,255,255,0.3)" : "#fff", border: pitch.userVoted ? "1px solid rgba(255,255,255,0.08)" : "none", minHeight: "var(--min-touch)" }}>
                    {pitch.userVoted ? <><CheckCircle2 size={18} /> Voted</> : <><Sparkles size={16} /> Vote For This Concept</>}
                </motion.button>
                <p className="text-[11px] text-center font-medium leading-relaxed px-6" style={{ color: "rgba(255,255,255,0.25)" }}>
                    1 vote per pitch. Threshold met = advance to official pledge campaign.
                </p>
            </div>
        </motion.div>
    );
}
