---
description: workflow
---

# Multi-Agent Workflow Guide

The definitive guide to running your prompt library for maximum efficiency.

---

## The Three Phases

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           PHASE 1: DEFINITION                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   USER           PHD Researcher        Requirements Engineer             │
│     │                  │                        │                        │
│     │  rough idea      │                        │                        │
│     ├─────────────────►│                        │                        │
│     │                  │  theory + validation   │                        │
│     │                  ├───────────────────────►│                        │
│     │                  │                        │  Requirements Doc      │
│     │◄─────────────────┼────────────────────────┤                        │
│     │                  │                        │                        │
│                                                                          │
│   ⚠️  CRITICAL: Descope here. Reject scope creep.                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           PHASE 2: EXECUTION                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Builder                            Logic Checker                       │
│     │                                     │                              │
│     │  (receives Requirements Doc ONLY)   │                              │
│     │                                     │                              │
│     ├──────── code output ───────────────►│                              │
│     │   (Frontend / Backend / API)        │                              │
│     │                                     │  Verification Report         │
│     │◄────────────────────────────────────┤                              │
│     │                                     │                              │
│                                                                          │
│   ⚠️  Builder receives ONLY the Requirements. Not chat history.          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         PHASE 3: ITERATION (LOOP)                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Logic Checker Output                                                   │
│         │                                                                │
│         ├───── FAIL ─────► Builder (with bug report) ──► Loop back       │
│         │                                                                │
│         └───── PASS ─────► Present to USER ──► Ship!                     │
│                                                                          │
│   ⚠️  Never ship without Logic Checker PASS.                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Antigravity Mode (You're Here)

Since you're using **Antigravity**, I am your Runner. No API key needed.

### How to Trigger

> "Run the System on [Your Idea]"

### What Happens

I simulate the entire chain:

| Step | I Become | I Output |
|:---|:---|:---|
| 1 | PHD Researcher | Theory + validation |
| 2 | Requirements Engineer | Requirements Doc |
| 3 | Builder | Full working code |
| 4 | Logic Checker | Verification Report |

**You** act as the Orchestrator by approving each step.

---

## Pro Tips

### 1. Structured Inputs
Tell the Builder:
> "Do not talk. Output only code blocks."

### 2. Structured Outputs
Tell Requirements:
> "Output a Markdown Checklist only."

### 3. Context Hygiene
**DO**:
```
Pass to Builder: Requirements Doc only
```

**DON'T**:
```
Pass to Builder: PHD Researcher's entire philosophy essay
```

### 4. Parallel vs Sequential

| Task Type | Approach |
|:---|:---|
| Independent features | Can parallelize |
| Dependent features | Must be sequential |
| Bug fixes | Always sequential (Logic → Build → Logic) |

---

## Decision Tree

```
START
  │
  ▼
Is this a new idea?
  │
  ├── YES → PHD Researcher → Requirements → Builder
  │
  └── NO
       │
       ▼
     Is this a bug fix?
       │
       ├── YES → Logic Checker → Builder → Logic Checker
       │
       └── NO
            │
            ▼
          Is this new data?
            │
            ├── YES → Data Analyser → (Check if UI needs update)
            │
            └── NO → Ask clarifying question
```

---

## Quality Gates

| Gate | Enforced By | Criteria |
|:---|:---|:---|
| **Idea Validation** | PHD Researcher | No ancestral mismatch, genuine innovation |
| **Scope Lock** | Requirements | All features prioritized, out-of-scope defined |
| **Code Quality** | Logic Checker | No Critical failures, all requirements met |
| **Ship Approval** | | - Logic Checker returns PASS<br>- All metrics met (Performance targets from Requirements) |

---

## Common Mistakes

| Mistake | Why It's Bad | Fix |
|:---|:---|:---|
| Skipping Requirements | Builder has no clear spec | Always run Requirements first |
| Passing full chat history | Context overflow | Summarize between agents |
| Shipping without Logic Check | Bugs in production | Always get PASS |
| Too many iterations | Infinite loop | Max 3 iterations, then reassess |
