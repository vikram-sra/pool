"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, Compass, User, PenTool } from "lucide-react";
import type { TabId } from "@/types";

const TABS: { id: TabId; icon: typeof Activity; label: string }[] = [
    { id: "FEED", icon: Activity, label: "Feed" },
    { id: "PITCH", icon: PenTool, label: "Pitch" },
    { id: "ECOSYSTEM", icon: Compass, label: "Ecosystem" },
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
            className={`fixed bottom-0 left-0 right-0 w-full pointer-events-auto transition-all duration-300 ease-out z-50 ${hidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                }`}
        >
            <div className="flex items-end justify-around px-2 pt-3 pb-safe bg-white/85 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
                {TABS.map((tab) => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} onClick={() => { setCurrentTab(tab.id); }} />
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
    return (
        <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-1 py-1 relative z-10 outline-none group">
            <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
            >
                <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                {tab.label}
            </span>
            <AnimatePresence>
                {isActive && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"
                    />
                )}
            </AnimatePresence>
        </button>
    );
}
