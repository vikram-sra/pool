"use client";

import { motion } from "framer-motion";
import { Lock, Zap, Activity, Award, Package, TrendingUp, CheckCircle2, Shield } from "lucide-react";
import { USER_PROFILE } from "@/data/campaigns";

// Contribution metadata per pledge title
const PLEDGE_META: Record<string, { goal: string; contribution: number }> = {
    'Retro 95 Neon':  { goal: '$20k', contribution: 2.1 },
    'Walkman Cyber':  { goal: '$80k', contribution: 4.8 },
    'Ghost Edition':  { goal: '$180k', contribution: 12.4 },
    'Ear (Zero)':     { goal: '$15k', contribution: 0.8 },
};

const STATUS_CONFIG = {
    'Locked':  { label: 'LOCKED',    bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  text: '#F59E0B', Icon: Lock },
    'Escrow':  { label: 'IN ESCROW', bg: 'rgba(56,189,248,0.15)',  border: 'rgba(56,189,248,0.3)',  text: '#38BDF8', Icon: Activity },
    'Greenlit':{ label: 'GREENLIT',  bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#22C55E', Icon: Zap },
};

export default function ProfileView() {
    const user = USER_PROFILE;

    const totalPledgedNum = 1025; // $100 + $350 + $500 + $75
    const greenlitCount = user.pledges.filter(p => p.status === 'Greenlit').length;
    const inPipelineCount = user.pledges.filter(p => p.status === 'Locked' || p.status === 'Greenlit').length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full overflow-y-auto pb-[90px] no-scrollbar pt-safe pointer-events-auto z-10"
            style={{ background: '#0D0C0B' }}
        >
            <div className="max-w-4xl mx-auto px-4 md:px-8 pt-3 pb-4">
                <div className="space-y-6">

                    {/* ── Impact Header ── */}
                    <header className="pt-2">
                        <div className="flex items-start justify-between mb-1">
                            <h1
                                className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
                                style={{ color: '#F5F0EB' }}
                            >
                                Demand<br />Portfolio
                            </h1>
                            <div className="flex flex-col items-end gap-1.5 pt-1">
                                <span
                                    className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase"
                                    style={{
                                        background: 'rgba(245,158,11,0.12)',
                                        color: '#F59E0B',
                                        border: '1px solid rgba(245,158,11,0.25)',
                                    }}
                                >
                                    {user.tier}
                                </span>
                                <span className="text-[11px] font-medium" style={{ color: 'rgba(245,240,235,0.4)' }}>
                                    {user.title}
                                </span>
                            </div>
                        </div>
                        <p className="text-base font-medium mt-3 leading-relaxed" style={{ color: 'rgba(245,240,235,0.6)' }}>
                            You&apos;ve helped bring{' '}
                            <span style={{ color: '#22C55E', fontWeight: 700 }}>
                                {greenlitCount} product{greenlitCount !== 1 ? 's' : ''}
                            </span>{' '}
                            into existence
                        </p>
                    </header>

                    {/* ── Identity Row ── */}
                    <div
                        className="flex items-center gap-4 rounded-2xl p-4"
                        style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                            style={{ background: '#231F1B', color: '#F5F0EB', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            {user.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-base" style={{ color: '#F5F0EB' }}>{user.name}</div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {user.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'rgba(245,240,235,0.4)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] flex-shrink-0" style={{ color: 'rgba(245,240,235,0.35)' }}>
                            <Shield size={12} />
                            <span>Verified</span>
                        </div>
                    </div>

                    {/* ── Co-Creation Stats Row ── */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Total Pledged',  value: `$${totalPledgedNum.toLocaleString()}`, icon: TrendingUp,   color: '#F59E0B', desc: 'across all campaigns' },
                            { label: 'Escrowed',       value: user.assetsEscrowed,                    icon: Lock,         color: '#38BDF8', desc: 'safely held in escrow' },
                            { label: 'In Pipeline',    value: `${inPipelineCount}`,                   icon: Package,      color: '#22C55E', desc: 'products in production' },
                            { label: 'Co-Created',     value: `${greenlitCount}`,                     icon: CheckCircle2, color: '#A78BFA', desc: 'greenlit by community' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="rounded-xl p-4"
                                style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <stat.icon size={13} style={{ color: stat.color }} />
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider"
                                        style={{ color: 'rgba(245,240,235,0.4)' }}
                                    >
                                        {stat.label}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>{stat.value}</div>
                                <div className="text-[11px] mt-0.5" style={{ color: 'rgba(245,240,235,0.35)' }}>{stat.desc}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* ── Portfolio Grid (pledge impact cards) ── */}
                    <div>
                        <h3
                            className="text-base font-bold tracking-tight mb-1 flex items-center gap-2"
                            style={{ color: '#F5F0EB' }}
                        >
                            <Lock size={15} style={{ color: 'rgba(245,240,235,0.4)' }} />
                            Active Allocations
                        </h3>
                        <p className="text-[12px] mb-4" style={{ color: 'rgba(245,240,235,0.4)' }}>
                            Products you&apos;ve co-created — funds held in escrow until the goal is met.
                        </p>
                        <div className="space-y-3">
                            {user.pledges.map((pledge, idx) => {
                                const meta = PLEDGE_META[pledge.title] ?? { goal: '$10k', contribution: 1.0 };
                                const cfg = STATUS_CONFIG[pledge.status];
                                const { Icon: StatusIcon } = cfg;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.07 }}
                                        className="rounded-2xl overflow-hidden"
                                        style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.07)' }}
                                    >
                                        {/* Brand color accent bar */}
                                        <div className="h-1 w-full" style={{ background: pledge.color }} />

                                        <div className="p-4">
                                            {/* Title + amount row */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0 pr-3">
                                                    <div
                                                        className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                                        style={{ color: 'rgba(245,240,235,0.4)' }}
                                                    >
                                                        {pledge.brand}
                                                    </div>
                                                    <div className="font-bold text-base leading-tight" style={{ color: '#F5F0EB' }}>
                                                        {pledge.title}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-xl font-bold" style={{ color: '#F5F0EB' }}>{pledge.amount}</div>
                                                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>pledged</div>
                                                </div>
                                            </div>

                                            {/* Status badge + contribution % */}
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                    style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                                                >
                                                    <StatusIcon size={10} />
                                                    {cfg.label}
                                                </span>
                                                <span
                                                    className="text-[11px] font-medium"
                                                    style={{ color: 'rgba(245,240,235,0.45)' }}
                                                >
                                                    {meta.contribution}% of {meta.goal} goal
                                                </span>
                                            </div>

                                            {/* Contribution progress bar */}
                                            <div
                                                className="mt-3 h-1.5 rounded-full overflow-hidden"
                                                style={{ background: 'rgba(255,255,255,0.06)' }}
                                            >
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(meta.contribution * 5, 100)}%` }}
                                                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                                                    className="h-full rounded-full"
                                                    style={{ background: pledge.color }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Achievements ── */}
                    <div className="pb-8">
                        <h3
                            className="text-base font-bold tracking-tight mb-1 flex items-center gap-2"
                            style={{ color: '#F5F0EB' }}
                        >
                            <Award size={15} style={{ color: 'rgba(245,240,235,0.4)' }} />
                            Achievements
                        </h3>
                        <p className="text-[12px] mb-4" style={{ color: 'rgba(245,240,235,0.4)' }}>
                            Badges earned through your co-creation activity.
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {[
                                { emoji: '🔥', label: 'Early Backer',   unlocked: true },
                                { emoji: '💎', label: 'Diamond Hands',  unlocked: true },
                                { emoji: '🚀', label: 'Launch Day',     unlocked: true },
                                { emoji: '👁️', label: 'Trend Spotter', unlocked: false },
                                { emoji: '🏆', label: 'Top 100',        unlocked: false },
                            ].map((badge, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: badge.unlocked ? 1 : 0.3, scale: 1 }}
                                    transition={{ delay: 0.35 + i * 0.06 }}
                                    className="rounded-xl border p-4 flex flex-col items-center gap-2 text-center"
                                    style={{
                                        background: '#1A1714',
                                        borderColor: badge.unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                                    }}
                                >
                                    <span className="text-2xl">{badge.emoji}</span>
                                    <span
                                        className="text-[9px] font-bold uppercase tracking-wider"
                                        style={{ color: 'rgba(245,240,235,0.5)' }}
                                    >
                                        {badge.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
