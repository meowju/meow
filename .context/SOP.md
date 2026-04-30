# MEOW Standard Operating Procedures (SOP)

Follow these rules to ensure high productivity and zero "Useless Commits."

## 1. The "Think-Plan-Verify" Loop
Before writing any code:
1.  **Grep/Read**: Ensure you understand the existing implementation.
2.  **Plan**: Write a brief strategy in `scratch/PLAN.md`. This directory is git-ignored. **DO NOT COMMIT THE PLAN.**
3.  **Execute**: Make the change.
4.  **Verify**: ALWAYS run `bun run check` (or `tsc --noEmit`) before declaring success.

## 2. Commit Standards
- **Atomic Commits**: One feature/fix per commit.
- **No Checkpoints**: Do not commit "WIP" or "working on it" states.
- **Commit Messages**: Should be descriptive. Example: `feat(audio): implement silence suppression in merger`.

## 3. Handling Hallucinations
- If you find yourself searching for a file that doesn't exist more than twice, **STOP**.
- List your assumptions and ask the user for clarification.
- Do not "invent" APIs or tools that aren't listed in the project extensions.

## 4. Environment Context
- We use **Bun** as the runtime.
- We use **TypeScript** with strict typing.
- We use **SQLite-vec** for vector operations.
- Avoid adding new dependencies unless absolutely necessary.

## 5. Adding New Skills
To add a new skill:
1. Create a directory in `skills/`.
2. Create a `SKILL.md` with appropriate YAML frontmatter.
3. Ensure the description is searchable for the `SkillManager`.
