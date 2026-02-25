"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Vote, Zap, Lock, CheckCircle2, Factory } from "lucide-react";
import { LIFECYCLE_STAGES, LIFECYCLE_LABELS } from "@/constants";
import type { LifecycleStage } from "@/types";

const STAGE_ICONS: Record<string, any> = {
    SPARK: Sparkles,
    REVIEW: Brain,
    VOTING: Vote,
    FUNDING: Zap,
    LOCKED: Lock,
    GREENLIGHT: CheckCircle2,
    PRODUCTION: Factory,
};

interface Props {
    currentStage: LifecycleStage;
    color: string;
    compact?: boolean;
}

export default function LifecycleTracker({ currentStage, color, compact }: Props) {
    const currentIdx = LIFECYCLE_STAGES.indexOf(currentStage);

    if (compact) {
        return (
            <div className="flex items-center gap-0.5">
                {LIFECYCLE_STAGES.map((stage, i) => {
                    const isActive = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                        <div key={stage} className="flex items-center gap-0.5">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.06, type: "spring", stiffness: 400 }}
                                className="relative"
                            >
                                <div
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${isCurrent ? "scale-125" : ""}`}
                                    style={{
                                        backgroundColor: isActive ? color : "rgba(255,255,255,0.2)",
                                        boxShadow: isCurrent ? `0 0 8px ${color}, 0 0 16px ${color}80` : "none",
                                    }}
                                />
                                {isCurrent && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        style={{ border: `1px solid ${color}` }}
                                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                    />
                                )}
                            </motion.div>
                            {i < LIFECYCLE_STAGES.length - 1 && (
                                <div
                                    className="w-2.5 h-[1.5px] rounded-full transition-colors"
                                    style={{ backgroundColor: i < currentIdx ? color : "rgba(255,255,255,0.15)" }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex items-center w-full">
            {LIFECYCLE_STAGES.map((stage, i) => {
                const isActive = i <= currentIdx;
                const isCurrent = i === currentIdx;
                const Icon = STAGE_ICONS[stage];
                return (
                    <div key={stage} className="flex items-center flex-1 last:flex-none">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col items-center gap-1.5"
                        >
                            <div className="relative">
                                {/* Glow ring */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute -inset-1.5 rounded-lg"
                                        style={{ backgroundColor: color + "20" }}
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                                <div
                                    className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 ${isCurrent
                                        ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110"
                                        : isActive
                                            ? "border-white/60"
                                            : "border-white/20 glass-dark"
                                        }`}
                                    style={{
                                        backgroundColor: isActive ? color : "transparent",
                                        boxShadow: isCurrent ? `0 4px 15px ${color}70` : undefined,
                                    }}
                                >
                                    <Icon
                                        size={14}
                                        className={`transition-colors ${isActive ? "text-black" : "text-white/40"}`}
                                        strokeWidth={isCurrent ? 3 : 2}
                                    />
                                </div>
                            </div>
                            <span
                                className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${isCurrent ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" : isActive ? "text-white/70" : "text-white/30"
                                    }`}
                            >
                                {LIFECYCLE_LABELS[stage]}
                            </span>
                        </motion.div>
                        {i < LIFECYCLE_STAGES.length - 1 && (
                            <div className="flex-1 mx-1.5 relative">
                                {/* Background track */}
                                <div className="h-[2px] bg-white/10 rounded-full" />
                                {/* Active fill */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: i < currentIdx ? 1 : 0 }}
                                    transition={{ delay: i * 0.1 + 0.15, duration: 0.4, ease: "easeOut" }}
                                    className="absolute top-0 left-0 right-0 h-[2px] rounded-full origin-left"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
