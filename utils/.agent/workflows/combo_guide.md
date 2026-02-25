---
description: combos
---

# Combo Prompt Guide: How to Avoid Overwhelm

You have a powerful **Assembly Line** (6 Agents). Running them one-by-one is tedious.
Use these **Combos** to chain them automatically.

---

## 1. The "Deep Build" Combo (Idea → Shipped Code)

> **Trigger**: "System: Run Deep Build on [Idea]"

**Chain**:
```
PHD Researcher → Requirements → Builder → Logic Checker
      ↓              ↓            ↓            ↓
   Validate       Spec it      Build it     Verify it
```

**What Happens**:
1. **PHD Researcher**: Stress-tests idea (Is it stupid? Ancestral mismatch?)
2. **Requirements**: Generates the spec with acceptance criteria.
3. **Builder**: Implements it with full code.
4. **Logic Checker**: Verifies. If FAIL → loops back to Builder.

**Success Criteria**:
- Logic Checker returns PASS
- All metrics met (FCP < 500ms, 60fps, etc.)

---

## 2. The "Smart Analyze" Combo (Data Update)

> **Trigger**: "System: Run Smart Analyze on [File]"

**Chain**:
```
Data Analyser → Orchestrator → (Builder if needed)
      ↓              ↓
   Parse data    Check impact
```

**What Happens**:
1. **Data Analyser**: Cleans data, creates JSON + Action Plan.
2. **Orchestrator**: Checks if new data breaks existing UI.
3. **Builder**: Only triggered if data schema changed.

**Success Criteria**:
- `life_data.json` updated with version history
- Action Plan generated
- No UI regressions

---

## 3. The "Quick Fix" Combo (Bug Squashing)

> **Trigger**: "System: Fix [Bug Description]"

**Chain**:
```
Logic Checker → Builder → Logic Checker
      ↓            ↓            ↓
  Diagnose       Fix it      Verify fix
```

**What Happens**:
1. **Logic Checker**: Reproduces and diagnoses bug.
2. **Builder**: Writes the fix.
3. **Logic Checker**: Verifies fix + regression check.

**Success Criteria**:
- Bug resolved
- No new bugs introduced
- PASS verdict

---

## 4. The "Core Ideology" Combo (Deep Research)

> **Trigger**: "System: Define Core Ideology for [Topic]"

**Chain**:
```
PHD Researcher → Requirements
      ↓              ↓
  Deep theory    Synthesize doc
```

**What Happens**:
1. **PHD Researcher**: Deep dive into values, philosophy, user psychology.
2. **Requirements**: Synthesizes into a "Core Ideology" document.

**Success Criteria**:
- At least 2 theoretical frameworks applied
- Actionable principles defined

---

## 5. The "Full Stack" Combo (End-to-End Project)

> **Trigger**: "System: Full Stack [Project Name]"

**Chain**:
```
Data Analyser → PHD Researcher → Requirements → Builder → Logic Checker
      ↓              ↓                ↓            ↓            ↓
  Organize      Validate           Spec        Build        Verify
```

**What Happens**:
1. **Data Analyser**: Process any raw data first.
2. **PHD Researcher**: Validate the approach.
3. **Requirements**: Full specification.
4. **Builder**: Complete implementation.
5. **Logic Checker**: Final verification.

**Success Criteria**:
- All agents complete successfully
- Final PASS from Logic Checker

---

## Mental Health Recommendations

| Tip | Reason |
|:---|:---|
| **Don't micro-manage** | Trust the Orchestrator. |
| **Focus on Input** | You provide the spark. Agents do the heavy lifting. |
| **Use Combos** | Stop calling individual agents. Say "Deep Build this." |
| **Accept the Loop** | FAIL → Fix → Verify is normal. Not a failure. |

---

## Quick Reference

| Combo | Trigger | Agents Used |
|:---|:---|:---|
| Deep Build | "Deep Build [idea]" | PHD → Req → Build → Logic |
| Smart Analyze | "Analyze [file]" | Data → Orch → (Build) |
| Quick Fix | "Fix [bug]" | Logic → Build → Logic |
| Core Ideology | "Ideology [topic]" | PHD → Req |
| Full Stack | "Full Stack [project]" | Data → PHD → Req → Build → Logic |
