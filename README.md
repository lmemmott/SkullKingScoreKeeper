# Skull King

A static HTML/CSS/JavaScript scorekeeping app for the Skull King trick-taking card game.

Players use a physical Skull King deck. The app is run by one scorekeeper, who records each player's bids, tricks taken, and bonus captures, and the app calculates the scores. The app does not deal or display cards.

## Status

Working scorekeeper. Games can be set up, scored round by round, corrected, and saved in the browser. The screens follow `docs/ui-design.md`, and the rules are in `docs/rules.md`.

Not yet built: the illustrations listed in `docs/ui-design.md` beyond the title mark, cards, chest, and icons, and the Export and Import ideas for later.

## Documentation

- `docs/rules.md`: Skull King rules and the scorekeeper's duties.
- `docs/ui-design.md`: Screen-by-screen design for the scorekeeping app.

## Project structure

```
SkullKingGame/
├── index.html      Entry page
├── css/
│   └── style.css   Styles
├── js/
│   └── main.js     Game logic entry point
├── assets/         Images, sounds, and other static files
├── README.md
├── CLAUDE.md
└── .gitignore
```

## Running the game

No build step or dependencies. The app runs on a local web server using Python 3.

1. Install Python 3 if it is not already installed.
2. From the project folder, start the server:

   ```
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in the browser.
4. Stop the server with Ctrl+C when finished.

**Always use the same address.** Saved games are stored in the browser, tied to the exact address `http://localhost:8000`. Using a different port (such as 8080) or `127.0.0.1` instead of `localhost` opens an empty game history. The old games are not lost, but they only appear again at the original address.

## Development

- Plain HTML, CSS, and JavaScript. No frameworks or bundlers unless decided later.
- See `CLAUDE.md` for conventions used when working on this project.
