# MEOW Architecture Map

This document serves as the ground truth for the project's technical structure.

## Directory Layout

- `src/index.ts`: The entry point and main kernel loop.
- `src/agent/`: Core orchestration logic.
  - `skills.ts`: Discovers and manages `.md` based skill files.
  - `kernel.ts`: The "brain" that manages task state and tool execution.
- `src/extensions/`: Tool definitions and MCP integrations.
- `skills/`: Markdown-based "Expert Knowledge" modules.
  - `karpathy_guidelines/`: Core coding standards.
- `memory/`: Persistent storage for agent findings and long-term context.
- `REPORTS/`: Audits, reviews, and post-mortems.

## Key Abstractions

### 1. The Kernel
The central loop that receives a user request, selects the appropriate skills/tools, and executes the "Quantum turn."

### 2. Skills
Static Markdown files with frontmatter. They provide **Passive Context**. The agent reads them to understand "how" to perform specific tasks (e.g., how to code like Karpathy).

### 3. Extensions
Code modules that provide **Active Capabilities**. They register tools (read, write, run) that the agent can use to interact with the system.

## Data Flow
User Input → Kernel → Skill Discovery → Tool Selection → Execution → Verification → Result.
