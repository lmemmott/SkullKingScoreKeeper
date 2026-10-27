# Skull King

A static HTML/CSS/JavaScript browser game based on the Skull King trick-taking card game.

## Status

Early scaffold. Game design and features are still to be defined.

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
