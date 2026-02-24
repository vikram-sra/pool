"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldCheck, Zap, Users, CheckCircle2 } from "lucide-react";
import type { Campaign, PledgeState, Variant } from "@/types";
import LifecycleTracker from "./LifecycleTracker";

interface PledgeModalProps {
    campaign: Campaign;
    isOpen: boolean;
    onClose: () => void;
    onPledge: (campaignId: number) => void;
    pledgeState: PledgeState;
}

const AMOUNTS = [50, 100, 250, 500];

export default function PledgeModal({ campaign, isOpen, onClose, onPledge, pledgeState }: PledgeModalProps) {
    const [selectedAmount, setSelectedAmount] = useState(100);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(campaign.variants?.[0]?.id ?? null);
    const [selectedSquad, setSelectedSquad] = useState<string | null>(campaign.squads[0]?.name ?? null);
    const [userVote, setUserVote] = useState<string | null>(() => {
        try { const v = JSON.parse(localStorage.getItem('dp-votes') ?? '{}'); return v[campaign.id] ?? null; } catch { return null; }
    });
    const progress = (campaign.pledged / campaign.goal) * 100;

    const handleVariantSelect = (variantId: string) => {
        setSelectedVariant(variantId);
        setUserVote(variantId);
        try { const v = JSON.parse(localStorage.getItem('dp-votes') ?? '{}'); v[campaign.id] = variantId; localStorage.setItem('dp-votes', JSON.stringify(v)); } catch { }
    };
    const getVotes = (v: Variant) => v.votes + (userVote === v.id ? 1 : 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-[100] flex items-end md:items-center justify-center pointer-events-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%", scale: 0.95 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: "100%", scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full md:w-[520px] max-h-[90vh] glass-heavy rounded-t-3xl md:rounded-3xl border border-white/10 overflow-hidden shadow-[0_-10px_60px_rgba(0,0,0,0.8)]"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 md:hidden">
                            <div className="w-10 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="p-4 md:p-6 flex justify-between items-start border-b border-white/5">
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Secure Pledge</div>
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_currentColor]" style={{ color: campaign.color }}>{campaign.title}</h2>
                                <p className="text-[10px] font-bold text-white/50 mt-0.5 tracking-wider font-mono">by {campaign.brand}</p>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 rounded-xl glass-dark border border-white/10 text-white/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-120px)] no-scrollbar px-4 md:px-6 pb-safe space-y-5">
                            {/* Lifecycle */}
                            <div className="glass-dark rounded-xl p-5 border border-white/5 shadow-inner">
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-4">Campaign Stage</div>
                                <LifecycleTracker currentStage={campaign.lifecycle} color={campaign.color} />
                            </div>

                            {/* Progress */}
                            <div className="glass-dark rounded-xl p-5 border border-white/5 shadow-inner">
                                <div className="flex justify-between text-[11px] font-black uppercase mb-3 text-white/80">
                                    <span className="text-[var(--neon-cyan)] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">${campaign.pledged.toLocaleString()}</span>
                                    <span className="text-white/40">Goal ${campaign.goal.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full relative overflow-hidden shadow-[0_0_10px_currentColor]" style={{ backgroundColor: campaign.color, color: campaign.color }}>
                                        <div className="absolute inset-0 shimmer" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between mt-2.5 text-[8px] font-bold text-white/40 uppercase tracking-widest font-mono">
                                    <span>{Math.round(progress)}% funded</span>
                                    <span>{campaign.deadline} left</span>
                                </div>
                            </div>

                            {/* Variant Voting */}
                            {campaign.variants && campaign.variants.length > 0 && (
                                <div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-3">
                                        Vote: {campaign.variants[0].type === 'color' ? 'Colorway' : campaign.variants[0].type === 'material' ? 'Material' : 'Size'}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {campaign.variants.map((variant: Variant) => {
                                            const totalVotes = campaign.variants!.reduce((a, v) => a + getVotes(v), 0);
                                            const pct = Math.round((getVotes(variant) / totalVotes) * 100);
                                            const isSelected = selectedVariant === variant.id;
                                            const isVoted = userVote === variant.id;
                                            return (
                                                <motion.button
                                                    key={variant.id}
                                                    onClick={() => handleVariantSelect(variant.id)}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`relative rounded-xl p-3 transition-all duration-200 border ${isSelected ? "glass border-[var(--neon-cyan)] shadow-[0_0_15px_rgba(0,229,255,0.2)]" : "glass-dark border-white/5 hover:border-white/20"
                                                        }`}
                                                >
                                                    {variant.hex && (
                                                        <div className="w-full h-8 mb-3 rounded-lg border border-white/10 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: variant.hex, color: variant.hex }} />
                                                    )}
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center justify-center gap-1.5">
                                                        {variant.label}
                                                        {isVoted && <CheckCircle2 size={10} className="text-[var(--electric-green)] drop-shadow-[0_0_5px_var(--electric-green)]" />}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-white/40 uppercase mt-1 font-mono tracking-widest">{getVotes(variant).toLocaleString()} · <span className="text-[var(--neon-cyan)]">{pct}%</span></div>
                                                    <div className="w-full h-1.5 bg-white/5 mt-2.5 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: variant.hex || campaign.color, color: variant.hex || campaign.color }} />
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Squad Selection */}
                            <div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5"><Users size={10} />Squad</div>
                                <div className="flex flex-col gap-2">
                                    {campaign.squads.map((sq) => (
                                        <motion.button
                                            key={sq.name}
                                            onClick={() => setSelectedSquad(selectedSquad === sq.name ? null : sq.name)}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex justify-between items-center p-3.5 rounded-xl transition-all duration-200 border ${selectedSquad === sq.name ? "glass border-[var(--neon-cyan)] shadow-[0_0_15px_rgba(0,229,255,0.2)]" : "glass-dark border-white/5 hover:border-white/20"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-3.5 h-3.5 rounded-[4px] shadow-[0_0_8px_currentColor]" style={{ backgroundColor: campaign.color, color: campaign.color }} />
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-white">{sq.name}</span>
                                                {sq.members && <span className="text-[9px] font-bold text-white/30 font-mono tracking-widest">{sq.members}</span>}
                                            </div>
                                            <span className="text-[11px] font-bold text-[var(--neon-cyan)] font-mono">{sq.amount}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-3">Amount</div>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {AMOUNTS.map((amt) => (
                                        <motion.button
                                            key={amt}
                                            onClick={() => setSelectedAmount(amt)}
                                            whileTap={{ scale: 0.95 }}
                                            className={`py-3.5 rounded-xl font-bold font-mono tracking-widest text-sm transition-all duration-200 border ${selectedAmount === amt
                                                ? "glass bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                                : "glass-dark text-white/70 border-white/5 hover:border-white/20 hover:text-white"
                                                }`}
                                        >
                                            ${amt}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Zero-Risk */}
                            <div className="glass-dark rounded-xl p-4 flex items-start gap-3">
                                <ShieldCheck size={18} className="shrink-0 mt-0.5" style={{ color: '#34D399' }} />
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#34D399' }}>Zero-Risk Guarantee</div>
                                    <p className="text-[9px] font-medium text-white/50 leading-relaxed">
                                        ${selectedAmount} held in secure escrow. <span className="text-white/80 font-bold">100% refundable</span> if the goal isn&apos;t met.
                                    </p>
                                </div>
                            </div>

                            {/* CTA */}
                            <motion.button
                                whileHover={pledgeState === "initiated" ? { scale: 1.02, y: -2 } : {}}
                                whileTap={pledgeState === "initiated" ? { scale: 0.98 } : {}}
                                onClick={() => onPledge(campaign.id)}
                                disabled={pledgeState !== "initiated"}
                                className={`w-full py-4.5 rounded-xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 transition-all duration-300 border ${pledgeState === "initiated"
                                    ? "bg-[var(--electric-green)] text-black border-transparent shadow-[0_0_25px_rgba(0,255,102,0.4)] hover:shadow-[0_0_35px_rgba(0,255,102,0.6)]"
                                    : pledgeState === "escrowed"
                                        ? "glass bg-white text-black border-transparent"
                                        : "glass-dark border-[var(--electric-green)] text-[var(--electric-green)] shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                                    }`}
                            >
                                <AnimatePresence mode="popLayout">
                                    <motion.div key={pledgeState} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                                        {pledgeState === "initiated" ? <><Lock size={15} /> Lock ${selectedAmount} in Escrow</> : pledgeState === "escrowed" ? <><Zap size={15} className="animate-spin" /> Securing...</> : <><CheckCircle2 size={15} /> Secured — ${selectedAmount} Locked</>}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
