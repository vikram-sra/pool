"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, CloudLightning, Compass, User, Plus } from "lucide-react";
import type { TabId } from "@/types";

const TABS: { id: TabId; icon: typeof Activity; label: string }[] = [
    { id: "FEED", icon: Activity, label: "Feed" },
    { id: "TRENDS", icon: CloudLightning, label: "Trends" },
    { id: "BRANDS", icon: Compass, label: "Brands" },
    { id: "PROFILE", icon: User, label: "Me" },
];

interface BottomNavProps {
    currentTab: TabId;
    setCurrentTab: (tab: TabId) => void;
    hidden?: boolean;
}

export default function BottomNav({ currentTab, setCurrentTab, hidden }: BottomNavProps) {
    const isPitch = currentTab === "PITCH";

    return (
        <nav
            className={`w-full pointer-events-auto transition-all duration-500 ease-out ${hidden ? "translate-y-[120%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                }`}
        >
            <div className="relative flex items-end justify-around px-2 pt-2 pb-safe overflow-hidden glass-heavy border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/80 before:to-transparent before:pointer-events-none">

                {TABS.slice(0, 2).map(tab => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} onClick={() => setCurrentTab(tab.id)} />
                ))}

                {/* Center Pitch Button */}
                <button
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-1 pointer-events-auto relative z-10 group"
                    onClick={() => setCurrentTab("PITCH")}
                >
                    <motion.div
                        animate={{ scale: isPitch ? 0.95 : 1 }}
                        transition={{ duration: 0.2 }}
                        className={`w-14 h-10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] border border-white/20 transition-all ${isPitch ? "bg-white text-black" : "bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-pink)] text-white"}`}
                    >
                        <Plus size={22} strokeWidth={isPitch ? 3 : 2.5} />
                    </motion.div>
                    <motion.span
                        animate={{ color: isPitch ? "var(--neon-cyan)" : "rgba(255,255,255,0.6)" }}
                        transition={{ duration: 0.4 }}
                        className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
                    >
                        Pitch
                    </motion.span>
                </button>

                {TABS.slice(2).map(tab => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} onClick={() => setCurrentTab(tab.id)} />
                ))}
            </div>
        </nav>
    );
}

function NavButton({ tab, isActive, onClick }: {
    tab: { id: string; icon: typeof Activity; label: string };
    isActive: boolean;
    onClick: () => void;
}) {
    const activeColor = "rgba(255,255,255,1)";
    const inactiveColor = "rgba(255,255,255,0.3)";
    const color = isActive ? activeColor : inactiveColor;

    return (
        <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-1 py-2 pointer-events-auto relative z-10">
            <motion.div animate={{ color }} transition={{ duration: 0.4 }}>
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""} />
            </motion.div>
            <motion.span animate={{ color }} transition={{ duration: 0.4 }} className="text-[9px] font-bold uppercase tracking-widest">
                {tab.label}
            </motion.span>
            <AnimatePresence>
                {isActive && (
                    <motion.span
                        key="dot"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_8px_var(--neon-cyan)]"
                    />
                )}
            </AnimatePresence>
        </button>
    );
}
