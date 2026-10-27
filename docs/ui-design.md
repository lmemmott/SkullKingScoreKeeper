# Skull King UI Design

Describes what each screen should look like and how it should behave. Game rules live in `rules.md`; this file covers the interface only.

## Assumptions

- **Scorekeeping only.** The app records bids, tricks, and bonuses, and calculates scores. Players use a physical Skull King deck. The app shows no cards, hands, or trick play.
- **One operator.** The scorekeeper runs the app on one device, at the table. Players are not expected to use it.
- **Bids are entered by the scorekeeper**, after players reveal them aloud or with fingers, so there is no secret-entry step.
- **No computer players.** The app has no AI opponents.
- **Games are saved on this device.** Every game is saved in the browser as it is played, so an interrupted game can be continued, and finished games stay in a history list. See **Saved Games and History**.

## General

- **Purpose first:** The app is used during play, so each screen does one job and the main action is always easy to reach.
- **Style:** Modern and professional, with a light nautical theme. Clean flat surfaces, generous spacing, rounded corners, and subtle shadows. Decoration comes from line art only (see **Art Direction**), never from textures, distressed fonts, or clip art.
- **No animations or sound in this version.** Screens change instantly, and the app makes no sounds. These may be added later.
- **Typography:** Professional fonts throughout. See **Art Direction** for the chosen fonts. Numbers are large and use tabular figures so columns line up.
- **Back arrow in the header:** Every in-game screen has a back arrow at the top left that goes to the previous screen, including screens in earlier rounds. See **Correcting Earlier Rounds**.
- **Game name in the header:** Every in-game screen shows the game's pirate name in the header, for example "Blackbeard · Round 4 of 10."
- **Color is never the only signal.** Met and missed bids also use words and symbols (for example, "Met" and "Missed by 2").
- **Accessibility:**
  - Text contrast of at least 4.5:1 against its background.
  - Every control is reachable by keyboard, with a visible focus ring.
  - Any animations added in a later version must respect `prefers-reduced-motion`.
  - Buttons are at least 44px tall, and steppers have large +/− targets.

## Art Direction

### Look and feel

- Modern and professional, like a well-made productivity app with a nautical accent.
- Plenty of white space, a clear grid, and consistent spacing in steps of 4px and 8px.
- Cards and panels have 12px rounded corners and soft, low shadows.
- Supports both light and dark mode, following the device setting.

### Colors

| Role | Light mode | Dark mode | Use |
|---|---|---|---|
| Navy | `#14213D` | `#0B1220` | Header bar, primary buttons |
| Surface | `#F8F6F1` (warm off-white) | `#162033` | Page and panel backgrounds |
| Ink | `#1C1F26` | `#E8EAF0` | Body text and line art |
| Gold | `#B8902F` | `#D4AF5A` | Accents, highlights, the winner's name |
| Success | `#2E7D4F` | `#5CC48A` | "Met" bids, totals that match |
| Error | `#B3261E` | `#F2867E` | "Missed" bids, validation errors |

All text and line art meet the 4.5:1 contrast rule in both modes. These colors are a starting point and can be tuned once the screens are built.

### Fonts

- **Titles and headings:** Cinzel. A classic serif with an engraved, nautical feel that still reads as professional. Used only for the app title and screen headings.
- **Everything else:** Inter. A clean, modern sans-serif built for screens. Use its tabular figures for every score and number.
- Both fonts are free (SIL Open Font License). Store them in `assets/fonts/` so the app works at a game table without internet.
- Fallbacks: `Georgia, serif` for headings and `system-ui, sans-serif` for everything else.

### Line art

All illustrations and icons are line art in one consistent style:

- Single-color strokes, 1.5px to 2px wide, with rounded ends and corners. No fills, gradients, or shading.
- Drawn in the Ink color by default, or Gold for celebratory moments, so they adapt to light and dark mode.
- Stored as SVG files in `assets/art/`.
- Decorative art is hidden from screen readers. Icons that act as buttons have text labels.

