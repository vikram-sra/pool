# The Demand Pool

> **A high-trust, dual-sided marketplace that eliminates retail guesswork by turning consumer intent into verified production signals.**

Instead of brands guessing what to make next, consumers pledge real capital to back specific products — creating financially-verified demand that greenlights production with zero inventory risk.

---

## The Problem

Brands launch products nobody wants. Consumers can't get the products they do want. Surveys and focus groups are noise. Traditional crowdfunding lacks brand trust and distribution. The gap between *"I want this"* and *"this exists"* costs everyone.

## The Solution

**The Demand Pool** is a co-creation platform where:
- **Consumers** back products they actually want with escrowed pledges (zero risk — 100% refunded if a goal isn't met)
- **Brands** get demand-verified production mandates, not guesswork
- The market decides what gets made, not the boardroom

---

## Core Concept: The Demand Lifecycle

Every product moves through seven verifiable stages:

```
SPARK → REVIEW → VOTING → FUNDING → LOCKED → GREENLIGHT → PRODUCTION
```

| Stage | What it means |
|---|---|
| **Spark** | A brand posts a demand prompt. Community starts pitching product ideas. |
| **AI Review** | AI scans the pitch stream to extract and group the top 10 most common concepts. |
| **Voting** | The top 10 ideas go to a community vote to select the definitive winner. |
| **Funding** | The winning pitch opens for funding. Consumers back it (like, save, pledge) via pre-orders. |
| **Locked** | Funding/combination goal reached. Funds held in escrow. Brand commits to produce. |
| **Greenlight** | Production details confirmed. Capital disbursed to brand. |
| **Production** | Item manufactured and shipped to backers. |

---

## Features (Current MVP)

### 📱 TikTok-style Feed (`FEED`)
- Vertical scroll between active campaigns — smooth, velocity-based swipe gesture system
- Live 3D product model for each campaign (procedurally built, WebGL-rendered)
- Per-campaign color theme with ambient glow
- Drag-to-preview: swipe mid-gesture to see the next product peek in from below
- Right sidebar: like, comment, save, share actions
- Bottom info card: brand, lifecycle stage, progress bar toward pledge goal
- **Zen Mode**: tap the 3D object to hide all UI — pure product viewing

### 🗳 Pitch System (`PITCH`) — MVP4
The core innovation. Brands don't always know what to make next. Consumers do.

**How it works:**
1. **Vote sub-tab** — A ranked list of the top 5 community-extracted pitches per brand, each with a progress bar toward its Greenlight threshold. Pitches near the threshold get a 🔥 urgency badge.
2. **Pitch sub-tab** — Select a brand, see their open question, then open the Pitch Pad.
3. **Pitch Pad** — A living, communal text stream of every pitch for that brand's prompt. Add your idea (max 280 chars) to the pool. The stream continuously grows as others pitch in real time.
4. **Vote Detail** — Expand any ranked pitch to read the community brief in full, see the progress bar, and cast your vote (1 per pitch).

> **The magic:** The raw pitch stream is analyzed to extract the top 5 most-common signals — surfacing what the crowd actually wants into named, votable product briefs.

### 📈 Trends (`TRENDS`)
Community-wide demand heatmaps, trending pitches, and lifecycle analytics across all active campaigns.

### 🏷 Brands (`BRANDS`)
Verified brand profiles showing total raised, active campaigns, and their open demand prompts.

### 👤 Profile (`PROFILE`)
User pledge history, escrow status, squad affiliations, and tier/reputation tracking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **3D Engine** | React Three Fiber + Three.js |
| **Icons** | Lucide React |
| **Font** | Geist (via next/font) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Root — canvas + tab routing
│   ├── layout.tsx          # Font, metadata
│   └── globals.css         # Design tokens, animations, utilities
├── components/
│   ├── three/
│   │   ├── ThreeScene.tsx  # Camera, lights, OrbitControls, model orchestration
│   │   └── ShapeModel.tsx  # Procedural 3D models for each product type (15 types)
│   ├── ui/
│   │   ├── BottomNav.tsx   # Tab bar with cross-fade backgrounds
│   │   ├── ErrorBoundary.tsx
│   │   ├── LifecycleTracker.tsx
│   │   ├── PledgeModal.tsx
│   │   └── StatsRow.tsx
│   └── views/
│       ├── FeedView.tsx    # TikTok-style campaign feed
│       ├── PitchView.tsx   # MVP4 — full pitch system (3 screens)
│       ├── TrendsView.tsx
│       ├── BrandsView.tsx
│       └── ProfileView.tsx
├── data/
│   └── campaigns.ts        # Mock campaigns, brands, user profile, global stats
├── types/
│   └── index.ts            # Shared TypeScript interfaces
└── constants/
    └── index.ts            # Scroll thresholds, 3D scene constants, animation variants
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** `reactStrictMode` is set to `false` in `next.config.ts`. React Strict Mode double-mounts components in development, which creates two WebGL contexts per page load and quickly exhausts Chrome's 16-context limit — causing `THREE.WebGLRenderer: Context Lost`. This is a known R3F + React 19 dev-mode issue.

---

## Roadmap

### MVP5 — Intelligence Layer
- [ ] NLP extraction engine: cluster raw pitch stream → surface top 5 titled pitches
- [ ] Real-time pitch streaming via WebSocket
- [ ] Brand dashboard: pitch stream + extracted ideas + vote results

### MVP6 — Financial Layer
- [ ] Stripe Embedded Elements for real escrow
- [ ] Negative cash conversion cycle enforcement (brands receive capital post-lock only)
- [ ] Pledge-to-campaign pipeline: voted pitches auto-convert to pledge campaigns

### Future
- [ ] Google Shopping integration — surface existing products alongside demand campaigns
- [ ] Geospatial demand heatmaps for brands
- [ ] User reputation: frequent pitchers whose ideas get greenlit earn badges
- [ ] Existing product browser + saver

---

## Design Principles

- **Trust-first**: every UI element reinforces that funds are escrowed, refundable, and brand-verified
- **Demand Lifecycle visibility**: progress is always explicit — users know exactly where a campaign stands
- **Mobile-native**: gesture system mirrors native iOS/Android scroll physics
- **Performance**: WebGL context budget managed carefully — no HDRI fetches at init, standard materials only, `reactStrictMode` off

---

*Built by Vikram S. — Feb 2026*
