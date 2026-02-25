# Combo Prompt Guide: How to Avoid Overwhelm

You have a powerful "Assembly Line" (6 Agents). Running them one-by-one is tedious.
Use these **Combos** to chain them automatically.

## 1. The "Deep Build" Combo (From Idea to Code)
> "System: Run Deep Build on [Idea]"

**What I will do (Chain):**
1.  **PHD Researcher**: Rapidly validates the idea (Is it stupid?).
2.  **Requirements**: If valid, generates the spec.
3.  **Builder**: Implements it immediately.
*(Skips Logic Checker unless Builder fails)*.

## 2. The "Smart Analyze" Combo (Data Update)
> "System: Run Smart Analyze on [File]"

**What I will do (Chain):**
1.  **Data Analyser**: Cleans the data & makes the Action Plan.
2.  **Orchestrator**: Checks if the new data affects the current UI.
*(Does not trigger Builder unless the data format breaks the UI)*.

## 3. The "Quick Fix" Combo (Bug Squashing)
> "System: Fix [Bug Description]"

**What I will do (Chain):**
1.  **Logic Checker**: Reproduces the bug mentally.
2.  **Builder**: Writes the fix.
3.  **Logic Checker**: Verifies the fix.
*(Skips Researcher and Requirements completely)*.

## 4. The "Core Ideology" Combo (Deep Research)
> "System: Define Core Ideology for [Topic]"

**What I will do (Chain):**
1.  **PHD Researcher**: Deep dive into values, purpose, and philosophy.
2.  **Requirements**: Synthesize into a "Core Ideology" document.

## Recommendations for Mental Health
-   **Don't micro-manage**: Trust the Orchestrator (Me).
-   **Focus on Input**: You just provide the "Raw Data" or the "Spark". Let the agents do the heavy lifting of structure.
-   **Use the Combos**: Stop calling individual agents. Just say "Deep Build this."
