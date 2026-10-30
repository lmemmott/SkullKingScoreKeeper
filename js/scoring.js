// Skull King scoring rules (see docs/rules.md). Pure functions, no DOM access.
"use strict";

const Scoring = (() => {
    const MAX_ROUNDS = 10;
    const MAX_PLAYERS = 7;
    const MIN_PLAYERS = 2;

    const POINTS_PER_TRICK = 20;
    const PENALTY_PER_TRICK = 10;
    const ZERO_BID_POINTS = 10;
    const BONUS_COLORED_14 = 10;
    const BONUS_BLACK_14 = 20;
    const BONUS_MERMAID_WITH_PIRATE = 20;
    const BONUS_PIRATE_WITH_SKULL_KING = 30;
    const BONUS_SKULL_KING_WITH_MERMAID = 40;

    const MAX_COLORED_14 = 3;
    const MAX_MERMAIDS = 2;
    const MAX_PIRATES = 6;

    function emptyBonuses() {
        return {
            colored14: 0,
            black14: false,
            mermaidWithPirate: 0,
            pirateWithSkullKing: 0,
            skullKingWithMermaid: false
        };
    }

    // A round holds one entry per player, in seating order. Values are null until entered.
    function newRound(playerCount) {
        return {
            bids: Array(playerCount).fill(null),
            taken: Array(playerCount).fill(null),
            discarded: 0,
            bonuses: Array.from({ length: playerCount }, emptyBonuses),
            confirmed: false
        };
    }

    function hasBonus(bonuses) {
        return bonuses.colored14 > 0
            || bonuses.black14
            || bonuses.mermaidWithPirate > 0
            || bonuses.pirateWithSkullKing > 0
            || bonuses.skullKingWithMermaid;
    }

    // Scores one player for one round. Requires bid and taken to be entered.
    function scorePlayer(round, index, cards) {
        const bid = round.bids[index] || 0;
        const taken = round.taken[index] || 0;
        const bonuses = round.bonuses[index];

        const score = {
            bid,
            taken,
            result: "",
            missBy: 0,
            basePoints: 0,
            bonusItems: [],
            bonusIgnored: false,
            total: 0
        };

        if (bid === 0) {
            score.result = taken === 0 ? "zeroMet" : "zeroMissed";
            score.basePoints = taken === 0 ? ZERO_BID_POINTS * cards : -ZERO_BID_POINTS * cards;
        } else if (taken === bid) {
            score.result = "met";
            score.basePoints = POINTS_PER_TRICK * bid;
            score.bonusItems = bonusItemsFor(bonuses);
        } else {
            score.result = "missed";
            score.missBy = Math.abs(taken - bid);
            score.basePoints = -PENALTY_PER_TRICK * score.missBy;
            score.bonusIgnored = hasBonus(bonuses);
        }

        score.total = score.basePoints + score.bonusItems.reduce((sum, item) => sum + item.points, 0);
        return score;
    }

    function bonusItemsFor(bonuses) {
        const items = [];
        if (bonuses.colored14 > 0) {
            items.push({ label: `Colored 14 ×${bonuses.colored14}`, points: BONUS_COLORED_14 * bonuses.colored14 });
        }
        if (bonuses.black14) {
            items.push({ label: "Black 14", points: BONUS_BLACK_14 });
        }
        if (bonuses.mermaidWithPirate > 0) {
            items.push({
                label: `Mermaid with Pirate ×${bonuses.mermaidWithPirate}`,
                points: BONUS_MERMAID_WITH_PIRATE * bonuses.mermaidWithPirate
            });
        }
        if (bonuses.pirateWithSkullKing > 0) {
            items.push({
                label: `Pirate with Skull King ×${bonuses.pirateWithSkullKing}`,
                points: BONUS_PIRATE_WITH_SKULL_KING * bonuses.pirateWithSkullKing
            });
        }
        if (bonuses.skullKingWithMermaid) {
            items.push({ label: "Skull King with Mermaid", points: BONUS_SKULL_KING_WITH_MERMAID });
        }
        return items;
    }

    // Checks tricks entered against cards dealt. Returns a message when they do not match.
    function checkTricks(round, cards) {
        const taken = round.taken.reduce((sum, value) => sum + (value || 0), 0);
        const total = taken + round.discarded;
        if (round.taken.some((value) => value === null)) {
            return { ok: false, total, message: "Enter tricks taken for every player." };
        }
        if (total === cards) {
            return { ok: true, total, message: "" };
        }
        const difference = total - cards;
        const direction = difference > 0 ? "Reduce" : "Add";
        const amount = Math.abs(difference);
        return {
            ok: false,
            total,
            message: `Tricks entered: ${total} of ${cards}. ${direction} by ${amount}.`
        };
    }

    function tricksMessage(round, cards) {
        const check = checkTricks(round, cards);
        return check.ok ? `Tricks entered: ${check.total} of ${cards}.` : check.message;
    }

    // Sets which bonus controls a player may use, given what the others already hold this round.
    function bonusLimits(round, index) {
        const others = round.bonuses.filter((_, i) => i !== index);
        const mine = round.bonuses[index];
        const pirateHeldByAnyone = round.bonuses.some((b) => b.pirateWithSkullKing > 0);
        const skullKingWithMermaidHeldByAnyone = round.bonuses.some((b) => b.skullKingWithMermaid);

        const pirateAllowed = !others.some((b) => b.pirateWithSkullKing > 0) && !skullKingWithMermaidHeldByAnyone;
        const skullKingWithMermaidAllowed = !others.some((b) => b.skullKingWithMermaid) && !pirateHeldByAnyone;

        return {
            colored14Max: MAX_COLORED_14 - others.reduce((sum, b) => sum + b.colored14, 0),
            black14Allowed: mine.black14 || !others.some((b) => b.black14),
            mermaidMax: MAX_MERMAIDS - others.reduce((sum, b) => sum + b.mermaidWithPirate, 0),
            pirateAllowed,
            pirateMax: pirateAllowed ? MAX_PIRATES : mine.pirateWithSkullKing,
            skullKingWithMermaidAllowed: mine.skullKingWithMermaid || skullKingWithMermaidAllowed
        };
    }

    // Removes bonus entries that cannot count: zero bids and players who took no tricks.
    function clearIneligibleBonuses(round) {
        round.bonuses.forEach((bonuses, i) => {
            const bid = round.bids[i];
            const taken = round.taken[i];
            if (bid === 0 || taken === 0) {
                round.bonuses[i] = emptyBonuses();
            }
        });
    }

    function roundTotals(round, cards) {
        return round.bids.map((_, i) => scorePlayer(round, i, cards).total);
    }

    // Running totals after the given round (1-based), one value per player.
    function runningTotals(game, throughRound) {
        const totals = game.players.map(() => 0);
        for (let r = 1; r <= throughRound; r += 1) {
            const round = game.rounds[r - 1];
            if (!round) {
                break;
            }
            roundTotals(round, r).forEach((value, i) => {
                totals[i] += value;
            });
        }
        return totals;
    }

    function winners(game) {
        const totals = runningTotals(game, MAX_ROUNDS);
        const best = Math.max(...totals);
        return game.players.filter((_, i) => totals[i] === best);
    }

    return {
        MAX_ROUNDS,
        MAX_PLAYERS,
        MIN_PLAYERS,
        MAX_COLORED_14,
        newRound,
        emptyBonuses,
        scorePlayer,
        checkTricks,
        tricksMessage,
        bonusLimits,
        clearIneligibleBonuses,
        roundTotals,
        runningTotals,
        winners
    };
})();