| Where | Line art |
|---|---|
| Title Screen | Skull-and-crown mark above the title, with a thin wave line below it |
| Game Setup | Small ship's wheel next to the heading |
| Start of Round | Fanned stack of cards beside "Deal N cards to each player" |
| Round in Play | Ship sailing on waves |
| Enter Results, bonus items | One small icon each: a "14" card, a black "14" card with a Jolly Roger flag, a mermaid, a pirate's hat, and a crown |
| Enter Results, discarded tricks | Kraken tentacle and whale tail |
| Round Score | Small check mark for "Met," small X for "Missed" (always with the words) |
| Game Over | Open treasure chest, drawn in Gold |
| Past Games, empty list | Ship in a bottle, with "No games played yet." |
| Section dividers | Thin rope line |
| Interface icons | Back arrow, delete (trash can), and scorecard (scroll), all in the same stroke style |

## Screens

### 1. Title Screen

- **Purpose:** Start a new game, continue an unfinished one, view past games, or read the rules.
- **Layout:**
  - Title "Skull King" centered, with a simple skull-and-crown mark above it.
  - Stacked buttons below the title. When a game is in progress, **Continue** is the first and most prominent button.
  - Small footer with a link to the rules.
- **Controls and actions:**
  - **Continue:** Shown only if a game is in progress. Labeled with the game's name and start time, for example "Continue Blackbeard, started Oct 27, 2026, 7:15 PM." Resumes at the screen where the game stopped. Hidden otherwise.
  - **New Game:** Goes to Game Setup. If a game is in progress, first asks: "Blackbeard is still in progress. Continue it, or start a new game?" Starting a new game leaves the old one in Past Games as "Unfinished," where it can still be continued.
  - **Past Games:** Goes to Past Games.
  - **How to Play:** Shows the rules from `rules.md` in plain language.

### 2. Game Setup

- **Purpose:** Choose the number of players and enter their names.
- **Layout:**
  - Heading "New Game."
  - The game's pirate name, chosen automatically (see **Game Names**), with a "New Name" button to pick a different one.
  - Player count selector from 2 to 7, as a row of number buttons.
  - One name field per player, labeled "Player 1," "Player 2," and so on. Blank names use the default label.
  - Helper text above the fields: "Enter players in seating order, going clockwise. Player 1 deals first."
  - A small reference table showing cards dealt per round (Round 1: 1 card through Round 10: 10 cards).
  - "Start Game" button, fixed at the bottom on phones.
- **Controls and actions:**
  - Changing the player count adds or removes name fields.
  - **Start Game:** Saves the new game with its name, players, and the current date and time as its start time. Goes to Start of Round for round 1, with the dealer set to the first player.
  - **Back:** Returns to the Title Screen.

### 3. Start of Round

- **Purpose:** Confirm the round before the physical deal and bidding.
- **Layout:**
  - Header: "Round N of 10."
  - Large text: "Deal N cards to each player."
  - "Dealer: [name]," since the deal passes left each round.
  - Running scoreboard showing each player's total so far.
- **Controls and actions:**
  - **Start Bidding:** Goes to Enter Bids.

### 4. Enter Bids

- **Purpose:** Record each player's bid.
- **Layout:**
  - Header: "Round N of 10, N cards dealt."
  - One row per player with their name and a bid selector showing 0 to N. Players are listed in the order their names were entered on Game Setup, every round.
  - A progress line: "Bids entered: 3 of 5."
- **Rules enforced:**
  - Each bid must be a whole number from 0 to the cards dealt.
  - Every player must have a bid before continuing. Missing bids are highlighted.
  - Bids can be changed until the round is confirmed.
- **Controls and actions:**
  - **Confirm Bids:** Enabled only when every bid is entered. Goes to Round in Play.

### 5. Round in Play

- **Purpose:** A resting screen while the round is played with physical cards.
- **Layout:**
  - Header: "Round N in play."
  - A compact list of every player's bid, so the scorekeeper can check it.
  - Short note: "Enter results when all tricks are played."
- **Controls and actions:**
  - **Enter Results:** Goes to Enter Results.
  - **Edit Bids:** Returns to Enter Bids.

### 6. Enter Results

