# Skull King Rules

Rules of the game. Based on the published rules summarized at gamerules.com. Items under **Open Questions** still need a decision.

**How the app fits in:** Players deal, play, and win tricks with a physical Skull King deck. The app is for the scorekeeper only. It records bids, tricks taken, and bonus captures, and it calculates scores. It does not deal, display, or enforce cards.

## Overview

- **Players:** 2 to 7. The 72-card deck cannot deal 10 cards each to 8 players (80 cards), so the app supports at most 7.
- **Rounds:** 10
- **Objective:** Have the most points after the final round.
- **Type:** Trick-taking. Each round, players bid on how many tricks they will win, then try to win exactly that many.

## Deck

This game uses 72 cards: the 70 base cards plus the Kraken and White Whale expansion cards.

**Numbered cards (56):** four suits of 14 cards each, numbered 1 to 14.

| Suit | Color | Notes |
|---|---|---|
| Parrots | Green | |
| Maps | Purple | |
| Treasure Chests | Yellow | |
| Jolly Rogers | Black | Always trump |

**Special cards (14):**

| Card | Count | Notes |
|---|---|---|
| Escape | 5 | Lowest-ranking card |
| Pirate | 5 | |
| Tigress | 1 | Played as either an Escape or a Pirate, declared when played |
| Skull King | 1 | |
| Mermaid | 2 | |
| Kraken | 1 | Expansion card, included in this game |
| White Whale | 1 | Expansion card, included in this game |

**Excluded cards:** The 2 Loot expansion cards and any blank cards. Remove these before play.

## Setup

1. Remove the Loot cards and blank cards. Keep the Kraken and White Whale in the deck.
2. Choose a scorekeeper. The scorekeeper runs the app and records all bids, results, and scores.
3. Enter the players' names in the app in seating order, going clockwise. The first player entered deals the first round. The deal passes to the left (the next player in the list) after each round.

## Rounds

- The game has 10 rounds.
- Round 1 deals 1 card to each player.
- Round N deals N cards to each player, so round 10 deals 10 cards each.
- After each round, collect all cards, reshuffle the full deck, and deal again to the left.

## Scorekeeper Duties

1. **Start of round:** Confirm the round number, the number of cards dealt, and the dealer.
2. **Bids:** Enter each player's bid. Each bid must be between 0 and the number of cards dealt.
3. **End of round:** Enter the number of tricks each player took, and the number of tricks discarded by the Kraken or White Whale. Tricks taken plus tricks discarded must equal the number of cards dealt, because each card dealt makes one trick.
4. **Bonuses:** Enter any bonus captures each player made this round (see Bonus points below).
5. **Review:** Check the round results and confirm them before starting the next round.

## Bidding

- All players bid at the same time. Players pound the table three times while saying "yo ho ho," and on the third pound everyone reveals their bid by holding up fingers.
- Bids of 6 or more are said aloud as a number.
- A bid is the number of tricks the player expects to win. A bid of 0 is allowed.
- The scorekeeper enters the bids in the app in the order the player names were entered at the start of the game.

## Playing Tricks

_Played with physical cards. The app does not enforce these rules; they are reference for players._

- The player to the dealer's left leads the first trick. The winner of each trick leads the next.
- Players must follow the lead suit if they can.
- If a player cannot follow suit, they may play any card, including trump or a special card.
- Special cards may be played instead of following suit. A player is never forced to play a special card unless it is their only card type left.

### Trick-winning precedence

From highest to lowest:

1. **Mermaid.** Beats all numbered cards and the Skull King. Loses to any Pirate other than the Skull King. If two Mermaids are played, the first one played wins.
2. **Skull King.** Beats all Pirates and numbered cards. Loses to a Mermaid.
3. **Pirate** (including a Tigress played as a Pirate). Beats all numbered cards, including trump. If several Pirates are played and nothing higher, the first one played wins.
4. **Black (trump) numbered card.** Beats all non-trump numbered cards. If several trump cards are played, the highest wins.
5. **Numbered card of the lead suit.** The highest card of the lead suit wins if no trump is played.
6. **Escape** (including a Tigress played as an Escape). Always loses, unless every player plays an Escape. In that case, the first Escape played wins.

