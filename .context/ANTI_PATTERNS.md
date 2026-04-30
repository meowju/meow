# MEOW Anti-Patterns & Lessons Learned

This document tracks recurring mistakes or "hallucination triggers" to prevent them from happening again.

## Current Hallucination Triggers
- **Sync I/O**: Do not use `fs.readFileSync` in the kernel. It blocks the heartbeat. Use `fs/promises`.
- **Placeholder Skills**: Some skills are just frontmatter without content. Always check the `body` before assuming a skill is functional.
- **SQLite Wavefunction Collapse**: Avoid zero-length vectors in embeddings. They cause SQLite-vec to error out. Use the `0.0001` noise floor.

## Git Mistakes
- **Useless Commits**: Avoid committing after every tool call. Wait until the mission is verified.
- **Refactor Bloat**: Do not "clean up" `node_modules` or unrelated config files during a feature task.

## Future Prevention
- [ ] Add a pre-commit hook that runs `bun run check`.
- [ ] Implement a "Semantic Cross-Check" for mission fulfillment.
