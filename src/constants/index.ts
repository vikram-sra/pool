// ── Scroll & Gesture Thresholds ──
export const SCROLL_COOLDOWN_MS = 800;
export const SWIPE_DISTANCE_THRESHOLD = 120;
export const SWIPE_VELOCITY_THRESHOLD = 0.5;
export const SWIPE_MIN_DISTANCE = 40;
export const WHEEL_DELTA_THRESHOLD = 30;

// ── 3D Scene ──
export const MODEL_Y_SPREAD = 8;
export const MODEL_LERP_FACTOR = 0.05;
export const MODEL_SCALE_LERP = 0.08;
export const MODEL_ACTIVE_SCALE = 0.5;
export const MODEL_HIDDEN_SCALE = 0.001;
export const MODEL_VISIBLE_THRESHOLD = 0.01;
export const MODEL_RENDER_WINDOW = 2; // only render currentIndex ± N

// ── Camera ──
export const CAMERA_POSITION: [number, number, number] = [0, 0, 5];
export const CAMERA_FOV = 45;
export const ORBIT_MIN_DISTANCE = 2;
export const ORBIT_MAX_DISTANCE = 12;
export const ORBIT_DAMPING = 0.15;

// ── Lifecycle ──
export const LIFECYCLE_STAGES = ['SPARK', 'PLEDGE', 'LOCKED', 'GREENLIGHT', 'PRODUCTION'] as const;
export const LIFECYCLE_LABELS: Record<string, string> = {
    SPARK: 'Spark',
    PLEDGE: 'Pledging',
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
