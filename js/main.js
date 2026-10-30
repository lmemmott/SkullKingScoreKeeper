// Skull King entry point: screens, navigation, and the scorekeeping flow.
// Uses Scoring, PirateNames, and GameStorage from the other scripts loaded before this one.
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("game");
    const MAX_ROUNDS = Scoring.MAX_ROUNDS;

    let data = GameStorage.load();
    const ui = {
        view: "title",        // title, setup, rules, history, historyDetail, game
        gameId: null,         // the game shown in the "game" view
        historyId: null,      // the game shown in the "historyDetail" view
        setup: null,          // { count, names, chosen, reuseOf } while on the setup screen
        openBonus: new Set(), // player indexes whose Bonuses section is expanded
        scorecard: false,     // scorecard panel on the Round Score screen
        notice: ""
    };

    // ---------- Helpers ----------

    function esc(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatDate(iso) {
        return new Date(iso).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function cardsWord(count) {
        return count === 1 ? "1 card" : `${count} cards`;
    }

    function signed(points) {
        if (points > 0) {
            return `+${points}`;
        }
        if (points < 0) {
            return `−${Math.abs(points)}`;
        }
        return "0";
    }

    function joinNames(names) {
        if (names.length <= 1) {
            return names.join("");
        }
        if (names.length === 2) {
            return `${names[0]} and ${names[1]}`;
        }
        return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
    }

    function statusLabel(game) {
        if (game.status === "in-progress") {
            return "In progress";
        }
        if (game.status === "unfinished") {
            return "Unfinished";
        }
        return "Finished";
    }

    function completedRounds(game) {
        return game.rounds.filter((round) => round.confirmed).length;
    }

    function clampValue(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function holderName(game, round, exceptIndex, predicate) {
        const index = round.bonuses.findIndex((bonuses, i) => i !== exceptIndex && predicate(bonuses));
        return index >= 0 ? game.players[index] : null;
    }

    function saveData() {
        if (!GameStorage.save(data)) {
            ui.notice = "This browser could not save the game. Changes may be lost on refresh.";
        }
    }

    function currentGame() {
        return GameStorage.findGame(data, ui.gameId);
    }

    // ---------- Navigation ----------

    // Moves the game to a screen. Going to an earlier round starts a correction
    // and remembers where the scorekeeper left off, so Return can go back there.
    function go(game, screen, round) {
        if (round < game.current) {
            if (!game.resume) {
                game.resume = { screen: game.screen, round: game.viewRound };
            }
        } else {
            game.resume = null;
        }
        if (game.rounds.length < round) {
            game.rounds.push(Scoring.newRound(game.players.length));
        }
        if (screen === "results") {
            const roundData = game.rounds[round - 1];
            roundData.taken = roundData.taken.map((value) => (value === null ? 0 : value));
        }
        game.screen = screen;
        game.viewRound = round;
        ui.openBonus.clear();
        ui.scorecard = false;
        saveData();
        render();
    }

    function showGame(game) {
        if (!game) {
            return;
        }
        ui.view = "game";
        ui.gameId = game.id;
        render();
    }

    function showTitle() {
        ui.view = "title";
        render();
    }

    function goBack(game) {
        const round = game.viewRound;
        switch (game.screen) {
            case "startRound":
                if (round > 1) {
                    go(game, "roundScore", round - 1);
                } else {
                    showTitle();
                }
                break;
            case "bids":
                go(game, "startRound", round);
                break;
            case "results":
                go(game, "bids", round);
                break;
            case "roundScore":
                go(game, "results", round);
                break;
            case "gameOver":
                go(game, "roundScore", MAX_ROUNDS);
                break;
            default:
                showTitle();
        }
    }

    function confirmRound(game) {
        const round = game.viewRound;
        game.rounds[round - 1].confirmed = true;
        if (round >= MAX_ROUNDS) {
            game.status = "finished";
            game.resume = null;
            go(game, "gameOver", MAX_ROUNDS);
            return;
        }
        game.current = round + 1;
        go(game, "startRound", round + 1);
    }

    function returnToResume(game) {
        const resume = game.resume;
        game.resume = null;
        go(game, resume.screen, resume.round);
    }

    // ---------- Dialog ----------

    // Shows a modal with buttons. Resolves with the value of the button chosen, or "" if dismissed.
    function ask(message, options) {
        return new Promise((resolve) => {
            const dialog = document.createElement("dialog");
            dialog.className = "dialog";
            const buttons = options.map((option) => (
                `<button type="submit" value="${esc(option.value)}" class="button${option.primary ? " primary" : ""}">${esc(option.label)}</button>`
            )).join("");
            dialog.innerHTML = `<form method="dialog"><p>${esc(message)}</p><div class="dialog-actions">${buttons}</div></form>`;
            dialog.addEventListener("close", () => {
                const value = dialog.returnValue;
                dialog.remove();
                resolve(value);
            });
            document.body.appendChild(dialog);
            dialog.showModal();
        });
    }

    // ---------- Shared markup ----------

    function gameHeader(game, title) {
        return `
            <header class="app-header">
                <button type="button" class="icon-button" data-action="back" aria-label="Back">
                    <img src="assets/art/back.svg" alt="">
                </button>
                <div class="app-title">${esc(game.name)} · ${esc(title)}</div>
            </header>`;
    }

    function noticeMarkup() {
        return ui.notice ? `<p class="notice" role="status">${esc(ui.notice)}</p>` : "";
    }

    function stepper(label, value, options) {
        const min = options.min === undefined ? 0 : options.min;
        const max = options.max;
        const disabled = Boolean(options.disabled);
        const indexAttr = options.index === undefined ? "" : ` data-index="${options.index}"`;
        return `
            <div class="stepper" role="group" aria-label="${esc(label)}">
                <button type="button" class="step-button" data-action="step" data-field="${options.field}"${indexAttr} data-delta="-1"
                    aria-label="Decrease ${esc(label)}" ${disabled || value <= min ? "disabled" : ""}>−</button>
                <output class="step-value">${value}</output>
                <button type="button" class="step-button" data-action="step" data-field="${options.field}"${indexAttr} data-delta="1"
                    aria-label="Increase ${esc(label)}" ${disabled || value >= max ? "disabled" : ""}>+</button>
            </div>`;
    }

    function scoreTable(game, clickable) {
        const head = game.players.map((name) => `<th scope="col">${esc(name)}</th>`).join("");
        const rows = [];
        const totals = Scoring.runningTotals(game, completedRounds(game));
        for (let r = 1; r <= game.rounds.length; r += 1) {
            const round = game.rounds[r - 1];
            if (!round.confirmed) {
                continue;
            }
            const running = Scoring.runningTotals(game, r);
            const cells = game.players.map((_, i) => {
                const score = Scoring.scorePlayer(round, i, r);
                return `<td><span class="cell-main">${running[i]}</span><span class="cell-sub">Bid ${score.bid}, took ${score.taken}, ${signed(score.total)}</span></td>`;
            }).join("");
            const label = clickable
                ? `<button type="button" class="link-button" data-action="open-round" data-round="${r}">Round ${r}</button>`
                : `Round ${r}`;
            rows.push(`<tr><th scope="row">${label}</th>${cells}</tr>`);
        }
        const finalCells = game.players.map((_, i) => `<td><span class="cell-main">${totals[i]}</span></td>`).join("");
        const body = rows.length > 0
            ? rows.join("")
            : `<tr><td colspan="${game.players.length + 1}">No rounds finished yet.</td></tr>`;
        return `
            <div class="table-wrap">
                <table class="score-table">
                    <thead><tr><th scope="col">Round</th>${head}</tr></thead>
                    <tbody>${body}</tbody>
                    <tfoot><tr><th scope="row">Total</th>${finalCells}</tr></tfoot>
                </table>
            </div>`;
    }

    // ---------- Title, rules, past games ----------

    function titleView() {
        const active = GameStorage.inProgressGame(data);
        const continueButton = active
            ? `<button type="button" class="button primary big" data-action="continue">Continue ${esc(active.name)}, started ${esc(formatDate(active.startedAt))}</button>`
            : "";
        return `
            <section class="screen title-screen">
                <img class="title-mark" src="assets/art/title-mark.svg" alt="">
                <h1 class="display">Skull King</h1>
                <div class="stack">
                    ${continueButton}
                    <button type="button" class="button${active ? "" : " primary big"}" data-action="new-game">New Game</button>
                    <button type="button" class="button" data-action="history">Past Games</button>
                    <button type="button" class="button" data-action="rules">How to Play</button>
                </div>
                ${noticeMarkup()}
            </section>`;
    }

    function rulesView() {
        return `
            <section class="screen">
                <h1 class="display">How to Play</h1>
                <p>The app keeps score. Play with a physical Skull King deck; the app does not deal or show cards.</p>
                <h2>Setup</h2>
                <p>Enter players in seating order. Player 1 deals first, and the deal passes left each round.</p>
                <h2>Rounds</h2>
                <p>There are 10 rounds. Round 1 deals 1 card to each player, and each round deals one more card than the last.</p>
                <h2>Each round</h2>
                <ol>
                    <li>Players bid how many tricks they will win. A bid of 0 is allowed.</li>
                    <li>Play the tricks with the physical cards.</li>
                    <li>Enter each player's tricks taken and any discarded tricks (Kraken or White Whale). Taken plus discarded must equal the cards dealt.</li>
                    <li>Enter any bonus captures and confirm the round.</li>
                </ol>
                <h2>Scoring</h2>
                <ul>
                    <li><strong>Bid met:</strong> +20 per trick. Bonuses also count.</li>
                    <li><strong>Bid missed:</strong> −10 per trick off the bid. No bonuses.</li>
                    <li><strong>Zero bid met:</strong> +10 per card dealt. <strong>Zero bid missed:</strong> −10 per card dealt.</li>
                </ul>
                <h2>Bonuses</h2>
                <ul>
                    <li>Colored 14: +10 each (up to 3 in a round)</li>
                    <li>Black 14: +20</li>
                    <li>Mermaid captured with a Pirate: +20 each (up to 2)</li>
                    <li>Pirate captured with the Skull King: +30 each</li>
                    <li>Skull King captured with a Mermaid: +40</li>
                </ul>
                <p>The highest total after round 10 wins. Ties are shown as co-winners.</p>
                <p>Full rules are in <code>docs/rules.md</code>.</p>
                <button type="button" class="button" data-action="back">Back</button>
            </section>`;
    }

    function historyView() {
        const games = data.games.slice().sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
        const items = games.map((game) => {
            let detail;
            if (game.status === "finished") {
                const best = Scoring.winners(game);
                const totals = Scoring.runningTotals(game, MAX_ROUNDS);
                const score = totals[game.players.indexOf(best[0])];
                detail = `${best.length > 1 ? "Winners" : "Winner"}: ${esc(joinNames(best))}, ${score} points`;
            } else {
                detail = `Stopped after round ${completedRounds(game)}`;
            }
            return `
                <li>
                    <button type="button" class="game-row" data-action="open-game" data-id="${esc(game.id)}">
                        <span class="game-row-name">${esc(game.name)}</span>
                        <span class="game-row-meta">${esc(formatDate(game.startedAt))} · ${statusLabel(game)}</span>
                        <span class="game-row-meta">${esc(game.players.join(", "))}</span>
                        <span class="game-row-detail">${detail}</span>
                    </button>
                </li>`;
        }).join("");
        const list = games.length > 0
            ? `<ul class="game-list">${items}</ul>`
            : `<p class="empty">No games played yet.</p>`;
        return `
            <section class="screen">
                <h1 class="display">Past Games (${games.length} of ${GameStorage.MAX_GAMES.toLocaleString("en-US")})</h1>
                ${list}
                <button type="button" class="button" data-action="back">Back</button>
            </section>`;
    }

    function historyDetailView() {
        const game = GameStorage.findGame(data, ui.historyId);
        if (!game) {
            return historyView();
        }
        const finished = game.status === "finished";
        const resumeButton = finished
            ? ""
            : `<button type="button" class="button primary" data-action="continue-game" data-id="${esc(game.id)}">Continue</button>`;
        return `
            <section class="screen">
                <header class="app-header">
                    <button type="button" class="icon-button" data-action="back" aria-label="Back">
                        <img src="assets/art/back.svg" alt="">
                    </button>
                    <div class="app-title">${esc(game.name)}</div>
                </header>
                <p class="lead">${esc(formatDate(game.startedAt))} · ${statusLabel(game)}</p>
                ${scoreTable(game, false)}
                <div class="button-row">
                    ${resumeButton}
                    <button type="button" class="button danger" data-action="delete-game" data-id="${esc(game.id)}">
                        <img src="assets/art/trash.svg" alt="" class="button-icon">Delete Game
                    </button>
                </div>
            </section>`;
    }

    // ---------- Setup ----------

    function setupView() {
        const setup = ui.setup;
        const countButtons = [];
        for (let n = Scoring.MIN_PLAYERS; n <= Scoring.MAX_PLAYERS; n += 1) {
            countButtons.push(`<button type="button" class="count-button${n === setup.count ? " selected" : ""}" data-action="set-count" data-count="${n}" aria-pressed="${n === setup.count}">${n}</button>`);
        }
        const nameFields = setup.names.map((name, i) => `
            <label class="field">
                <span>Player ${i + 1}</span>
                <input type="text" maxlength="30" data-name-index="${i}" value="${esc(name)}" placeholder="Player ${i + 1}">
            </label>`).join("");
        const deal = [];
        for (let r = 1; r <= MAX_ROUNDS; r += 1) {
            deal.push(`<li><span>Round ${r}</span><span>${cardsWord(r)}</span></li>`);
        }
        return `
            <section class="screen">
                <h1 class="display">New Game</h1>
                <div class="pirate-name">
                    <span>${esc(setup.chosen.label)}</span>
                    <button type="button" class="button small" data-action="new-name">New Name</button>
                </div>
                <h2>Players</h2>
                <div class="count-row" role="group" aria-label="Number of players">${countButtons.join("")}</div>
                <p class="lead">Enter players in seating order, going clockwise. Player 1 deals first.</p>
                <div class="fields">${nameFields}</div>
                <h2>Cards dealt per round</h2>
                <ol class="deal-list">${deal.join("")}</ol>
                <div class="button-row sticky">
                    <button type="button" class="button" data-action="back">Back</button>
                    <button type="button" class="button primary" data-action="start-game">Start Game</button>
                </div>
            </section>`;
    }

    function openSetup(players) {
        const count = players ? players.length : 4;
        const names = players ? players.slice() : Array(count).fill("");
        ui.setup = {
            count,
            names,
            chosen: PirateNames.candidate(data.names, null)
        };
        ui.view = "setup";
        render();
    }

    async function startGame() {
        const setup = ui.setup;
        if (data.games.length >= GameStorage.MAX_GAMES) {
            const oldest = GameStorage.oldestGame(data);
            const choice = await ask(
                `You have ${GameStorage.MAX_GAMES.toLocaleString("en-US")} saved games. Delete the oldest game (${oldest.name}, started ${formatDate(oldest.startedAt)}) to make room?`,
                [
                    { value: "cancel", label: "Cancel" },
                    { value: "delete", label: "Delete and Start", primary: true }
                ]
            );
            if (choice !== "delete") {
                return;
            }
            GameStorage.removeGame(data, oldest.id);
        }

        const names = setup.names.map((name, i) => name.trim() || `Player ${i + 1}`);
        PirateNames.commit(data.names, setup.chosen);
        data.games.forEach((game) => {
            if (game.status === "in-progress") {
                game.status = "unfinished";
            }
        });

        const game = {
            id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
            name: setup.chosen.label,
            startedAt: new Date().toISOString(),
            status: "in-progress",
            players: names,
            rounds: [Scoring.newRound(names.length)],
            current: 1,
            viewRound: 1,
            screen: "startRound",
            resume: null
        };
        data.games.push(game);
        ui.setup = null;
        saveData();
        showGame(game);
    }

    // ---------- Game screens ----------

    function startRoundView(game) {
        const round = game.viewRound;
        const dealer = game.players[(round - 1) % game.players.length];
        return `
            ${gameHeader(game, `Round ${round} of ${MAX_ROUNDS}`)}
            <section class="screen">
                <div class="round-hero">
                    <img src="assets/art/cards.svg" alt="" class="hero-art">
                    <div>
                        <h1 class="display">Round ${round} of ${MAX_ROUNDS}</h1>
                        <p class="lead">Deal ${cardsWord(round)} to each player.</p>
                        <p>Dealer: <strong>${esc(dealer)}</strong></p>
                    </div>
                </div>
                <div class="button-row sticky">
                    <button type="button" class="button primary big" data-action="start-bidding">Start Bidding</button>
                </div>
            </section>`;
    }

    function bidsView(game) {
        const round = game.viewRound;
        const roundData = game.rounds[round - 1];
        const entered = roundData.bids.filter((bid) => bid !== null).length;
        const rows = game.players.map((name, i) => {
            const missing = roundData.bids[i] === null;
            const circles = [];
            for (let n = 0; n <= round; n += 1) {
                const selected = roundData.bids[i] === n;
                circles.push(`<button type="button" class="bid-circle${selected ? " selected" : ""}" data-action="set-bid" data-index="${i}" data-value="${n}" aria-pressed="${selected}" aria-label="${esc(name)} bids ${n}">${n}</button>`);
            }
            return `
                <div class="bid-row${missing ? " missing" : ""}">
                    <span class="bid-name">${esc(name)}</span>
                    <div class="bid-circles" role="group" aria-label="Bid for ${esc(name)}">${circles.join("")}</div>
                </div>`;
        }).join("");
        return `
            ${gameHeader(game, `Round ${round} of ${MAX_ROUNDS}`)}
            <section class="screen">
                <h1 class="display">Enter Bids</h1>
                <p class="lead">Round ${round}, ${cardsWord(round)} dealt.</p>
                <div class="bid-list">${rows}</div>
                <p class="progress">Bids entered: ${entered} of ${game.players.length}.</p>
                <div class="button-row sticky">
                    <button type="button" class="button primary big" data-action="confirm-bids" ${entered === game.players.length ? "" : "disabled"}>Confirm Bids</button>
                </div>
            </section>`;
    }

    function bonusNotes(game, roundData, index, limits) {
        const notes = [];
        const others = roundData.bonuses.filter((_, i) => i !== index);
        if (others.reduce((sum, b) => sum + b.colored14, 0) >= Scoring.MAX_COLORED_14) {
            notes.push("All colored 14s are already entered for other players.");
        }
        if (!limits.black14Allowed) {
            const holder = holderName(game, roundData, index, (b) => b.black14);
            notes.push(`Black 14 already given to ${esc(holder)}.`);
        }
        if (limits.mermaidMax <= 0 && roundData.bonuses[index].mermaidWithPirate === 0) {
            notes.push("Both Mermaids are already entered for other players.");
        }
        if (!limits.pirateAllowed) {
            const holder = holderName(game, roundData, index, (b) => b.pirateWithSkullKing > 0);
            notes.push(holder
                ? `Pirates with Skull King already given to ${esc(holder)}.`
                : "Not available: a Skull King with Mermaid is entered this round.");
        }
        if (!limits.skullKingWithMermaidAllowed) {
            const holder = holderName(game, roundData, index, (b) => b.skullKingWithMermaid);
            notes.push(holder
                ? `Skull King with Mermaid already given to ${esc(holder)}.`
                : "Not available: Pirates with Skull King are entered this round.");
        }
        return notes.map((note) => `<p class="bonus-note">${note}</p>`).join("");
    }

    function playerResultCard(game, roundData, index, round) {
        const name = game.players[index];
        const bid = roundData.bids[index];
        const taken = roundData.taken[index];
        const bonuses = roundData.bonuses[index];
        const eligible = bid > 0 && taken > 0;
        const limits = Scoring.bonusLimits(roundData, index);
        const points = Scoring.scorePlayer(roundData, index, round).total;

        let reason = "";
        if (bid === 0) {
            reason = "No bonuses on a zero bid.";
        } else if (taken === 0) {
            reason = "No bonuses with no tricks taken.";
        }

        const open = ui.openBonus.has(index) ? " open" : "";
        return `
            <article class="player-card">
                <header class="player-card-head">
                    <h3>${esc(name)}</h3>
                    <span class="tag">Bid ${bid}</span>
                </header>
                <div class="row">
                    <span class="row-label">Tricks taken</span>
                    ${stepper(`Tricks taken, ${name}`, taken, { field: "taken", index, max: round })}
                </div>
                <p class="live-points" aria-live="polite">Round points <strong>${signed(points)}</strong></p>
                <details class="bonuses" data-bonus-index="${index}"${open}>
                    <summary>Bonuses</summary>
                    ${reason ? `<p class="bonus-note">${reason}</p>` : ""}
                    <div class="bonus-grid">
                        <div class="row">
                            <span class="row-label">Colored 14s</span>
                            ${stepper(`Colored 14s, ${name}`, bonuses.colored14, { field: "colored14", index, max: limits.colored14Max, disabled: !eligible })}
                        </div>
                        <label class="check${eligible && limits.black14Allowed ? "" : " is-disabled"}">
                            <input type="checkbox" data-field="black14" data-index="${index}" ${bonuses.black14 ? "checked" : ""} ${eligible && limits.black14Allowed ? "" : "disabled"}>
                            <span>Black 14 (Jolly Roger)</span>
                        </label>
                        <div class="row">
                            <span class="row-label">Mermaids with a Pirate</span>
                            ${stepper(`Mermaids captured with a Pirate, ${name}`, bonuses.mermaidWithPirate, { field: "mermaid", index, max: limits.mermaidMax, disabled: !eligible })}
                        </div>
                        <div class="row">
                            <span class="row-label">Pirates with Skull King</span>
                            ${stepper(`Pirates captured with the Skull King, ${name}`, bonuses.pirateWithSkullKing, { field: "pirate", index, max: limits.pirateMax, disabled: !eligible })}
                        </div>
                        <label class="check${eligible && limits.skullKingWithMermaidAllowed ? "" : " is-disabled"}">
                            <input type="checkbox" data-field="skullKingWithMermaid" data-index="${index}" ${bonuses.skullKingWithMermaid ? "checked" : ""} ${eligible && limits.skullKingWithMermaidAllowed ? "" : "disabled"}>
                            <span>Skull King with a Mermaid</span>
                        </label>
                        ${eligible ? bonusNotes(game, roundData, index, limits) : ""}
                    </div>
                </details>
            </article>`;
    }

    function resultsView(game) {
        const round = game.viewRound;
        const roundData = game.rounds[round - 1];
        const check = Scoring.checkTricks(roundData, round);
        const cards = game.players.map((_, i) => playerResultCard(game, roundData, i, round)).join("");
        return `
            ${gameHeader(game, `Round ${round} of ${MAX_ROUNDS}`)}
            <section class="screen">
                <h1 class="display">Round ${round} results</h1>
                <p class="lead">${cardsWord(round)} dealt.</p>
                <div class="discard-row">
                    <span class="row-label">Discarded tricks</span>
                    ${stepper("Discarded tricks", roundData.discarded, { field: "discarded", max: round })}
                </div>
                <p class="tally ${check.ok ? "is-ok" : "is-error"}" role="status">${esc(Scoring.tricksMessage(roundData, round))}</p>
                <div class="player-cards">${cards}</div>
                <div class="button-row sticky">
                    <button type="button" class="button" data-action="back">Back</button>
                    <button type="button" class="button primary big" data-action="review-results" ${check.ok ? "" : "disabled"}>Review Results</button>
                </div>
            </section>`;
    }

    function roundScoreView(game) {
        const round = game.viewRound;
        const roundData = game.rounds[round - 1];
        const correcting = round < game.current;
        const runningTotals = Scoring.runningTotals(game, round);

        const cards = game.players.map((name, i) => {
            const score = Scoring.scorePlayer(roundData, i, round);
            const resultText = {
                met: "Met",
                missed: `Missed by ${score.missBy}`,
                zeroMet: "Zero met",
                zeroMissed: "Zero missed"
            }[score.result];
            const bonusLines = score.bonusItems.map((item) => `
                <li><span>${esc(item.label)}</span><span>${signed(item.points)}</span></li>`).join("");
            const ignored = score.bonusIgnored
                ? `<p class="bonus-note">Bonus not scored: bid missed.</p>`
                : "";
            return `
                <article class="player-card">
                    <header class="player-card-head">
                        <h3>${esc(name)}</h3>
                        <span class="tag ${score.result === "missed" || score.result === "zeroMissed" ? "tag-error" : "tag-ok"}">${resultText}</span>
                    </header>
                    <p class="score-line">Bid ${score.bid}, took ${score.taken}, base ${signed(score.basePoints)}</p>
                    ${bonusLines ? `<ul class="bonus-list">${bonusLines}</ul>` : ""}
                    ${ignored}
                    <div class="round-totals">
                        <span>Round total <strong>${signed(score.total)}</strong></span>
                        <span>Running total <strong>${runningTotals[i]}</strong></span>
                    </div>
                </article>`;
        }).join("");

        const discarded = roundData.discarded > 0
            ? `<p class="lead">${roundData.discarded} ${roundData.discarded === 1 ? "trick" : "tricks"} discarded (Kraken or White Whale).</p>`
            : "";

        let primary;
        if (correcting) {
            primary = `<button type="button" class="button primary big" data-action="return-round">Return to Round ${round}</button>`;
        } else if (round >= MAX_ROUNDS) {
            primary = `<button type="button" class="button primary big" data-action="confirm-round">See Final Results</button>`;
        } else {
            primary = `<button type="button" class="button primary big" data-action="confirm-round">Confirm and Continue</button>`;
        }

        const banner = correcting
            ? `<p class="banner" role="status">Correcting round ${round}. Current round: ${game.current}.</p>`
            : "";
        const scorecard = ui.scorecard
            ? `<section class="scorecard"><h2>Scorecard</h2>${scoreTable(game, true)}</section>`
            : "";

        return `
            ${gameHeader(game, `Round ${round} of ${MAX_ROUNDS}`)}
            <section class="screen">
                ${banner}
                <h1 class="display">Round ${round} Scores</h1>
                ${discarded}
                <div class="player-cards">${cards}</div>
                <div class="button-row">
                    <button type="button" class="button" data-action="edit-results">Edit Results</button>
                    <button type="button" class="button" data-action="edit-bids">Edit Bids</button>
                    <button type="button" class="button" data-action="toggle-scorecard" aria-expanded="${ui.scorecard}">${ui.scorecard ? "Hide Scorecard" : "Scorecard"}</button>
                </div>
                ${scorecard}
                <div class="button-row sticky">${primary}</div>
            </section>`;
    }

    function gameOverView(game) {
        const totals = Scoring.runningTotals(game, MAX_ROUNDS);
        const best = Scoring.winners(game);
        const heading = best.length > 1 ? `Winners: ${joinNames(best)}` : `Winner: ${joinNames(best)}`;
        const standings = game.players
            .map((name, i) => ({ name, total: totals[i] }))
            .sort((a, b) => b.total - a.total)
            .map((entry) => `<li><span>${esc(entry.name)}</span><span class="score-value">${entry.total}</span></li>`)
            .join("");
        return `
            ${gameHeader(game, "Game Over")}
            <section class="screen">
                <h1 class="display">Game Over</h1>
                <p class="winner"><img src="assets/art/chest.svg" alt="" class="hero-art"> ${esc(heading)}</p>
                <h2>Final standings</h2>
                <ul class="score-list">${standings}</ul>
                <h2>Score history</h2>
                ${scoreTable(game, true)}
                <div class="button-row sticky">
                    <button type="button" class="button" data-action="title">Title Screen</button>
                    <button type="button" class="button primary" data-action="play-again">Play Again</button>
                </div>
            </section>`;
    }

    // Running totals for every player, shown at the bottom of each game screen so progress is visible.
    const PLACE_NAMES = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];

    // Players sorted by running total, highest first. Players with equal totals share a place.
    function totalsFooter(game) {
        // While results are being entered, the round in progress is added in live.
        const roundData = game.rounds[game.viewRound - 1];
        const liveRound = (game.screen === "results" || game.screen === "roundScore")
            && !roundData.confirmed
            && roundData.bids.every((bid) => bid !== null);
        const throughRound = liveRound ? game.viewRound : completedRounds(game);
        const totals = Scoring.runningTotals(game, throughRound);
        const ranked = game.players
            .map((name, i) => ({ name, total: totals[i] }))
            .sort((a, b) => b.total - a.total);
        const items = ranked.map((entry, position) => {
            const tied = position > 0 && ranked[position - 1].total === entry.total;
            const place = tied ? ranked[position - 1].place : position;
            entry.place = place;
            return `
            <li>
                <span class="place-label">${PLACE_NAMES[place]} Place</span>
                <span class="totals-name">${esc(entry.name)}</span>
                <span class="score-value">${entry.total}</span>
            </li>`;
        }).join("");
        return `
            <footer class="totals-footer" aria-label="Running totals">
                <h2>Running totals</h2>
                <ol class="totals-list">${items}</ol>
            </footer>`;
    }

    function gameScreen(game) {
        switch (game.screen) {
            case "startRound":
                return startRoundView(game);
            case "bids":
                return bidsView(game);
            case "inPlay":
                return resultsView(game);
            case "results":
                return resultsView(game);
            case "roundScore":
                return roundScoreView(game);
            case "gameOver":
                return gameOverView(game);
            default:
                return startRoundView(game);
        }
    }

    function gameView() {
        const game = currentGame();
        if (!game) {
            ui.view = "title";
            return titleView();
        }
        return gameScreen(game) + totalsFooter(game);
    }

    // ---------- Rendering ----------

    function render() {
        let html;
        switch (ui.view) {
            case "setup":
                html = setupView();
                break;
            case "rules":
                html = rulesView();
                break;
            case "history":
                html = historyView();
                break;
            case "historyDetail":
                html = historyDetailView();
                break;
            case "game":
                html = gameView();
                break;
            default:
                html = titleView();
        }
        const focused = document.activeElement;
        const focusSelector = focused && root.contains(focused) && focused !== root
            ? "[" + Array.from(focused.attributes)
                .filter((attr) => attr.name.startsWith("data-"))
                .map((attr) => `${attr.name}="${attr.value}"`)
                .join("][") + "]"
            : null;
        root.innerHTML = html;
        if (focusSelector && focusSelector !== "[]") {
            const next = root.querySelector(focusSelector);
            if (next) {
                next.focus();
            }
        }
    }

    // ---------- Actions ----------

    function setBid(game, index, value) {
        const roundData = game.rounds[game.viewRound - 1];
        roundData.bids[index] = value === "" ? null : Number(value);
        saveData();
        render();
    }

    function stepValue(game, field, index, delta) {
        const round = game.viewRound;
        const roundData = game.rounds[round - 1];
        switch (field) {
            case "discarded":
                roundData.discarded = clampValue(roundData.discarded + delta, 0, round);
                break;
            case "taken":
                roundData.taken[index] = clampValue(roundData.taken[index] + delta, 0, round);
                Scoring.clearIneligibleBonuses(roundData);
                break;
            case "colored14": {
                const limits = Scoring.bonusLimits(roundData, index);
                const bonuses = roundData.bonuses[index];
                bonuses.colored14 = clampValue(bonuses.colored14 + delta, 0, limits.colored14Max);
                break;
            }
            case "mermaid": {
                const limits = Scoring.bonusLimits(roundData, index);
                const bonuses = roundData.bonuses[index];
                bonuses.mermaidWithPirate = clampValue(bonuses.mermaidWithPirate + delta, 0, limits.mermaidMax);
                break;
            }
            case "pirate": {
                const limits = Scoring.bonusLimits(roundData, index);
                const bonuses = roundData.bonuses[index];
                bonuses.pirateWithSkullKing = clampValue(bonuses.pirateWithSkullKing + delta, 0, limits.pirateMax);
                break;
            }
            default:
                return;
        }
        saveData();
        render();
    }

    function setCheck(game, field, index, checked) {
        const roundData = game.rounds[game.viewRound - 1];
        const limits = Scoring.bonusLimits(roundData, index);
        const bonuses = roundData.bonuses[index];
        if (field === "black14" && limits.black14Allowed) {
            bonuses.black14 = checked;
        }
        if (field === "skullKingWithMermaid" && limits.skullKingWithMermaidAllowed) {
            bonuses.skullKingWithMermaid = checked;
        }
        saveData();
        render();
    }

    async function continueOrNew() {
        const active = GameStorage.inProgressGame(data);
        if (!active) {
            openSetup(null);
            return;
        }
        const choice = await ask(
            `${active.name} is still in progress. Continue it, or start a new game?`,
            [
                { value: "new", label: "Start New Game" },
                { value: "continue", label: `Continue ${active.name}`, primary: true }
            ]
        );
        if (choice === "continue") {
            showGame(active);
        } else if (choice === "new") {
            openSetup(null);
        }
    }

    async function deleteGame(id) {
        const game = GameStorage.findGame(data, id);
        if (!game) {
            return;
        }
        const choice = await ask(
            `Delete ${game.name}, started ${formatDate(game.startedAt)}? This cannot be undone.`,
            [
                { value: "cancel", label: "Cancel" },
                { value: "delete", label: "Delete Game", primary: true }
            ]
        );
        if (choice !== "delete") {
            return;
        }
        GameStorage.removeGame(data, id);
        saveData();
        ui.historyId = null;
        ui.view = "history";
        render();
    }

    function resumeGame(id) {
        const game = GameStorage.findGame(data, id);
        if (!game) {
            return;
        }
        data.games.forEach((other) => {
            if (other.status === "in-progress" && other.id !== id) {
                other.status = "unfinished";
            }
        });
        game.status = "in-progress";
        saveData();
        showGame(game);
    }

    function handleAction(action, element) {
        const game = currentGame();
        const round = game ? game.viewRound : 0;
        switch (action) {
            case "continue":
                showGame(GameStorage.inProgressGame(data));
                break;
            case "new-game":
                continueOrNew();
                break;
            case "history":
                ui.view = "history";
                render();
                break;
            case "rules":
                ui.view = "rules";
                render();
                break;
            case "title":
                showTitle();
                break;
            case "back":
                if (ui.view === "game") {
                    goBack(game);
                } else if (ui.view === "historyDetail") {
                    ui.view = "history";
                    render();
                } else {
                    showTitle();
                }
                break;
            case "set-count": {
                const count = Number(element.dataset.count);
                ui.setup.count = count;
                ui.setup.names = Array.from({ length: count }, (_, i) => ui.setup.names[i] || "");
                render();
                break;
            }
            case "new-name":
                ui.setup.chosen = PirateNames.candidate(data.names, ui.setup.chosen.base);
                render();
                break;
            case "start-game":
                startGame();
                break;
            case "start-bidding":
                go(game, "bids", round);
                break;
            case "confirm-bids":
                go(game, "results", round);
                break;
            case "edit-bids":
                go(game, "bids", round);
                break;
            case "edit-results":
                go(game, "results", round);
                break;
            case "review-results":
                if (Scoring.checkTricks(game.rounds[round - 1], round).ok) {
                    go(game, "roundScore", round);
                }
                break;
            case "toggle-scorecard":
                ui.scorecard = !ui.scorecard;
                render();
                break;
            case "open-round":
                go(game, "roundScore", Number(element.dataset.round));
                break;
            case "confirm-round":
                confirmRound(game);
                break;
            case "return-round":
                returnToResume(game);
                break;
            case "play-again":
                openSetup(game.players);
                break;
            case "set-bid":
                setBid(game, Number(element.dataset.index), element.dataset.value);
                break;
            case "step":
                stepValue(game, element.dataset.field, Number(element.dataset.index), Number(element.dataset.delta));
                break;
            case "open-game":
                ui.historyId = element.dataset.id;
                ui.view = "historyDetail";
                render();
                break;
            case "continue-game":
                resumeGame(element.dataset.id);
                break;
            case "delete-game":
                deleteGame(element.dataset.id);
                break;
            default:
                break;
        }
    }

    // ---------- Event wiring ----------

    root.addEventListener("click", (event) => {
        const element = event.target.closest("[data-action]");
        if (element && !element.disabled) {
            handleAction(element.dataset.action, element);
        }
    });

    root.addEventListener("change", (event) => {
        const field = event.target.dataset.field;
        if (!field) {
            return;
        }
        if (event.target.type === "checkbox") {
            setCheck(currentGame(), field, Number(event.target.dataset.index), event.target.checked);
        }
    });

    root.addEventListener("input", (event) => {
        const index = event.target.dataset.nameIndex;
        if (index !== undefined && ui.setup) {
            ui.setup.names[Number(index)] = event.target.value;
        }
    });

    // The details toggle event does not bubble, so listen during the capture phase.
    root.addEventListener("toggle", (event) => {
        const index = event.target.dataset.bonusIndex;
        if (index === undefined) {
            return;
        }
        if (event.target.open) {
            ui.openBonus.add(Number(index));
        } else {
            ui.openBonus.delete(Number(index));
        }
    }, true);

    render();
});
