# Memory Protocol

When the user corrects Codex or asks Codex to remember something about this project, save it as its own markdown file inside the project root's `memory/` folder.

Use these filename prefixes:

- `user_` for how the user personally works.
- `project_` for this specific project.
- `feedback_` for corrections to Codex behavior.
- `reference_` for links, facts, or external context to remember.

Maintain `memory/MEMORY.md` as the index of all memory files, with a one-line summary for each rule so the right context loads in future sessions.

Maintain `memory/lessons.md` as a narrative log of strategic learnings. When the user calls something a lesson, or when the same kind of correction repeats, append an entry covering what happened, why it was wrong, what changed, and the deeper principle.

Maintain `tasks/todo.md` as the active sprint plan. Plan work there before building and mark items complete as they ship.

At the start of every new session, read:

- `memory/MEMORY.md`
- `memory/lessons.md`
- `tasks/todo.md`
