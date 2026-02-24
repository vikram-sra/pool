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
    const isFeed = currentTab === "FEED";
    const isPitch = currentTab === "PITCH";
    // Nav background: dark gradient on feed, light on everything else
    const isDark = isFeed;

    return (
        <nav
            className={`w-full pointer-events-auto transition-all duration-500 ease-out ${hidden ? "translate-y-[120%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                }`}
        >
            <div className="relative flex items-end justify-around px-2 pt-1.5 pb-safe overflow-hidden">
                {/* Cross-fade backgrounds */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"
                    animate={{ opacity: isDark ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-0 bg-[#F5F4F0] border-t border-[#1C1C1C]/5 pointer-events-none"
                    animate={{ opacity: isDark ? 0 : 1 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />

                {TABS.slice(0, 2).map(tab => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} isDark={isDark} onClick={() => setCurrentTab(tab.id)} />
                ))}

                {/* Center Pitch Button */}
                <button
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 pointer-events-auto relative z-10"
                    onClick={() => setCurrentTab("PITCH")}
                >
                    <motion.div
                        animate={{ scale: isPitch ? 0.9 : 1, backgroundColor: isPitch ? "#34D399" : "#1C1C1C" }}
                        transition={{ duration: 0.2 }}
                        className="w-12 h-9 rounded-xl flex items-center justify-center shadow-lg"
                    >
                        <Plus size={20} strokeWidth={2.5} className="text-white" />
                    </motion.div>
                    <motion.span
                        animate={{ color: isDark ? "rgba(255,255,255,0.55)" : isPitch ? "#34D399" : "rgba(28,28,28,0.45)" }}
                        transition={{ duration: 0.4 }}
                        className="text-[9px] font-bold"
                    >
                        Pitch
                    </motion.span>
                </button>

                {TABS.slice(2).map(tab => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} isDark={isDark} onClick={() => setCurrentTab(tab.id)} />
                ))}
            </div>
        </nav>
    );
}

function NavButton({ tab, isActive, isDark, onClick }: {
    tab: { id: string; icon: typeof Activity; label: string };
    isActive: boolean;
    isDark: boolean;
    onClick: () => void;
}) {
    const activeColor = isDark ? "rgba(255,255,255,1)" : "rgba(28,28,28,1)";
    const inactiveColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(28,28,28,0.3)";
    const color = isActive ? activeColor : inactiveColor;

    return (
        <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 pointer-events-auto relative z-10">
            <motion.div animate={{ color }} transition={{ duration: 0.4 }}>
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
            </motion.div>
            <motion.span animate={{ color }} transition={{ duration: 0.4 }} className="text-[9px] font-bold">
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
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isDark ? "bg-white" : "bg-[#1C1C1C]"}`}
                    />
                )}
            </AnimatePresence>
        </button>
    );
}
