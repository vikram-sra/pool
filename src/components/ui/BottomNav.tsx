"use client";

import { motion } from "framer-motion";
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
    onPitch?: () => void;
}

export default function BottomNav({ currentTab, setCurrentTab, hidden, onPitch }: BottomNavProps) {
    const isFeed = currentTab === "FEED";

    return (
        <nav
            className={`w-full pointer-events-auto transition-all duration-500 ease-out ${hidden ? "translate-y-[120%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                }`}
        >
            <div className={`flex items-end justify-around px-2 pt-1.5 pb-safe ${isFeed
                    ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                    : "bg-[#F5F4F0] border-t border-[#1C1C1C]/5"
                }`}>
                {TABS.slice(0, 2).map((tab) => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} isFeed={isFeed} onClick={() => setCurrentTab(tab.id)} />
                ))}

                {/* Center Pitch Button */}
                <button className="flex flex-col items-center gap-0.5 py-1.5 pointer-events-auto" onClick={onPitch}>
                    <div className="w-10 h-7 rounded-lg bg-[#1C1C1C] flex items-center justify-center shadow-md active:scale-90 transition-transform">
                        <Plus size={18} strokeWidth={2.5} className="text-white" />
                    </div>
                    <span className={`text-[8px] font-bold ${isFeed ? "text-white/50" : "text-[#1C1C1C]/40"}`}>Pitch</span>
                </button>

                {TABS.slice(2).map((tab) => (
                    <NavButton key={tab.id} tab={tab} isActive={currentTab === tab.id} isFeed={isFeed} onClick={() => setCurrentTab(tab.id)} />
                ))}
            </div>
        </nav>
    );
}

function NavButton({ tab, isActive, isFeed, onClick }: {
    tab: { id: string; icon: typeof Activity; label: string };
    isActive: boolean;
    isFeed: boolean;
    onClick: () => void;
}) {
    const color = isFeed
        ? isActive ? "text-white" : "text-white/35"
        : isActive ? "text-[#1C1C1C]" : "text-[#1C1C1C]/25";

    return (
        <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 pointer-events-auto">
            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className={`transition-colors ${color}`} />
            <span className={`text-[8px] font-bold transition-colors ${color}`}>{tab.label}</span>
        </button>
    );
}
