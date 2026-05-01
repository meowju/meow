# MEOW Anti-Patterns & Lessons Learned

This document tracks recurring mistakes or "hallucination triggers" to prevent them from happening again.

## Current Hallucination Triggers
- **Sync I/O**: Do not use `fs.readFileSync` in the kernel. It blocks the heartbeat. Use `fs/promises`.
- **Placeholder Skills**: Some skills are just frontmatter without content. Always check the `body` before assuming a skill is functional.
- **SQLite Wavefunction Collapse**: Avoid zero-length vectors in embeddings. They cause SQLite-vec to error out. Use the `0.0001` noise floor.

## Git Mistakes
- **Useless Commits**: Avoid committing after every tool call. Wait until the mission is verified.
- **Refactor Bloat**: Do not "clean up" `node_modules` or unrelated config files during a feature task.

## Meow Execution Failures (Dogfooding Findings)

### 1. Tool Call Parsing Loops (CRITICAL)
- **Symptom**: Meow outputs "Using tool: browse..." as TEXT but never actually calls the tool, causing infinite Grover search loops
- **Root Cause**: LLM (Ollama) is verbose and describes tool usage rather than executing `TOOL:` commands
- **Impact**: Meow hangs indefinitely when browse/search is attempted
- **Workaround**: Exclude browse/search from commands, use only local file operations (read, write, ls, grep, run)
- **Fix Needed**: Improve tool call regex parsing in `src/agent/agent.ts` to handle verbose LLM output

### 2. Subprocess Shadow Audit Mismatch (CRITICAL)
- **Symptom**: Meow delegates to Claude Code, Claude Code claims success, but Meow's shadow audit rejects the changes
- **Root Cause**: Meow's subprocess runs a diff check on its own files (package.json, etc.) rather than the delegated task files
- **Impact**: PDF generation and other delegated tasks fail silently despite Claude Code completing
- **Workaround**: Verify subprocess outputs manually
- **Fix Needed**: Meow's summoner should verify the actual task output, not its own repo state

### 3. browse/search Timeout (HIGH)
- **Symptom**: `browse` and `search` tools hang indefinitely because target sites are blocked/unreachable
- **Root Cause**: No AbortController/timeout on fetch calls, and network restrictions in the environment
- **Impact**: Meow freezes when attempting web access
- **Workaround**: Add 10s timeout to fetch calls (done), avoid browse/search in commands
- **Fix Needed**: Continue avoiding browse/search in agentic loops

### 4. write Tool Path Corruption (HIGH)
- **Symptom**: `write` tool receives corrupted paths like "150 scratch/Bifrost-task/answer.md" 
- **Root Cause**: Tool arguments parsing splits on ` | ` but LLM output contains " | " as prose
- **Impact**: File writes fail with ENOENT
- **Workaround**: Ensure commands don't contain " | " except as tool argument delimiter
- **Fix Needed**: More robust tool argument parsing

### 5. Respawn Not Wired to Heartbeat (MEDIUM)
- **Symptom**: Watchdog mechanism exists but agent never calls `kernel.pulse()`, so frozen agents aren't detected
- **Root Cause**: Agent's chat loop doesn't include heartbeat calls to kernel
- **Impact**: Frozen agents run forever without recovery
- **Workaround**: None - requires code fix
- **Fix Needed**: Add `kernel.pulse(process.pid)` periodically in agent chat loop

## Future Prevention
- [ ] Add a pre-commit hook that runs `bun run check`.
- [ ] Implement a "Semantic Cross-Check" for mission fulfillment.
- [ ] Fix tool call parsing to handle verbose LLM output
- [ ] Wire heartbeat into agent chat loop
- [ ] Fix shadow audit to check task output, not meow repo
