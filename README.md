# Skull King

A static HTML/CSS/JavaScript scorekeeping app for the Skull King trick-taking card game.

Players use a physical Skull King deck. The app is run by one scorekeeper, who records each player's bids, tricks taken, and bonus captures, and the app calculates the scores. The app does not deal or display cards.

## Status

Early scaffold. The scorekeeping screens are designed in `docs/ui-design.md`, and the rules are in `docs/rules.md`. Implementation has not started.

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

No build step or dependencies. Open `index.html` in a browser, or serve the folder with any static file server, for example:

```
npx serve .
```

or

```
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Development

- Plain HTML, CSS, and JavaScript. No frameworks or bundlers unless decided later.
- See `CLAUDE.md` for conventions used when working on this project.
