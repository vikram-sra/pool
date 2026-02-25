// ── Scroll & Gesture Thresholds ──
export const SCROLL_COOLDOWN_MS = 800;
export const SWIPE_COOLDOWN_MS = 600;
export const SWIPE_DISTANCE_THRESHOLD = 80;
export const SWIPE_VELOCITY_THRESHOLD = 0.4;
export const SWIPE_MIN_DISTANCE = 40;
export const WHEEL_DELTA_THRESHOLD = 40;

// ── 3D Scene ──
export const MODEL_ACTIVE_SCALE = 0.65;

// ── Camera ──
export const CAMERA_POSITION: [number, number, number] = [0, 0, 4];
export const CAMERA_FOV = 50;
export const ORBIT_MIN_DISTANCE = 1.5;
export const ORBIT_MAX_DISTANCE = 10;
export const ORBIT_DAMPING = 0.15;

// ── Lifecycle ──
export const LIFECYCLE_STAGES = ['SPARK', 'REVIEW', 'VOTING', 'FUNDING', 'LOCKED', 'GREENLIGHT', 'PRODUCTION'] as const;
export const LIFECYCLE_LABELS: Record<string, string> = {
    SPARK: 'Spark',
    REVIEW: 'AI Review',
    VOTING: 'Voting',
    FUNDING: 'Funding',
    LOCKED: 'Locked',
    GREENLIGHT: 'Greenlight',
    PRODUCTION: 'Production',
};

// ── Categories ──
export const CATEGORIES = ['ALL', 'TECH', 'APPAREL', 'HOME', 'RESTAURANTS', 'LOCAL'] as const;

// ── Framer Motion Variants (module-level — never re-created) ──
export const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const slideUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export const slideFromRight = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};