- **Purpose:** Record tricks taken and bonus captures for each player.
- **Layout:**
  - Header: "Round N results," with the cards dealt.
  - A "Discarded tricks" stepper at the top, for tricks discarded by the Kraken or White Whale. It ranges from 0 to the cards dealt and defaults to 0.
  - A running total below it: "Tricks entered: 3 taken + 1 discarded = 4 of 4." It turns green when it matches the cards dealt.
  - One card per player, showing their name, bid, and:
    - **Tricks taken:** a stepper from 0 to N.
    - **Bonuses:** a collapsed section that expands to show:
      - Colored 14s captured (count, 0 to 3)
      - Black 14 captured (yes/no)
      - Mermaids captured with a Pirate, including a Tigress played as a Pirate (count, 0 to 2)
      - Pirates captured with the Skull King, including a Tigress played as a Pirate (count, 0 to 6)
      - Skull King captured with a Mermaid (yes/no)
- **Rules enforced:**
  - Tricks taken plus discarded tricks must equal the cards dealt. If not, the total is shown in red and "Review Results" is blocked with a clear message, for example "Tricks entered: 5 of 4. Reduce by 1."
  - Bonus counts stay within the limits above. Values beyond them cannot be entered.
  - Bonuses are also limited across all players in the round, as listed in `rules.md`. For example, only one player can have the Black 14, and colored 14s total at most 3. When a limit is reached, the matching control is disabled for everyone else, with a note such as "Black 14 already given to Anna."
  - Pirates captured with the Skull King and Skull King captured with a Mermaid cannot both be entered in the same round. Entering one disables the other for all players.
  - Players with 0 tricks taken have their Bonuses section disabled, with the note "No bonuses with no tricks taken." Any bonus values already entered for them are cleared.
  - Bonuses are optional entries. The Round Score screen shows when a bonus was ignored because the bid was missed.
  - Players who bid zero have their Bonuses section disabled, with the note "No bonuses on a zero bid."
- **Controls and actions:**
  - **Review Results:** Enabled only when tricks taken plus discarded tricks equal the cards dealt. Goes to Round Score.
  - **Back:** Returns to Round in Play.

### 7. Round Score

- **Purpose:** Show how each player scored this round, so the scorekeeper can check it before confirming.
- **Layout:**
  - Header: "Round N Scores."
  - A table with one row per player:
    - Bid and tricks taken
    - Result: "Met," "Missed by N," "Zero met," or "Zero missed"
    - Base points
    - Bonus items, listed separately (for example, "Mermaid with Pirate +20")
    - Round total
    - Running total
  - Missed bids show the penalty clearly, for example "Bid 3, took 1, −20."
  - If any tricks were discarded, a line under the table says so, for example "1 trick discarded (Kraken or White Whale)."
  - Bonuses ignored because the bid was missed are shown as "Bonus not scored: bid missed."
- **Controls and actions:**
  - **Edit Results:** Returns to Enter Results with values kept.
  - **Edit Bids:** Returns to Enter Bids with values kept.
  - **Confirm and Continue:** Saves the round. Goes to Start of Round for the next round, with the dealer moved left.
  - After round 10, the button reads "See Final Results" and goes to Game Over.
  - **Scorecard:** Toggles a view of every round's scores so far. Tapping a round in the scorecard opens that round for correction.
  - When this screen shows an earlier round being corrected, **Confirm and Continue** is replaced by **Return to Round N**, which saves the changes and goes back to the screen where the scorekeeper left off.

### 8. Game Over

- **Purpose:** Announce the winner and show final standings.
- **Layout:**
  - Heading "Game Over" and the winner's name.
  - Final standings, ranked by total points.
  - Full score history by round, in the same table layout as Round Score.
- **Controls and actions:**
  - **Play Again:** Goes to Game Setup with the same players pre-filled and a new pirate name.
  - **Title Screen:** Returns to the Title Screen.
  - Ties are not broken. All players tied for the highest score are shown as co-winners, for example "Winners: Anna and Ben."
  - Reaching this screen marks the game "Finished" in Past Games.

### 9. Past Games

