"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Wand2, Globe2, Waves } from "lucide-react";
import type { TabId } from "@/types";

const TABS: { id: TabId; icon: typeof ArrowUpRight; label: string; special?: boolean }[] = [
    { id: "PITCH", icon: Wand2, label: "Pitch", special: true },
    { id: "FEED", icon: ArrowUpRight, label: "Feed" },
    { id: "ECOSYSTEM", icon: Globe2, label: "Explore" },
    { id: "PROFILE", icon: Waves, label: "My Pool" },
];

interface BottomNavProps {
    currentTab: TabId;
    setCurrentTab: (tab: TabId) => void;
    hidden?: boolean;
}

export default function BottomNav({ currentTab, setCurrentTab, hidden }: BottomNavProps) {
    return (
        <nav
            aria-label="Main navigation"
            className={`fixed bottom-0 left-0 right-0 w-full pointer-events-auto transition-all duration-300 ease-out z-50 ${hidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
        >
            <div
                className="flex items-end justify-around px-3 pt-2 pb-safe"
                style={{
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                }}
            >
                {TABS.map((tab) => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} onClick={() => setCurrentTab(tab.id)} />
                ))}
            </div>
        </nav>
    );
}

function NavButton({ tab, isActive, onClick }: {
    tab: (typeof TABS)[number];
    isActive: boolean;
    onClick: () => void;
}) {
    // Special gradient orb for Pitch
    if (tab.special) {
        return (
            <button
                onClick={onClick}
                aria-label="Pitch a new idea"
                aria-current={isActive ? "page" : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 relative z-10 outline-none group"
                style={{ minHeight: 52 }}
            >
                <motion.div
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative"
                >
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border"
                        style={{
                            background: isActive ? "#FFFFFF" : "rgba(0,0,0,0.03)",
                            borderColor: isActive ? "rgba(79,70,229,0.3)" : "rgba(0,0,0,0.05)",
                            boxShadow: isActive ? "0 4px 12px rgba(79,70,229,0.15)" : "none",
                        }}
                    >
                        <Wand2 size={24} strokeWidth={2.5} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                    </div>
                </motion.div>
                <span
                    className={`text-[10px] leading-none tracking-tight mt-1 ${isActive ? "font-bold text-indigo-600" : "font-bold text-gray-400"}`}
                >
                    {tab.label}
                </span>
            </button>
        );
    }

    // Standard 2D icon tabs
    return (
        <button
            onClick={onClick}
            aria-label={`Navigate to ${tab.label}`}
            aria-current={isActive ? "page" : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 relative z-10 outline-none group"
            style={{ minHeight: 52 }}
        >
            <motion.div
                animate={{ scale: isActive ? 1.05 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-500 transition-colors"}
            >
                <tab.icon size={26} strokeWidth={isActive ? 2.5 : 2.0} />
            </motion.div>
            <span className={`text-[11px] leading-none tracking-tight ${isActive ? "font-bold text-gray-900" : "font-bold text-gray-400"}`}>
                {tab.label}
            </span>
            <AnimatePresence>
                {isActive && (
                    <motion.span
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-gray-900"
                    />
                )}
            </AnimatePresence>
        </button>
    );
}
