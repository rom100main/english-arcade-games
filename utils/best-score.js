const BestScore = {
    /**
     * Set the best score for a specific game
     * @param {string} game - The game identifier (e.g., 'crossword', 'anagrams', etc.)
     * @param {number} score - The score to set
     */
    setBestScore(game, score) {
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
        
        data[game] = score;
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `${cookieName}=${JSON.stringify(data)};`;
    },

    /**
     * Get the best score for a specific game
     * @param {string} game - The game identifier (e.g., 'crossword', 'anagrams', etc.)
     * @returns {number} The best score or null if no score exists
     */
    getBestScore(game) {
        const cookieName = "rom100main.english-game";
        const cookieValue = document.cookie
            .split("; ")
            .find(row => row.startsWith(cookieName+"="));
        
        if (cookieValue) {
            try {
                const data = JSON.parse(cookieValue.split("=")[1]);
                return data[game] || null;
            } catch {
                return null;
            }
        }
        return null;
    }
};
