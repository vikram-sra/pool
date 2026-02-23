"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Leaf, Users, CheckCircle2 } from "lucide-react";
import { GLOBAL_STATS } from "@/data/campaigns";

function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let frame: number;
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(eased * target));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target]);
    return <span className="tabular-nums">{prefix}{count.toLocaleString()}{suffix}</span>;
}

const stats = [
    { label: "Total Pledged", value: 18400000, display: "$18.4M", prefix: "$", suffix: "", target: 18.4, unit: "M", icon: DollarSign, color: "#34D399", gradient: "from-[#34D399]/10 to-transparent" },
    { label: "Greenlighted", value: 24, display: "24", prefix: "", suffix: "", target: 24, unit: "", icon: CheckCircle2, color: "#38BDF8", gradient: "from-[#38BDF8]/10 to-transparent" },
    { label: "Waste Saved", value: 12, display: "12.8T", prefix: "", suffix: " Tons", target: 12, unit: " Tons", icon: Leaf, color: "#A3E635", gradient: "from-[#A3E635]/10 to-transparent" },
    { label: "Active Squads", value: 342, display: "342", prefix: "", suffix: "", target: 342, unit: "", icon: Users, color: "#C084FC", gradient: "from-[#C084FC]/10 to-transparent" },
];

export default function StatsRow() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                    className="group relative"
                >
                    {/* Hover glow */}
                    <div
                        className="absolute -inset-1 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                        style={{ backgroundColor: stat.color }}
                    />

                    <div className={`relative glass border-2 border-[#1C1C1C]/10 rounded-xl p-4 md:p-5 overflow-hidden group-hover:border-[#1C1C1C]/20 transition-all duration-300`}>
                        {/* Gradient accent */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60`} />

                        {/* Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: stat.color }} />

                        <div className="relative">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                                    <stat.icon size={12} style={{ color: stat.color }} />
                                </div>
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#1C1C1C]/40">
                                    {stat.label}
                                </span>
                            </div>
                            <div className="text-2xl md:text-3xl font-black text-[#1C1C1C]">
                                <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.unit} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
