"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, Send, Flame, Zap, CheckCircle2, Target } from "lucide-react";
import { BRANDS } from "@/data/campaigns";

// ── Mock extracted pitches (top-5 per brand, pre-voted) ─────────────────────
interface ExtractedPitch {
    id: string;
    brandName: string;
    brandHue: string;
    brandLogo?: string;
    title: string;
    summary: string;
    voteCount: number;
    threshold: number;
    userVoted: boolean;
}

const MOCK_PITCHES: ExtractedPitch[] = [
    { id: "p1", brandName: "Nike", brandHue: "#FF6B2C", brandLogo: "/brands/nike_logo_1772059075484.png", title: "Jordan 1 Olive Retro", summary: "Bring back the 1985 Olive colorway of the Jordan 1 High in modern materials. Full grain leather, OG box.", voteCount: 4120, threshold: 5000, userVoted: false },
    { id: "p2", brandName: "Sony", brandHue: "#38BDF8", title: "Discman Revival DAP", summary: "Modern hi-res audio DAP in a Discman shell. CD slot is now a 3.5\" OLED display showing waveforms.", voteCount: 3980, threshold: 4000, userVoted: false },
    { id: "p3", brandName: "Leica", brandHue: "#FBBF24", title: "M-Zero Digital", summary: "A digital M-mount body with a single button — no menus, no screen. Exposure by eye. Like a digital film camera.", voteCount: 2870, threshold: 4000, userVoted: false },
    { id: "p4", brandName: "Dyson", brandHue: "#C084FC", brandLogo: "/brands/dyson_logo_1772059346895.png", title: "Pure Air Backpack", summary: "Wearable air purifier built into a 20L daypack. Real-time AQI display + filtration for commuters.", voteCount: 1940, threshold: 3000, userVoted: false },
    { id: "p5", brandName: "Teenage Eng", brandHue: "#111111", brandLogo: "/brands/teenage_eng_logo_1772059155534.png", title: "OP-XY Modular Synth", summary: "A modular, snap-together series of synths that magnetically click like lego blocks to form a master sequencer.", voteCount: 1240, threshold: 2000, userVoted: false },
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
    const [subTab, setSubTab] = useState<"vote" | "pitch">("pitch");
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
            className="absolute inset-0 bg-gray-50 flex flex-col overflow-hidden pointer-events-auto z-10"
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
            className="flex flex-col h-full max-w-lg mx-auto w-full border-x border-gray-100 bg-white"
        >
            {/* Header */}
            <div className="px-6 pt-12 pb-4 border-b border-gray-100 bg-white z-10">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-1">Pitch</h1>
                <p className="text-xs font-semibold text-gray-400">Tell brands what to make next.</p>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1 border border-gray-200 shadow-inner mt-6">
                    {(["vote", "pitch"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setSubTab(t)}
                            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${subTab === t
                                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {t === "vote" ? "🗳 Community Votes" : "💡 Pitch an Idea"}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {subTab === "vote" ? (
                    <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-[120px] bg-gray-50 flex flex-col gap-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Top Pitches This Week</div>
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
                                    className="w-full text-left bg-white rounded-2xl p-5 border border-gray-200 active:scale-[0.98] transition-all hover:shadow-md hover:border-gray-300 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-3">
                                                {p.brandLogo ? (
                                                    <img src={p.brandLogo} alt={p.brandName} className="h-4 object-contain mix-blend-multiply opacity-60 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ backgroundColor: p.brandHue }}>
                                                        {p.brandName[0]}
                                                    </div>
                                                )}
                                                {!p.brandLogo && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.brandName}</span>}
                                                {hot && (
                                                    <span className="ml-auto flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                                                        <Flame size={10} /> Hot
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-black text-lg text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{p.title}</div>
                                            <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">{p.summary}</p>

                                            {/* Segmented HUD progress bar */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 flex gap-[2px] h-[6px]">
                                                    {Array.from({ length: 15 }).map((_, idx) => {
                                                        const threshold = (idx / 15) * 100;
                                                        const isFilled = pct >= threshold;
                                                        return (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: isFilled ? 1 : 0.15 }}
                                                                transition={{ duration: 0.3, delay: (i * 0.05) + (idx * 0.02) }}
                                                                className="h-full flex-1 rounded-[1px]"
                                                                style={{ backgroundColor: isFilled ? (hot ? "#DC2626" : "#111") : "#9CA3AF" }}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                                <span className="text-[10px] font-mono font-bold tracking-widest tabular-nums text-gray-900">
                                                    {Math.round(pct)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 px-4 md:px-6 pt-6 pb-[120px] bg-[#F9FAFB] flex flex-col gap-6">

                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Target size={12} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Brand</div>
                            </div>

                            {/* Brand selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-full flex items-center justify-between bg-gray-50 rounded-2xl border border-gray-200 p-4 text-left shadow-inner hover:bg-gray-100 transition-colors group"
                                >
                                    <span className={`text-sm font-black ${selectedBrand ? "text-gray-900" : "text-gray-400"}`}>
                                        {selectedBrand || "Choose a brand to pitch to..."}
                                    </span>
                                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : "group-hover:text-gray-600"}`} />
                                </button>
                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-30 max-h-64 overflow-y-auto no-scrollbar"
                                        >
                                            {BRANDS.map(b => (
                                                <button
                                                    key={b.name}
                                                    onClick={() => { setSelectedBrand(b.name); setShowDropdown(false); }}
                                                    className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center p-2 bg-white border border-gray-100 shrink-0 shadow-sm">
                                                        {b.brandLogo ? (
                                                            <img src={b.brandLogo} alt={b.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                        ) : (
                                                            <span className="text-sm font-black text-gray-900">{b.name[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-black text-gray-900">{b.name}</div>
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
                                    initial={{ opacity: 0, y: 8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white rounded-3xl border border-blue-100 p-6 mt-2 shadow-[0_2px_15px_rgba(59,130,246,0.05)] overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <div className="text-[9px] font-black uppercase tracking-widest text-blue-600">Official Brand Request</div>
                                    </div>
                                    <p className="text-sm md:text-base font-bold text-gray-900 leading-relaxed italic">
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
                            className="w-full py-5 mt-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                        >
                            <Zap size={16} /> Open Pitch Stream
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
            className="flex flex-col h-full max-w-lg mx-auto w-full border-x border-gray-100 bg-gray-50"
        >
            {/* Header */}
            <div className="px-5 pt-12 pb-4 flex items-center gap-4 bg-white border-b border-gray-100 z-10 shrink-0 shadow-sm">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors">
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex items-center gap-3 min-w-0">
                    {brand_ && (
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 p-1.5 flex items-center justify-center shrink-0">
                            {brand_.brandLogo ? (
                                <img src={brand_.brandLogo} alt={brand_.name} className="w-full h-full object-contain mix-blend-multiply" />
                            ) : (
                                <span className="text-sm font-black text-gray-900">{brand_.name[0]}</span>
                            )}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-black text-sm text-gray-900 uppercase tracking-tight">{brand} Stream</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stream.length} Pitches Live</div>
                    </div>
                </div>
            </div>

            {/* Brand prompt */}
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 shrink-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">
                    Live Prompt
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug italic">
                    "{BRAND_PROMPTS[brand] ?? "What product have you always wanted from us?"}"
                </p>
            </div>

            {/* The communal pitch stream */}
            <div className="flex-1 min-h-0 relative bg-gray-50/50">
                <div
                    ref={streamRef}
                    className="absolute inset-0 overflow-y-auto no-scrollbar p-5 pb-32"
                >
                    {stream.map((text, i) => {
                        const isMine = i === stream.length - 1 && submitted;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`mb-5 max-w-[90%] p-5 rounded-3xl border shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative ${isMine
                                    ? "bg-gray-900 border-gray-800 text-white ml-auto rounded-br-sm shadow-md"
                                    : "bg-white border-gray-100 text-gray-900 hover:border-gray-300 transition-all rounded-bl-sm"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black tracking-widest ${isMine ? "bg-white text-black" : "bg-blue-50 text-blue-600"}`}>
                                        {isMine ? "ME" : "UI"}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isMine ? "text-gray-400" : "text-gray-400"}`}>
                                        {isMine ? "Just now" : "Live Stream"}
                                    </span>
                                </div>
                                <p className={`text-[13px] font-semibold leading-relaxed ${isMine ? "text-gray-100" : "text-gray-700"}`}>{text}</p>
                            </motion.div>
                        )
                    })}
                </div>
                {/* Top fade gradient */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />
            </div>

            {/* Sticky input bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-[calc(env(safe-area-inset-bottom)+90px)]">
                <div className="flex gap-3 relative max-w-lg mx-auto">
                    <input
                        value={inputText}
                        onChange={e => setInputText(e.target.value.slice(0, 280))}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        placeholder="Add your concept..."
                        className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-inner"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={!inputText.trim()}
                        className="w-14 rounded-2xl bg-black flex items-center justify-center disabled:opacity-30 disabled:bg-gray-400 shrink-0 shadow-sm"
                    >
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <CheckCircle2 size={20} className="text-white" />
                                </motion.div>
                            ) : (
                                <motion.div key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <Send size={18} className="text-white ml-1" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
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
            className="flex flex-col h-full max-w-lg mx-auto w-full border-x border-gray-100 bg-gray-50"
        >
            <div className="px-5 pt-12 pb-4 flex items-center gap-4 bg-white border-b border-gray-100">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors">
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <span className="font-black text-sm text-gray-900 uppercase tracking-tight">Inspect Pitch</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-gray-50 pb-[120px] space-y-6">

                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    {/* Brand + urgency */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3 shadow-sm border border-gray-100 rounded-xl px-3 py-1.5 object-contain bg-gray-50">
                            {pitch.brandLogo ? (
                                <img src={pitch.brandLogo} alt={pitch.brandName} className="h-5 mix-blend-multiply" />
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{pitch.brandName}</span>
                            )}
                        </div>
                        {hot && (
                            <div className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                                <Flame size={12} /> Almost Greenlit
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 leading-tight mb-5">{pitch.title}</h2>

                    {/* Full pitch */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Community Brief</div>
                        <p className="text-sm text-gray-700 leading-relaxed font-semibold">{pitch.summary}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Votes to Greenlight</span>
                        <span className="text-xl font-black tabular-nums text-gray-900">
                            {Math.round(pct)}%
                        </span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-black rounded-full" />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono tracking-widest font-bold text-gray-400">
                        <span>{pitch.voteCount.toLocaleString()} votes</span>
                        <span>{pitch.threshold.toLocaleString()} needed</span>
                    </div>
                </div>

                {/* Vote button */}
                <div className="mt-8">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onVote}
                        disabled={pitch.userVoted}
                        className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-md active:shadow-none"
                        style={{
                            backgroundColor: pitch.userVoted ? "#F3F4F6" : "#111",
                            color: pitch.userVoted ? "#9CA3AF" : "#fff",
                            border: pitch.userVoted ? "1px solid #E5E7EB" : "1px solid #000"
                        }}
                    >
                        {pitch.userVoted ? (
                            <><CheckCircle2 size={18} /> Voted ✅</>
                        ) : (
                            <>Vote For This Concept</>
                        )}
                    </motion.button>

                    <p className="text-[10px] text-center text-gray-400 font-semibold leading-relaxed px-6 mt-6 uppercase tracking-widest">
                        1 vote per pitch. Votes are public.
                        Threshold met = advance to official pledge campaign.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
