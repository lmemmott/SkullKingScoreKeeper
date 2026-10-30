// Saves games in browser localStorage under one versioned key (see docs/ui-design.md, Saved Games and History).
"use strict";

const GameStorage = (() => {
    const KEY = "skullKing.v1";
    const MAX_GAMES = 1000;

    function emptyData() {
        return {
            version: 1,
            games: [],
            names: { used: [], cycle: 0 }
        };
    }

    // Returns the stored data, or an empty set if nothing is stored or storage is unavailable.
    function load() {
        try {
            const raw = window.localStorage.getItem(KEY);
            if (!raw) {
                return emptyData();
            }
            const parsed = JSON.parse(raw);
            if (parsed && parsed.version === 1 && Array.isArray(parsed.games)) {
                return parsed;
            }
        } catch (error) {
            console.warn("Could not read saved games.", error);
        }
        return emptyData();
    }

    // Returns true when the data was written.
    function save(data) {
        try {
            window.localStorage.setItem(KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn("Could not save games.", error);
            return false;
        }
    }

    function findGame(data, id) {
        return data.games.find((game) => game.id === id) || null;
    }

    function inProgressGame(data) {
        return data.games.find((game) => game.status === "in-progress") || null;
    }

    function oldestGame(data) {
        return data.games.reduce((oldest, game) => (
            !oldest || game.startedAt < oldest.startedAt ? game : oldest
        ), null);
    }

    function removeGame(data, id) {
        data.games = data.games.filter((game) => game.id !== id);
    }

    return {
        MAX_GAMES,
        load,
        save,
        findGame,
        inProgressGame,
        oldestGame,
        removeGame
    };
})();
