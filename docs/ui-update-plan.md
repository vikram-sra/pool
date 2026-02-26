# UI Updates Plan — The Demand Pool (MVP4 → MVP5 Visual Refresh)

**Branch**: `claude/analyze-ui-updates-Y4W2q`
**Date**: 2026-02-26
**Scope**: UI refresh across all 4 tabs + global design language shift

---

## Context

The app has a working MVP4 (Pitch system, Feed, Explore, Profile). The vision has been sharpened:
- **"Power to the people"**: Consumers drive the full loop — pitch idea → vote on designs → pledge capital → buy.
- Brands are **facilitators**, not directors. Their campaign prompts now carry more structured data.
- The design vibe shifts from **cold neon-on-dark** to **warmer, more human** — same dark base, amber/warm tones replace some hard green/blue accents.
- The Feed interaction model matches how people actually scroll social media.

---

## Concept Summary

**The Demand Pool** is a consumer-first, dual-sided marketplace where regular people have creative control:
- **Pitch ideas** to brands (communal pitch stream)
- **Vote on top pitches** with design mockup concepts surfaced for the best ideas
- **Pledge capital** to back the products they want made
- **Buy** when campaigns hit production

Brands post prompts with structured context: their open question, delivery timeframe, min orders required, min funding required, approximate delivery date.

---

## Tab-by-Tab Changes

### 1. Feed Tab
- **Scroll model**: Natural vertical momentum scroll (CSS scroll-snap) from anywhere on card — no gesture zones
- **Card carousel**: 2–3 horizontal slides per campaign:
  - Slide 1: 3D model + brand prompt headline + squads
  - Slide 2: Delivery date, min orders, min funding, progress bar, deadline
  - Slide 3 (if in VOTING/FUNDING/LOCKED): Design mockup + Pledge CTA
- Sticky pledge button always visible at card bottom

### 2. Pitch Tab
- **Vote screen**: Top-5 pitches show brand-colored design mockup cards (concept attribute chips, brand color background at 15% opacity, concept emoji)
- **Pitch input**: Brand prompt header now shows delivery date, min orders, min funding as stat row
- Overall warmer styling

### 3. Explore Tab
- **Section A — Discovery**: Category filter chips + 2-col trending campaigns grid + brand spotlight row
- **Section B — Analytics**: Bento grid with global stats (Total Escrowed, Campaigns by Stage, Most Backed Category, Waste Saved)

### 4. My Pool Tab
- Reframed as **"Demand Portfolio"** impact screen
- Impact header: "You've helped bring X products into existence"
- Portfolio grid: each pledge as a product impact card with lifecycle badge + contribution % bar
- Co-creation stats row: products pledged, co-created, in production, escrowed value

---

## Data Model Additions (Campaign interface)

```ts
deliveryDate?: string;    // e.g. "Q3 2026"
minOrders?: number;       // e.g. 500
minFunding?: number;      // minimum required to greenlight
brandPrompt?: string;     // the open question the brand is asking consumers
```

---

## Design Language

- **Base**: Deep dark `#0A0A0F`
- **Primary CTA**: Warm amber `#F59E0B` (replaces hard green for interactive elements)
- **GREENLIGHT/success**: Keep electric green `#00FF87`
- **Pledge/escrow**: Muted rose `#FB7185`
- **Typography**: Slightly warmer, more readable feel

---

## Implementation Order

1. `docs/ui-update-plan.md` — Save this reference doc ✓
2. `src/types/index.ts` — Add new Campaign fields
3. `src/data/campaigns.ts` — Populate new fields
4. `src/app/globals.css` — Warm palette tokens
5. `src/components/views/FeedView.tsx` — Scroll model + card carousel
6. `src/components/views/PitchView.tsx` — Mockup cards + brand prompt details
7. `src/components/views/EcosystemView.tsx` — Bento grid + discovery
8. `src/components/views/ProfileView.tsx` — Portfolio screen

---

## Future MVPs Referenced

- **MVP5**: NLP extraction engine for pitch clustering, real-time WebSocket, brand dashboard
- **MVP6**: Stripe Connect escrow, real payment flow
- **Future**: Google Shopping integration, existing product browser/saver, demand heatmaps, geospatial features
