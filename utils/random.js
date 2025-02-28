const Random = {
    /**
     * Get random words
     * @param {number} count - The number of words to get 
     * @returns {Array} An array of random words
     */
    getRandomWords(count) {
        return [...words]
            .filter(word => !word.english.includes(" "))
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
    }
}