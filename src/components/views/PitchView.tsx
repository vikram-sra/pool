"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, Send, Flame, Zap, CheckCircle2, X } from "lucide-react";
import { BRANDS } from "@/data/campaigns";

// ── Mock extracted pitches (top-5 per brand, pre-voted) ─────────────────────
interface ExtractedPitch {
    id: string;
    brandName: string;
    brandHue: string;
    title: string;
    summary: string;
    voteCount: number;
    threshold: number;
    userVoted: boolean;
}

const MOCK_PITCHES: ExtractedPitch[] = [
    { id: "p1", brandName: "Nike", brandHue: "#34D399", title: "Jordan 1 Olive Retro", summary: "Bring back the 1985 Olive colorway of the Jordan 1 High in modern materials. Full grain leather, OG box.", voteCount: 4120, threshold: 5000, userVoted: false },
    { id: "p2", brandName: "Sony", brandHue: "#38BDF8", title: "Discman Revival DAP", summary: "Modern hi-res audio DAP in a Discman shell. CD slot is now a 3.5\" OLED display showing waveforms.", voteCount: 3980, threshold: 4000, userVoted: false },
    { id: "p3", brandName: "Leica", brandHue: "#FBBF24", title: "M-Zero Digital", summary: "A digital M-mount body with a single button — no menus, no screen. Exposure by eye. Like a digital film camera.", voteCount: 2870, threshold: 4000, userVoted: false },
    { id: "p4", brandName: "Nike", brandHue: "#34D399", title: "ACG Gaiter Boot V2", summary: "Update the original ACG gaiter boot with trail-ready outsole and recycled upper. Modular gaiters.", voteCount: 2210, threshold: 5000, userVoted: false },
    { id: "p5", brandName: "Dyson", brandHue: "#C084FC", title: "Pure Air Backpack", summary: "Wearable air purifier built into a 20L daypack. Real-time AQI display + filtration for commuters.", voteCount: 1940, threshold: 3000, userVoted: false },
];

// ── Mock brand prompts ───────────────────────────────────────────────────────
const BRAND_PROMPTS: Record<string, string> = {
    Nike: "What retro silhouette or colorway should we bring back next?",
    Sony: "What product from our archive would you buy again if we modernized it?",
    Leica: "What feature-set would make your ultimate minimal film-like camera?",
    Arcteryx: "What harsh environment are we NOT designing for that we should be?",
    "Teenage Eng": "What instrument format should we tackle that no one else has?",
    Braun: "Which forgotten Braun product deserves a faithful modern reissue?",
    Dyson: "What everyday problem are you surprised technology hasn't solved yet?",
    Nintendo: "Which classic IP or console would you back if we did a limited reissue?",
    "Herman Miller": "What does your ideal work-from-home setup actually need?",
};

// ── Mock communal pitch streams ──────────────────────────────────────────────
const SEED_PITCHES: Record<string, string[]> = {
    Nike: [
        "Bring back the Air Max 95 Neon Yellow but in a narrow width option please.",
        "Jordan 1 in canvas, like a summer version, unlined, breathable.",
        "ACG line but for actual city commuting not just trail hiking.",
        "Nike SB with recycled ocean plastics — prove sustainability can look good.",
        "The Dunk in corduroy. You know it's time.",
        "AirForce 1 with a built-in orthotic base. Everyone needs it but nobody says it.",
        "Bring back the Air Rift. Running toe-split sandal. It was ahead of its time.",
        "Nike x Carhartt ACG. They both know how to make workwear.",
    ],
    Sony: [
        "MDR-7506 with Bluetooth. Keep the coiled cable option. Keep the sound signature.",
        "A Trinitron monitor revival. Curved CRT aesthetic with modern LCD panel.",
        "The MZ-N1 MiniDisc player but as a USB-C audio DAC/amp.",
        "PSP go but with Switch-level power and a proper app store.",
        "A new Aibo that's actually affordable and has real AI now.",
        "Walkman NW-A series with longer battery and no proprietary software.",
    ],
    Leica: [
        "Leica M with a built-in light meter display — just the needle, nothing else.",
        "A point-and-shoot with M glass mount but fixed lens at 35mm f2.",
        "Reissue the Leica CL in black paint with modern sensor.",
        "Collaborate with Hasselblad for a medium format digital rangefinder.",
    ],
    Dyson: [
        "Dyson Air Ring: wearable personal cooling ring for the neck in summer.",
        "A silent vacuum that actually works silently. Current ones are loud.",
        "Dyson air purifier integrated into a desk lamp. Stop making them two products.",
        "Battery vacuum but the battery is hot-swappable like a DeWalt.",
        "HEPA-filtered stroller attachment for city parents.",
    ],
};