- **Purpose:** Show the running list of every game played on this device.
- **Layout:**
  - Heading "Past Games."
  - A list, newest first. Each entry shows:
    - Pirate name, for example "Calico Jack"
    - Date and time the game started, for example "Oct 27, 2026, 7:15 PM"
    - Status: "In progress," "Unfinished," or "Finished"
    - Player names
    - For finished games, the winner or co-winners and their score. For other games, the last round completed, for example "Stopped after round 6."
  - If there are no games yet: "No games played yet."
- **Controls and actions:**
  - **Tap a finished game:** Opens its full score history, read-only, in the same table layout as Game Over.
  - **Tap an in-progress or unfinished game:** Opens the same score history with a **Continue** button that resumes the game where it stopped.
  - **Delete:** Each game's detail view has a **Delete Game** button. It asks for confirmation first: "Delete Calico Jack, started Oct 27, 2026, 7:15 PM? This cannot be undone." Deleting the game in progress also removes **Continue** from the Title Screen.
  - The heading shows the count of saved games, for example "Past Games (42 of 1,000)."
  - **Back:** Returns to the Title Screen.

## Saved Games and History

- **Saved automatically.** The game is saved after each confirmed step: Start Game, Confirm Bids, and Confirm and Continue. Values being entered on a screen are saved too, so a refresh does not lose them.
- **Resuming.** When the app is opened or refreshed with a game in progress, the Title Screen shows **Continue** for that game.
- **One active game.** Only one game is "In progress" at a time. Starting a new game moves the previous one to "Unfinished." Continuing an unfinished game makes it the active game again.
- **Kept until deleted.** Games stay in Past Games until the scorekeeper deletes them.
- **Limit of 1,000 saved games.** If 1,000 games are saved, **Start Game** asks before going on: "You have 1,000 saved games. Delete the oldest game (Calico Jack, started Oct 27, 2026, 7:15 PM) to make room?" Choosing **Delete and Start** removes that game and starts the new one. Choosing **Cancel** returns to Game Setup without starting. Games are never deleted without the scorekeeper's confirmation.
- **Storage size.** Each saved game must be stored compactly, so 1,000 games fit within the browser's storage limit for the site.
- **Stored in the browser on this device.** History is not shared across devices or browsers. Clearing the browser's site data deletes it.

## Correcting Earlier Rounds

The scorekeeper can go back to any earlier round in the current game to fix a mistake.

- **Two ways back:**
  - **Back arrow:** Steps back one screen at a time. Going back from Start of Round opens the previous round's Round Score.
  - **Scorecard:** Tapping a round jumps straight to that round's Round Score.
- **Correction mode:** An earlier round opens on its Round Score screen with a banner: "Correcting round 3. Current round: 6." From there, **Edit Bids** and **Edit Results** open the round's entries with the saved values. The same validation rules apply as during play.
- **Totals recalculate automatically.** Changing a round updates that round's scores and every running total after it. Later rounds' bids and results are not changed.
- **Returning:** **Return to Round N** saves the correction and goes back to the screen where the scorekeeper left off. Nothing entered on later rounds is lost.
- **Finished games:** Game Over has the same back arrow and scorecard, so a mistake can be fixed before leaving the screen. The winner is recalculated after any correction.

## Game Names

- Each game is named after a historical pirate, chosen at random when Game Setup opens.
- Names are not reused until every name in the list has been used. After that, a Roman numeral is added, for example "Blackbeard II."
- Name list: Blackbeard, Anne Bonny, Mary Read, Calico Jack, Black Bart, Captain Kidd, Henry Morgan, Grace O'Malley, Ching Shih, Stede Bonnet, Jean Lafitte, Edward Low, Charles Vane, Black Sam Bellamy, Henry Every, Thomas Tew, Benjamin Hornigold, Olivier Levasseur, Barbarossa, Francis Drake.

## Responsive Behavior

- **Phone (under 600px), the primary layout:**
  - One player per card, stacked vertically.
  - Steppers are large, with the value shown between the +/− buttons.
  - Fixed action button at the bottom of each screen.
  - 16px side gutter. No horizontal page scroll.
- **Tablet (600px to 1023px):** Player rows become a two-column grid on the Enter Results and Enter Bids screens.
- **Desktop (1024px and wider):** Score tables use full table layout, with the running total always visible.

## Open Questions

None at this time.
