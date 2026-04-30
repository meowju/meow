# MEOW Standard Operating Procedures (SOP)

Follow these rules to ensure high productivity and zero "Useless Commits."

## 1. The "Think-Plan-Verify" Loop
Before writing any code:
1.  **Grep/Read**: Ensure you understand the existing implementation.
2.  **Plan**: Write a brief strategy in `scratch/PLAN.md`. This directory is git-ignored. **DO NOT COMMIT THE PLAN.**
3.  **Execute**: Make the change.
4.  **Verify**: ALWAYS run `bun run check` (or `tsc --noEmit`) before declaring success.

## 2. Output Verification - NO TRUST Policy
**CRITICAL**: Never assume a tool succeeded just because it returned. Always verify output quality.

### Verification by Output Type:

| Output Type | Verification Method | Acceptance Criteria |
|-------------|---------------------|---------------------|
| PDF/Image | **Screenshot required** | Shows actual content, not placeholder/blank |
| Markdown/File | Read first 10 and last 10 lines | Matches expected content |
| Browser/Webpage | Snapshot or Screenshot | Contains expected elements |
| API Response | Log status code + first 200 chars | 2xx status, valid data |

### For Visual Outputs (PDF, Image, etc.):
1. Generate the output file
2. **Take screenshot** of the output
3. **Describe what screenshot shows**
4. If screenshot shows placeholder/error/wrong content → **REJECT and retry**

### MEOW Must Report for Each Output:
```
VERIFIED: [output type] - [visual confirmation description]
Example: VERIFIED: PDF - "Shows 'Top 10 Drug Patents' title and table with patent data"
```

## 3. Commit Standards
- **Atomic Commits**: One feature/fix per commit.
- **No Checkpoints**: Do not commit "WIP" or "working on it" states.
- **Commit Messages**: Should be descriptive. Example: `feat(audio): implement silence suppression in merger`.

## 4. Handling Uncertainty (Research First)
If you are uncertain about the "best" or "most mature" way to implement a feature (e.g. an MCP tool, a Claude skill, or a complex agentic workflow):
1.  **STOP**: Do not guess or implement a naive solution.
2.  **Browse & Search**: Use the `search` or `browse` tools to look for existing solutions on GitHub, or search for "best agentic way of doing [task]" or "mature Claude skills for [task]".
3.  **Reference Ecosystem**: Look for established patterns in the AI agent ecosystem (e.g. Model Context Protocol, Aider, Claude Code) before implementing custom logic.
4.  **Ask for Guidance**: If research is inconclusive, summarize your findings and ask the user for a strategic pivot.

## 5. Handling Hallucinations
- If you find yourself searching for a file that doesn't exist more than twice, **STOP**.
- List your assumptions and ask the user for clarification.
- Do not "invent" APIs or tools that aren't listed in the project extensions.

## 5. Independent Verification - Don't Trust Same Agent
**CRITICAL**: The agent that GENERATES output should NOT be the same agent that VERIFIES it.

For output verification:
1. **Use a different agent** (e.g., Claude Code via summon, or BrowserOS MCP) to:
   - Convert markdown to PDF/Image
   - Take screenshot of output
   - Verify visual content matches expectation

2. **Verification Options**:
   - `summon | claude | [task]` - Ask Claude Code to verify with BrowserOS screenshot
   - Use BrowserOS MCP directly - take snapshot/screenshot of rendered output
   - Use external verification (human review for critical outputs)

3. **Never Self-Verify**: If you generated the output, you cannot objectively verify it. Always escalate to another agent or tool for verification.

Example workflow:
```
1. MEOW generates: scratch/task-2/PATENTS_REPORT.md
2. MEOW calls: TOOL: summon | claude | Take screenshot of scratch/task-2/PATENTS_REPORT.md and verify it shows actual content
3. CLAUDE CODE (different agent) verifies and reports back
4. If CLAUDE reports FAIL → MEOW retries with corrected approach
```

## 6. ALWAYS DELEGATE - Never Do Work Directly
**CRITICAL**: MEOW is an orchestrator, NOT a worker. MEOW should NEVER do work directly - always delegate to specialized agents.

### Delegation Rules:
1. **Code/Script Writing** → Delegate to Claude Code via `summon | claude | [task]`
2. **PDF/Image Generation** → Delegate to Claude Code with BrowserOS access
3. **Research/Lookup** → Delegate to appropriate tool or agent
4. **File Creation** → Can create simple text files, but complex outputs → delegate
5. **Verification** → ALWAYS delegate to different agent than generator

### MEOW's Role:
- **DO**: Orchestrate, plan, delegate, review results, verify via external agent
- **DON'T**: Write code directly, generate PDFs/images directly, do heavy processing

### Delegation Syntax:
```
TOOL: summon | claude | [detailed task description]
TOOL: summon | aider | [task]
```

### Example - PDF Generation:
WRONG:
```
MEOW tries to generate PDF directly → fails or produces invalid output
```

RIGHT:
```
MEOW delegates: TOOL: summon | claude | Generate PDF from scratch/task-2/PATENTS_REPORT.md using BrowserOS, verify with screenshot, save to same path
MEOW receives result from CLAUDE CODE (different agent)
MEOW reviews verification screenshot
```

## 7. Environment Context
- We use **Bun** as the runtime.
- We use **TypeScript** with strict typing.
- We use **SQLite-vec** for vector operations.
- Avoid adding new dependencies unless absolutely necessary.

## 7. Adding New Skills
To add a new skill:
1. Create a directory in `skills/`.
2. Create a `SKILL.md` with appropriate YAML frontmatter.
3. Ensure the description is searchable for the `SkillManager`.
