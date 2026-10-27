# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Skull King: a static HTML/CSS/JavaScript browser game based on the Skull King trick-taking card game. Game rules, features, and design are still to be defined by the user. Do not invent game rules; ask when a rule is unclear.

## Conventions

- Static site only. No build step, no package manager, and no runtime dependencies unless the user approves them.
- Keep files plain and readable: HTML in `index.html`, styles in `css/`, scripts in `js/`, static files in `assets/`.
- Use ES2015+ JavaScript with `"use strict";` at the top of script files.
- Use 4-space indentation in HTML, CSS, and JavaScript.
- Prefer small, focused modules over one large script as the game grows. Load each new script with a `<script>` tag in `index.html` until a module system is chosen.
- Test changes by opening `index.html` in a browser or serving the folder locally.

## Git

- Default branch is `main`. The current local branch is `master`, with no commits yet.
- Commit only when asked.