function getSeedPitches(brand: string): string[] {
    return SEED_PITCHES[brand] ?? [
        "You already make great products — keep the design language consistent.",
        "More colorways in the existing lineup, please.",
        "Sustainable materials without compromising performance.",
    ];
}

// ── Main component ───────────────────────────────────────────────────────────
type Screen = "landing" | "pad" | "detail";

export default function PitchView() {
    const [subTab, setSubTab] = useState<"vote" | "pitch">("vote");
    const [screen, setScreen] = useState<Screen>("landing");
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [pitches, setPitches] = useState<ExtractedPitch[]>(MOCK_PITCHES);
    const [detailPitch, setDetailPitch] = useState<ExtractedPitch | null>(null);

    const goToPad = (brand: string) => {
        setSelectedBrand(brand);
        setScreen("pad");
    };

    const goToDetail = (pitch: ExtractedPitch) => {
        setDetailPitch(pitch);
        setScreen("detail");
    };

    const handleVote = (id: string) => {
        setPitches(prev => prev.map(p =>
            p.id === id && !p.userVoted ? { ...p, voteCount: p.voteCount + 1, userVoted: true } : p
        ));
        setDetailPitch(prev => prev && prev.id === id ? { ...prev, voteCount: prev.voteCount + 1, userVoted: true } : prev);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F5F4F0] flex flex-col overflow-hidden pointer-events-auto"
        >
            <AnimatePresence mode="wait">
                {screen === "landing" && (
                    <LandingScreen
                        key="landing"
                        subTab={subTab}
                        setSubTab={setSubTab}
                        pitches={pitches}
                        onVoteDetail={goToDetail}
                        selectedBrand={selectedBrand}
                        setSelectedBrand={setSelectedBrand}
                        showDropdown={showDropdown}
                        setShowDropdown={setShowDropdown}
                        onGoPad={goToPad}
                    />
                )}
                {screen === "pad" && (
                    <PitchPad
                        key="pad"
                        brand={selectedBrand}
                        onBack={() => setScreen("landing")}
                    />
                )}
                {screen === "detail" && detailPitch && (
                    <VoteDetail
                        key="detail"
                        pitch={detailPitch}
                        onBack={() => setScreen("landing")}
                        onVote={() => handleVote(detailPitch.id)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Screen 1: Landing ────────────────────────────────────────────────────────
function LandingScreen({ subTab, setSubTab, pitches, onVoteDetail, selectedBrand, setSelectedBrand, showDropdown, setShowDropdown, onGoPad }: {
    subTab: "vote" | "pitch";
    setSubTab: (t: "vote" | "pitch") => void;
    pitches: ExtractedPitch[];
    onVoteDetail: (p: ExtractedPitch) => void;
    selectedBrand: string;
    setSelectedBrand: (b: string) => void;
    showDropdown: boolean;
    setShowDropdown: (v: boolean) => void;
    onGoPad: (b: string) => void;
}) {
    return (
        <motion.div
            key="landing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <div className="px-4 pt-12 pb-3">
                <h1 className="text-[22px] font-black uppercase tracking-tighter text-[#1C1C1C]">Pitch</h1>
                <p className="text-[10px] text-[#1C1C1C]/40 font-medium mt-0.5">Tell brands what to make next</p>
            </div>

            {/* Sub-tab toggle */}
            <div className="px-4 mb-4">
                <div className="flex bg-[#1C1C1C]/5 rounded-xl p-1 gap-1">
                    {(["vote", "pitch"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setSubTab(t)}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${subTab === t
                                    ? "bg-[#1C1C1C] text-white shadow-sm"
                                    : "text-[#1C1C1C]/40"
                                }`}
                        >
                            {t === "vote" ? "🗳 Vote" : "💡 Pitch"}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {subTab === "vote" ? (
                    <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-32 space-y-3">
                        <div className="text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/25 mb-3">Top Pitches This Week</div>
                        {pitches.sort((a, b) => b.voteCount - a.voteCount).map((p, i) => {
                            const pct = Math.min((p.voteCount / p.threshold) * 100, 100);
                            const hot = pct >= 80;
                            return (
                                <motion.button
                                    key={p.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onVoteDetail(p)}
                                    className="w-full text-left bg-white rounded-2xl p-4 border border-[#1C1C1C]/5 active:scale-[0.98] transition-transform"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Rank */}
                                        <div className="text-[11px] font-black text-[#1C1C1C]/20 w-4 shrink-0 pt-0.5">
                                            {String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[7px] font-black text-white shrink-0" style={{ backgroundColor: p.brandHue }}>
                                                    {p.brandName[0]}
                                                </div>
                                                <span className="text-[8px] font-bold text-[#1C1C1C]/30 uppercase tracking-wider">{p.brandName}</span>
                                                {hot && (
                                                    <span className="ml-auto flex items-center gap-0.5 bg-[#FF3D00]/10 text-[#FF3D00] text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                                                        <Flame size={7} /> Almost Greenlit
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-black text-[13px] text-[#1C1C1C] leading-tight mb-2">{p.title}</div>
                                            {/* Vertical-style progress bar */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-[#1C1C1C]/6 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: hot ? "#FF3D00" : p.brandHue }}
                                                    />
                                                </div>
                                                <span className="text-[8px] font-bold tabular-nums text-[#1C1C1C]/30">
                                                    {p.voteCount.toLocaleString()} <span className="text-[#1C1C1C]/15">/ {p.threshold.toLocaleString()}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 px-4 pb-32 space-y-5">
                        <div className="text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/25 mb-3">Select a brand & add your idea to the pool</div>

                        {/* Brand selector */}
                        <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/30 mb-1.5">Brand</label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-full flex items-center justify-between bg-white rounded-xl border border-[#1C1C1C]/10 p-3.5 text-left"
                                >
                                    <span className={`text-sm font-semibold ${selectedBrand ? "text-[#1C1C1C]" : "text-[#1C1C1C]/25"}`}>
                                        {selectedBrand || "Choose a brand to pitch to..."}
                                    </span>
                                    <ChevronDown size={16} className={`text-[#1C1C1C]/30 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#1C1C1C]/10 shadow-xl z-20 max-h-52 overflow-y-auto no-scrollbar"
                                        >
                                            {BRANDS.map(b => (
                                                <button
                                                    key={b.name}
                                                    onClick={() => { setSelectedBrand(b.name); setShowDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-[#1C1C1C]/3 transition-colors border-b border-[#1C1C1C]/4 last:border-0"
                                                >
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ backgroundColor: b.hue }}>
                                                        {b.name[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[12px] font-black text-[#1C1C1C]">{b.name}</div>
                                                        <div className="text-[8px] text-[#1C1C1C]/30 truncate">{b.description ?? `${b.campaigns} campaigns`}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Brand prompt preview */}
                        <AnimatePresence>
                            {selectedBrand && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white rounded-xl border border-[#1C1C1C]/8 p-3.5"
                                >
                                    <div className="text-[7px] font-black uppercase tracking-widest text-[#1C1C1C]/25 mb-1">Their Question</div>
                                    <p className="text-[12px] font-semibold text-[#1C1C1C] leading-snug italic">
                                        "{BRAND_PROMPTS[selectedBrand] ?? "What product have you always wanted from us?"}"
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CTA */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            disabled={!selectedBrand}
                            onClick={() => onGoPad(selectedBrand)}
                            className="w-full py-4 bg-[#1C1C1C] text-white rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            <Zap size={14} /> Open Pitch Pad
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Screen 2: Pitch Pad ──────────────────────────────────────────────────────
function PitchPad({ brand, onBack }: { brand: string; onBack: () => void }) {
    const brand_ = BRANDS.find(b => b.name === brand);
    const [stream, setStream] = useState<string[]>(getSeedPitches(brand));
    const [inputText, setInputText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const streamRef = useRef<HTMLDivElement>(null);

    // Simulate other users pitching every 4–8 seconds
    useEffect(() => {
        const seeds = getSeedPitches(brand);
        let idx = 0;
        const interval = setInterval(() => {
            if (idx < seeds.length) {
                setStream(prev => [...prev, seeds[idx % seeds.length]]);
                idx++;
            }
        }, 4000 + Math.random() * 4000);
        return () => clearInterval(interval);
    }, [brand]);

    // Auto-scroll stream to bottom on new pitch
    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.scrollTop = streamRef.current.scrollHeight;
        }
    }, [stream]);

    const handleSubmit = useCallback(() => {
        const text = inputText.trim();
        if (!text) return;
        setStream(prev => [...prev, text]);
        setInputText("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
    }, [inputText]);

    return (
        <motion.div
            key="pad"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <div className="px-4 pt-12 pb-3 flex items-center gap-3 border-b border-[#1C1C1C]/5">
                <button onClick={onBack} className="w-8 h-8 rounded-full bg-[#1C1C1C]/5 flex items-center justify-center">
                    <ChevronLeft size={18} className="text-[#1C1C1C]/60" />
                </button>
                <div className="flex items-center gap-2 min-w-0">
                    {brand_ && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ backgroundColor: brand_.hue }}>
                            {brand_?.name[0]}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-black text-[13px] text-[#1C1C1C] uppercase tracking-tight">{brand} Pitch Pad</div>
                        <div className="text-[8px] text-[#1C1C1C]/30 font-medium">{stream.length} ideas in the pool</div>
                    </div>
                </div>
            </div>

            {/* Brand prompt */}
            <div className="mx-4 mt-3 mb-2 bg-white rounded-xl border border-[#1C1C1C]/8 p-3.5">
                <div className="text-[7px] font-black uppercase tracking-widest text-[#1C1C1C]/25 mb-1">
                    {brand} Asks
                </div>
                <p className="text-[12px] font-semibold text-[#1C1C1C] leading-snug italic">
                    "{BRAND_PROMPTS[brand] ?? "What product have you always wanted from us?"}"
                </p>
            </div>

            {/* The communal pitch stream */}
            <div className="mx-4 mb-2 flex-1 min-h-0 overflow-hidden relative">
                <div className="text-[7px] font-black uppercase tracking-widest text-[#1C1C1C]/20 mb-1.5">The Pool — {stream.length} pitches</div>
                <div
                    ref={streamRef}
                    className="h-full overflow-y-auto no-scrollbar bg-white rounded-xl border border-[#1C1C1C]/5 p-3"
                >
                    {stream.map((text, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className={`text-[11px] leading-relaxed font-medium ${i === stream.length - 1 && submitted
                                    ? "text-[#1C1C1C] bg-[#34D399]/10 rounded px-0.5"
                                    : "text-[#1C1C1C]/60"
                                }`}
                        >
                            {text}
                            {i < stream.length - 1 ? " · " : ""}
                        </motion.span>
                    ))}
                </div>
                {/* Fade top edge */}
                <div className="absolute top-5 left-0 right-0 h-6 bg-gradient-to-b from-[#F5F4F0] to-transparent pointer-events-none rounded-t-xl" />
            </div>

            {/* Sticky input bar */}
            <div className="px-4 pb-32 pt-2 border-t border-[#1C1C1C]/5 bg-[#F5F4F0]">
                <div className="text-[7px] font-black uppercase tracking-widest text-[#1C1C1C]/20 mb-1.5">Add your idea</div>
                <div className="flex gap-2">
                    <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value.slice(0, 280))}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        placeholder="What would you want them to make?"
                        rows={2}
                        className="flex-1 bg-white rounded-xl border border-[#1C1C1C]/10 px-3 py-2.5 text-[11px] font-medium text-[#1C1C1C] placeholder-[#1C1C1C]/15 outline-none focus:border-[#1C1C1C]/20 resize-none leading-relaxed"
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSubmit}
                        disabled={!inputText.trim()}
                        className="w-11 rounded-xl bg-[#1C1C1C] flex items-center justify-center disabled:opacity-20 shrink-0"
                    >
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <CheckCircle2 size={16} className="text-[#34D399]" />
                                </motion.div>
                            ) : (
                                <motion.div key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <Send size={14} className="text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
                <div className="text-right mt-1">
                    <span className="text-[7px] text-[#1C1C1C]/15 font-medium">{inputText.length}/280</span>
                </div>
            </div>
        </motion.div>
    );
}

// ── Screen 3: Vote Detail ────────────────────────────────────────────────────
function VoteDetail({ pitch, onBack, onVote }: { pitch: ExtractedPitch; onBack: () => void; onVote: () => void }) {
    const pct = Math.min((pitch.voteCount / pitch.threshold) * 100, 100);
    const hot = pct >= 80;

    return (
        <motion.div
            key="detail"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col h-full"
        >
            <div className="px-4 pt-12 pb-3 flex items-center gap-3 border-b border-[#1C1C1C]/5">
                <button onClick={onBack} className="w-8 h-8 rounded-full bg-[#1C1C1C]/5 flex items-center justify-center">
                    <ChevronLeft size={18} className="text-[#1C1C1C]/60" />
                </button>
                <span className="font-black text-[13px] text-[#1C1C1C] uppercase tracking-tight">Vote</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-32 space-y-4">
                {/* Brand + urgency */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-black text-white" style={{ backgroundColor: pitch.brandHue }}>
                        {pitch.brandName[0]}
                    </div>
                    <div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/30">{pitch.brandName}</div>
                        {hot && (
                            <div className="flex items-center gap-0.5 text-[8px] font-black text-[#FF3D00]">
                                <Flame size={8} /> Almost Greenlit
                            </div>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-[22px] font-black uppercase tracking-tighter text-[#1C1C1C] leading-tight">{pitch.title}</h2>

                {/* Full pitch */}
                <div className="bg-white rounded-2xl border border-[#1C1C1C]/5 p-4">
                    <div className="text-[7px] font-black uppercase tracking-widest text-[#1C1C1C]/25 mb-2">Community Brief</div>
                    <p className="text-[13px] text-[#1C1C1C]/70 leading-relaxed font-medium">{pitch.summary}</p>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-2xl border border-[#1C1C1C]/5 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#1C1C1C]/25">Votes toward Greenlight</span>
                        <span className="text-[11px] font-black tabular-nums" style={{ color: hot ? "#FF3D00" : pitch.brandHue }}>
                            {Math.round(pct)}%
                        </span>
                    </div>
                    <div className="h-2 bg-[#1C1C1C]/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: hot ? "#FF3D00" : pitch.brandHue }}
                        />
                    </div>
                    <div className="flex justify-between text-[7px] text-[#1C1C1C]/20 font-medium">
                        <span>{pitch.voteCount.toLocaleString()} votes</span>
                        <span>{pitch.threshold.toLocaleString()} to Greenlight</span>
                    </div>
                </div>

                {/* Vote button */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onVote}
                    disabled={pitch.userVoted}
                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 transition-all"
                    style={{
                        backgroundColor: pitch.userVoted ? "rgba(28,28,28,0.05)" : pitch.brandHue,
                        color: pitch.userVoted ? "rgba(28,28,28,0.3)" : "#fff",
                    }}
                >
                    {pitch.userVoted ? (
                        <><CheckCircle2 size={15} /> Voted</>
                    ) : (
                        <>Vote For This</>
                    )}
                </motion.button>

                <p className="text-[8px] text-center text-[#1C1C1C]/20 font-medium leading-relaxed px-4">
                    1 vote per pitch per user. Votes are public and anonymous.
                    When a pitch hits its threshold it advances to a brand pledge campaign.
                </p>
            </div>
        </motion.div>
    );
}
