System Prompt: Build "The Demand Pool" MVP

Act as an expert Full-Stack Developer and UI/UX Designer to build the MVP for "The Demand Pool," a high-trust, dual-sided marketplace that bridges the gap between consumer intent and production certainty through financially backed pledges.

Project Vision & Aesthetic:

Core Value: Eliminate retail guesswork by signaling verified consumer intent to brands via escrow-backed pledges.
Vibe: It must feel as secure as a banking app, but as engaging as a high-end e-commerce site. Use a minimalist, "Sophisticated Tech" palette (deep navies, slate grays) with a high-contrast action color like 'Electric Green' for "Greenlight" events.
Layout: Use a max-width, centered container (e.g., max-w-4xl) with generous whitespace, ensuring it stacks beautifully on mobile.
Technical Stack:

Framework: Next.js 15 (App Router) & React
Styling: Tailwind CSS, paired with highly polished and modern UI components (e.g., Shadcn/ui or simple localized Framer Motion animations).
State Management: For this static MVP, simulate the state machine logic (Initiated → Escrowed → Locked → Disbursed) using local state.
Core Components to Implement:

Header: Minimalist logo, with a toggle or clear distinction between "Brand Portal" and "Consumer Feed".
Hero Section ("Brand-Hosted Prompts"): A trending demand area showing a verified brand (e.g., Nike) hosting a question like, "Which retro colorway should we bring back?"
The Pledge Card: A centered card featuring a product variant, a "Pledge Now" button, and a real-time progress bar showing how close the project is to its funding goal.
Demand Lifecycle Tracker: A visual stepper UI marking the stages: Spark → Pledge → Locked → Greenlight → Production.
The Squads Sidebar: A small, intuitive section showing niche community groups (e.g., "The Left-Handed Guitar Alliance") pooling their capital.
Pledge Modal: An interactive pop-up managing the pledge selection, "Squad" affiliation, and a "Zero-Risk Guarantee" disclaimer.
Trust Indicators: Prominent UI elements reinforcing that funds are held securely in escrow (simulating Stripe) and are 100% refundable if the goal isn't met.
Please start by setting up the core layout (layout.tsx / page.tsx) with the centered aesthetic, and build the Hero Section and the Pledge Card components.