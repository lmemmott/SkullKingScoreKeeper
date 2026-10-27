# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Skull King: a static HTML/CSS/JavaScript scorekeeping app for the Skull King trick-taking card game. Players use a physical deck. The app is run by one scorekeeper, who enters bids, tricks taken, and bonus captures, and the app calculates scores. The app does not deal, display, or enforce cards.

- Game rules are in `docs/rules.md`. Screen designs are in `docs/ui-design.md`. Treat these as the source of truth.
- Do not invent game rules. Ask when a rule is unclear, and list it under Open Questions in the relevant doc.

## Conventions

- Static site only. No build step, no package manager, and no runtime dependencies unless the user approves them.
- Keep files plain and readable: HTML in `index.html`, styles in `css/`, scripts in `js/`, static files in `assets/`.
- Use ES2015+ JavaScript with `"use strict";` at the top of script files.
- Use 4-space indentation in HTML, CSS, and JavaScript.
- Prefer small, focused modules over one large script as the game grows. Load each new script with a `<script>` tag in `index.html` until a module system is chosen.
- Test changes by opening `index.html` in a browser or serving the folder locally.

## Git

- Default branch is `master`. The current local branch is `master`, with no commits yet.
- Commit only when asked.
