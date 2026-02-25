# Multi-Agent Workflow Guide

To get the most out of your prompt library, run them in this specific "Loop":

## Phase 1: Definition
1.  **User** gives a rough idea.
2.  **PHD Researcher** expands it into a theoretical model.
3.  **Requirements Engineer** takes the theory and limits it to a concrete checklist. **(Critical Step: Descope here)**.

## Phase 2: Execution
4.  **Builder** takes the *Requirements Checklist* (not the chat history) and writes code.
5.  **Logic Checker** takes the *Code* + *Requirements* and acts as a compiler/tester.

## Phase 3: Iteration (The "Loop")
6.  **IF Logic Checker Errors**:
    -   Pass the *Errors* back to the **Builder**.
    -   Do NOT pass it back to the User yet.
    -   Loop until Logic Checker says "PASS".
7.  **IF Logic Checker Passes**:
    -   Show code to User.

## Option 2: "Antigravity Mode" (No API Key)
Since you are using Antigravity, **I am your Runner**. You don't need a script.

To trigger the system, simply say:
> "Run the System on [Your Idea]"

I will interactively simulate the chain:
1.  **I will become the Researcher** and output the theory.
2.  **I will become the Requirements Engineer** and output the spec.
3.  **I will become the Builder** and write the code.
4.  **I will become the Logic Checker** and verify it.

**You** act as the "Orchestrator" by approving each step.

## Pro Tips
-   **Structured Inputs**: Tell the Builder "Do not talk. Output only code blocks."
-   **Structured Outputs**: Tell the Requirements Engineer "Output a Markdown Checklist only."
-   **Context Hygiene**: Don't feed the Builder the PHD Researcher's entire philosophy. It will get confused. Give the Builder *only* the Requirements.
