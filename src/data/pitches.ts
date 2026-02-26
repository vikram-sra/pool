import { BRANDS } from './campaigns';
import type { Brand } from '../types';

export interface PitchData {
    id: string;
    brandName: string;
    title: string;
    summary: string;
    voteCount: number;
    threshold: number;
    userVoted: boolean;
}

export const BASE_PITCHES: PitchData[] = [
    { id: "p1", brandName: "Nike", title: "Jordan 1 Olive Retro", summary: "Bring back the 1985 Olive colorway of the Jordan 1 High in modern materials. Full grain leather, OG box.", voteCount: 4120, threshold: 5000, userVoted: false },
    { id: "p2", brandName: "Sony", title: "Discman Revival DAP", summary: "Modern hi-res audio DAP in a Discman shell. CD slot is now a 3.5\" OLED display showing waveforms.", voteCount: 3980, threshold: 4000, userVoted: false },
    { id: "p3", brandName: "Leica", title: "M-Zero Digital", summary: "A digital M-mount body with a single button — no menus, no screen. Exposure by eye.", voteCount: 2870, threshold: 4000, userVoted: false },
    { id: "p4", brandName: "Dyson", title: "Pure Air Backpack", summary: "Wearable air purifier built into a 20L daypack. Real-time AQI display.", voteCount: 1940, threshold: 3000, userVoted: false },
    { id: "p5", brandName: "Teenage Eng", title: "OP-XY Modular Synth", summary: "Snap-together synths that magnetically click like lego blocks to form a master sequencer.", voteCount: 1240, threshold: 2000, userVoted: false },
];

export interface ExtractedPitch extends PitchData {
    brandHue: string;
    brandLogo?: string;
    iconPath?: string;
    iconHex?: string;
}

export const MOCK_PITCHES: ExtractedPitch[] = BASE_PITCHES.map((pitch) => {
    const brand = BRANDS.find(b => b.name === pitch.brandName);
    return {
        ...pitch,
        brandHue: brand?.hue || '#000',
        brandLogo: brand?.brandLogo,
        iconPath: brand?.iconPath,
        iconHex: brand?.iconHex,
    };
});

export const BRAND_PROMPTS: Record<string, string> = {
    Nike: "What retro silhouette or colorway should we bring back next?",
    Sony: "What product from our archive would you buy again if we modernized it?",
    Leica: "What feature-set would make your ultimate minimal film-like camera?",
    Arcteryx: "What harsh environment are we NOT designing for that we should be?",
    "Teenage Eng": "What instrument format should we tackle that no one else has?",
    Braun: "Which forgotten Braun product deserves a faithful modern reissue?",
    Dyson: "What everyday problem are you surprised technology hasn't solved yet?",
    Nintendo: "Which classic IP or console would you back if we did a limited reissue?",
    MillerKnoll: "What does your ideal work-from-home setup actually need?",
};

export const SEED_PITCHES: Record<string, string[]> = {
    Nike: [
        "Bring back the Air Max 95 Neon Yellow but in a narrow width option.",
        "Jordan 1 in canvas — summer version, unlined, breathable.",
        "ACG line but for actual city commuting not just trail hiking.",
        "Nike SB with recycled ocean plastics — prove sustainability looks good.",
        "The Dunk in corduroy. You know it's time.",
        "Air Rift comeback. Running toe-split sandal was ahead of its time.",
    ],
    Sony: [
        "MDR-7506 with Bluetooth. Keep the coiled cable option.",
        "Trinitron monitor revival. Curved CRT aesthetic, modern LCD.",
        "MZ-N1 MiniDisc player but as a USB-C audio DAC/amp.",
        "PSP go but with Switch-level power.",
    ],
    Leica: [
        "Leica M with a built-in light meter — just the needle.",
        "A point-and-shoot with M glass mount, fixed 35mm f2.",
        "Reissue the Leica CL in black paint with modern sensor.",
    ],
    Dyson: [
        "Dyson Air Ring: wearable personal cooling ring for summer.",
        "A silent vacuum that actually works silently.",
        "Air purifier integrated into a desk lamp.",
    ],
};
