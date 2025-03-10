const BestScore = {
    /**
     * Set the best score for a specific game and level
     * @param {string} game - The game identifier (e.g., 'crossword', 'anagrams', etc.)
     * @param {number} score - Score to set
     * @param {string} level - Level identifier
     */
    setBestScore(game, score, level = 'default') {
        const cookieName = "rom100main.english-game";
        const cookieValue = document.cookie
            .split("; ")
            .find(row => row.startsWith(cookieName+"="));
        
        let data = {};
        if (cookieValue) {
            try {
                data = JSON.parse(cookieValue.split("=")[1]);
            } catch {
                data = {};
            }
        }
        
        data[game][level] = score;
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `${cookieName}=${JSON.stringify(data)};`;
    },

    /**
     * Get the best score for a specific game and level
     * @param {string} game - Game identifier (e.g., 'crossword', 'anagrams', etc.)
     * @param {string} level - Level identifier
     * @returns {number} Best score or null if no score exists
     */
    getBestScore(game, level = 'default') {
        const cookieName = "rom100main.english-game";
        const cookieValue = document.cookie
            .split("; ")
            .find(row => row.startsWith(cookieName+"="));
        
        if (cookieValue) {
            try {
                const data = JSON.parse(cookieValue.split("=")[1]);
                if (!data[game]) return null;
                return data[game]?.[level] || null;
            } catch {
                return null;
            }
        }
        return null;
    }
};
