export type LifecycleStage = 'SPARK' | 'REVIEW' | 'VOTING' | 'FUNDING' | 'LOCKED' | 'GREENLIGHT' | 'PRODUCTION';
export type PledgeState = 'initiated' | 'escrowed' | 'locked';
export type Category = 'TECH' | 'APPAREL' | 'HOME' | 'RESTAURANTS' | 'LOCAL';
export type TabId = 'FEED' | 'PITCH' | 'ECOSYSTEM' | 'PROFILE';

export interface Squad {
    name: string;
    amount: string;
    members?: number;
    icon?: string;
}

export interface Variant {
    id: string;
    label: string;
    type: 'color' | 'material' | 'size';
    value: string;
    hex?: string;
    votes: number;
}

export interface Campaign {
    id: number;
    brand: string;
    brandLogo?: string;
    iconPath?: string;
    iconHex?: string;
    title: string;
    description: string;
    goal: number;
    pledged: number;
    emoji?: string;
    modelType: string;
    color: string;
    deadline: string;
    squadsCount: string;
    specs: string[];
    squads: Squad[];
    category: Category;
    image?: string;
    lifecycle: LifecycleStage;
    variants?: Variant[];
    backers?: number;
    brandPrompt?: string;
    deliveryDate?: string;
    minOrders?: number;
    minFunding?: number;
}

export interface Brand {
    name: string;
    brandLogo?: string;
    iconPath?: string;
    iconHex?: string;
    totalRaised: string;
    campaigns: number;
    hue: string;
    joinedYear?: number;
    description?: string;
}

export interface GlobalStats {
    totalPledged: string;
    totalPledgedNum: number;
    campaignsGreenlighted: number;
    wasteSaved: string;
    wasteSavedNum: number;
    activeSquads: number;
    activeBrands: number;
}

export interface UserPledge {
    brand: string;
    title: string;
    amount: string;
    status: 'Locked' | 'Escrow' | 'Greenlit';
    color: string;
}

export interface UserProfile {
    name: string;
    initials: string;
    tier: string;
    title: string;
    email: string;
    bio: string;
    tags: string[];
    assetsEscrowed: string;
    activeSquads: number;
    pledges: UserPledge[];
}