### Resolving a trick

Cards are compared in the order they are played. Each new card is compared only against the card currently winning the trick. If it beats that card, it becomes the winning card. Otherwise, the current winner stays.

Because of this, the order of play matters when a Pirate, the Skull King, and a Mermaid are in the same trick:

- **Pirate, then Skull King, then Mermaid:** The Skull King beats the Pirate and takes the lead. The Mermaid then beats the Skull King. **The Mermaid wins.**
- **Mermaid, then Pirate, then Skull King:** The Pirate beats the Mermaid and takes the lead. The Skull King then beats the Pirate. **The Skull King wins.**

### Kraken and White Whale

These two cards change how a trick is resolved instead of beating other cards. Like other special cards, they may be played instead of following suit.

- **Kraken:** The trick is discarded. Nobody wins it, and nobody earns bonuses from cards in it. The player whose card would have won the trick without the Kraken leads the next trick.
- **White Whale:** All other special cards in the trick lose their power. The highest numbered card wins, regardless of suit. If two cards tie for the highest number, the first one played wins. If the trick has no numbered cards, it is discarded and nobody wins it. The player who played the White Whale leads the next trick.
- **Both in one trick:** The one played second determines the effect.

A discarded trick still counts as one of the round's tricks, so in a round with a discarded trick, the players' tricks taken add up to fewer than the cards dealt.

### Leading

- **Leading with a numbered card:** That card's suit becomes the lead suit.
- **Leading with an Escape:** The lead suit is set by the first numbered card played after it. If none is played, there is no lead suit.
- **Leading with a Pirate, Mermaid, or Skull King (or a Tigress played as a Pirate):** No suit is set. Other players may play any card.

## Scoring

Scoring is done at the end of each round. The app calculates scores from the entered bids, tricks taken, and bonus captures.

### Bid met

- **+20 points** for each trick bid and taken.
- Eligible for bonus points (see below).

### Bid missed (non-zero bid)

- **−10 points** for each trick the player was over or under the bid.
- No bonus points.

### Zero bid

- Win no tricks: **+10 × cards dealt** this round.
- Win any trick: **−10 × cards dealt** this round.
- A zero bid never earns bonus points. Bonuses come from capturing cards in tricks, so a player who meets a zero bid has nothing to earn them with.

### Bonus points (only if a non-zero bid was met)

Bonuses are earned only for cards in tricks the player wins. Cards in a discarded trick earn no bonuses, and a player who took no tricks earns no bonuses.

Each card exists only once in the deck, so bonuses are limited across all players in a round:

- Colored 14s: at most 3 in total.
- Black 14: at most 1 player.
- Mermaids captured with a Pirate: at most 2 in total.
- The Skull King can win at most one trick per round, so only one player can score Pirates captured with the Skull King.
- Skull King captured with a Mermaid: at most 1 player.
- The Skull King either captures Pirates or is captured by a Mermaid, never both in the same round.

| Capture | Bonus | Entered in app as |
|---|---|---|
| Yellow, Purple, or Green 14 | +10 each | Count of colored 14s captured |
| Black 14 (Jolly Rogers) | +20 | Yes/no |
| A Mermaid captured with a Pirate (a Tigress played as a Pirate counts) | +20 each | Count of Mermaids captured (0 to 2) |
| A Pirate captured with the Skull King (a Tigress played as a Pirate counts) | +30 each | Count of Pirates captured, including a Tigress played as a Pirate (0 to 6) |
| The Skull King captured with a Mermaid | +40 | Yes/no |

## Ending the Game

- After 10 rounds, the player with the highest total score wins.
- Ties are not broken. If players tie for the highest score, all of them are reported as winners.

## Open Questions

None at this time.

## Source

- [Skull King rules summary, gamerules.com](https://gamerules.com/rules/skull-king/)
- [Skull King game help, Board Game Arena](https://en.doc.boardgamearena.com/Gamehelpskullking) (Kraken and White Whale)
