// Pirate names for each game (see docs/ui-design.md, Game Names).
"use strict";

const PirateNames = (() => {
    const LIST = [
        "Blackbeard",
        "Anne Bonny",
        "Mary Read",
        "Calico Jack",
        "Black Bart",
        "Captain Kidd",
        "Henry Morgan",
        "Grace O'Malley",
        "Ching Shih",
        "Stede Bonnet",
        "Jean Lafitte",
        "Edward Low",
        "Charles Vane",
        "Black Sam Bellamy",
        "Henry Every",
        "Thomas Tew",
        "Benjamin Hornigold",
        "Olivier Levasseur",
        "Barbarossa",
        "Francis Drake"
    ];

    const ROMAN = [
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"]
    ];

    function toRoman(number) {
        let remaining = number;
        let text = "";
        ROMAN.forEach(([value, symbol]) => {
            while (remaining >= value) {
                text += symbol;
                remaining -= value;
            }
        });
        return text;
    }

    // names is { used: [], cycle: 0 } from storage. Returns { base, label } without changing names.
    // Names are not reused until the whole list has been used. After that, a Roman numeral is added.
    function candidate(names, avoid) {
        const available = LIST.filter((name) => !names.used.includes(name) && name !== avoid);
        const pool = available.length > 0 ? available : LIST.filter((name) => name !== avoid);
        const base = pool[Math.floor(Math.random() * pool.length)];
        const label = names.cycle > 0 ? `${base} ${toRoman(names.cycle + 1)}` : base;
        return { base, label };
    }

    // Marks a candidate as used once its game starts.
    function commit(names, chosen) {
        names.used.push(chosen.base);
        if (names.used.length >= LIST.length) {
            names.used = [];
            names.cycle += 1;
        }
    }

    return { candidate, commit, toRoman };
})();
