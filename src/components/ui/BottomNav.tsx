"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Home, Globe, User } from "lucide-react";
import { useState, useCallback } from "react";
import type { TabId } from "@/types";

/* ─────────────────────────────────────────────────────────────
   Tab definitions — icon + per-tab accent
───────────────────────────────────────────────────────────── */
const TABS: {
    id: TabId;
    icon: typeof Megaphone;
    label: string;
    color: string;
    special?: boolean;
}[] = [
    { id: "PITCH",     icon: Megaphone, label: "Pitch",   color: "#6366F1", special: true },
    { id: "FEED",      icon: Home,      label: "Feed",    color: "#F97316" },
    { id: "ECOSYSTEM", icon: Globe,     label: "Explore", color: "#0EA5E9" },
    { id: "PROFILE",   icon: User,      label: "My Pool", color: "#10B981" },
];

const PILL_SPRING = { type: "spring", stiffness: 460, damping: 38, mass: 0.9 } as const;

/* ─────────────────────────────────────────────────────────────
   Apple-glass island surface
───────────────────────────────────────────────────────────── */
const ISLAND_STYLE: React.CSSProperties = {
    background:             "rgba(250,250,252,0.82)",
    backdropFilter:         "blur(28px) saturate(180%) brightness(106%)",
    WebkitBackdropFilter:   "blur(28px) saturate(180%) brightness(106%)",
    border:                 "0.5px solid rgba(255,255,255,0.65)",
    boxShadow: [
        "inset 0 0.5px 0 rgba(255,255,255,0.92)",
        "inset 0 -0.5px 0 rgba(0,0,0,0.04)",
        "0 0 0 0.5px rgba(0,0,0,0.06)",
        "0 8px 28px rgba(0,0,0,0.10)",
        "0 2px 6px rgba(0,0,0,0.05)",
    ].join(", "),
};

/* ─────────────────────────────────────────────────────────────
   Main nav
───────────────────────────────────────────────────────────── */
interface BottomNavProps {
    currentTab: TabId;
    setCurrentTab: (tab: TabId) => void;
    hidden?: boolean;
}

export default function BottomNav({ currentTab, setCurrentTab, hidden }: BottomNavProps) {
    return (
        <nav
            aria-label="Main navigation"
            className={`fixed bottom-0 left-0 right-0 z-50 pointer-events-auto transition-transform duration-300 ease-out ${
                hidden ? "translate-y-full" : "translate-y-0"
            }`}
        >
            <div className="px-3 pb-safe pt-1.5">
                <div className="flex items-center rounded-[30px]" style={ISLAND_STYLE}>
                    {TABS.map((tab) => (
                        <NavButton
                            key={tab.id}
                            tab={tab}
                            isActive={currentTab === tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
}

/* ─────────────────────────────────────────────────────────────
   Tab button
   Active  → sliding pill with icon + label (horizontal)
   Inactive → bare icon, centred
───────────────────────────────────────────────────────────── */
function NavButton({
    tab,
    isActive,
    onClick,
}: {
    tab: (typeof TABS)[number];
    isActive: boolean;
    onClick: () => void;
}) {
    const [rippleKey, setRippleKey]   = useState(0);
    const [showRipple, setShowRipple] = useState(false);

    const handleClick = useCallback(() => {
        setRippleKey((k) => k + 1);
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 450);
        onClick();
    }, [onClick]);

    return (
        <button
            onClick={handleClick}
            aria-label={tab.special ? "Pitch a new idea" : `Navigate to ${tab.label}`}
            aria-current={isActive ? "page" : undefined}
            className="relative flex-1 flex items-center justify-center py-3.5 outline-none overflow-hidden"
            style={{ minHeight: 60 }}
        >
            {/* Tap ripple */}
            {showRipple && (
                <span
                    key={rippleKey}
                    className="nav-tap-ripple absolute inset-0 m-auto w-8 h-8 rounded-full pointer-events-none"
                    style={{ backgroundColor: tab.color + "20" }}
                />
            )}

            {/*
             * AnimatePresence ensures the pill has a proper exit animation
             * before unmounting, preventing the layout-projection ghost box
             * that Framer Motion leaves when layoutId elements vanish instantly.
             */}
            <AnimatePresence initial={false} mode="popLayout">
                {isActive ? (
                    /*
                     * ── ACTIVE: horizontal pill sliding via layoutId ──
                     */
                    <motion.div
                        key="pill"
                        layoutId="nav-pill"
                        className="flex items-center gap-[7px] px-[14px] py-[9px] rounded-[20px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={PILL_SPRING}
                        style={{
                            background: "rgba(255,255,255,0.92)",
                            boxShadow: [
                                "0 1px 10px rgba(0,0,0,0.10)",
                                "0 0.5px 2px rgba(0,0,0,0.07)",
                                "inset 0 0.5px 0 rgba(255,255,255,1)",
                            ].join(", "),
                            color: tab.color,
                        }}
                    >
                        <tab.icon size={16} strokeWidth={2.4} />

                        {/* Label fades + slides in after the pill lands */}
                        <motion.span
                            key={tab.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.07, duration: 0.16, ease: "easeOut" }}
                            style={{
                                fontSize:      11,
                                fontWeight:    700,
                                letterSpacing: "-0.01em",
                                lineHeight:    1,
                            }}
                        >
                            {tab.label}
                        </motion.span>
                    </motion.div>
                ) : (
                    /*
                     * ── INACTIVE: plain icon — no motion wrapper needed,
                     * avoiding any stale layout-projection artifacts.
                     */
                    <motion.div
                        key="icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        style={{ color: "rgba(60,60,67,0.38)" }}
                    >
                        <tab.icon size={22} strokeWidth={1.55} />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
