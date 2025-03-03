const Random = {
    /**
     * Get random words from a specific level
     * @param {number} count - Number of words to get
     * @param {string} level - Level to get words from
     * @returns {Array} An array of random words containing english and french translations
     */
    getRandomWords(count, level) {
        if (!words[level]) {
            throw new Error(`Invalid level: ${level}`);
        }
        return [...words[level]]
            .filter(word => !word.english.includes(" "))
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
    }
}
