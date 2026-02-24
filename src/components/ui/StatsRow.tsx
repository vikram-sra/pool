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
                        className="absolute -inset-1.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                        style={{ backgroundColor: stat.color }}
                    />

                    <div className={`relative glass-dark border border-white/5 rounded-2xl p-4 md:p-5 overflow-hidden group-hover:border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all duration-300`}>
                        {/* Gradient accent */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40`} />

                        {/* Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: stat.color, color: stat.color }} />

                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg glass flex items-center justify-center border border-white/5 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: stat.color + '10', color: stat.color }}>
                                    <stat.icon size={14} style={{ color: stat.color }} className="drop-shadow-[0_0_5px_currentColor]" />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/50">
                                    {stat.label}
                                </span>
                            </div>
                            <div className="text-3xl md:text-4xl font-black text-white font-mono drop-shadow-[0_0_10px_currentColor]" style={{ color: stat.color }}>
                                <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.unit} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
