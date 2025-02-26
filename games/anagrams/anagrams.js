class Anagrams {
    constructor(nbWords = 8) {
        this.nbWords = nbWords;
        this.words = [];
        this.foundWords = new Set();
        this.bestTime = BestScore.getBestScore('anagrams');
        this.currentScrambled = null;

        this.gameBoard = document.getElementById("game-board");
        this.wordList = document.getElementById("word-list");
        
        this.timer = new Timer();
        
        this.init();
        this.updateBestScoreDisplay();
        this.timer.start();
    }

    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById("best-score");
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestTime === null ? "-" : this.timer.formatTime(this.bestTime);
        }
    }

    init() {
        // Select random words
        this.words = this.getRandomWords(this.nbWords);
        
        // Create the game board UI
        this.createBoard();
        
        // Create word list UI
        this.createWordList();

        // Create new anagram
        this.createNewAnagram();
    }

    getRandomWords(count) {
        return [...words]
            .filter(word => !word.english.includes(" "))
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
    }

    scrambleWord(word) {
        const array = word.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        const scrambled = array.join('');
        return scrambled === word ? this.scrambleWord(word) : scrambled;
    }

    createBoard() {
        // Clear existing content
        this.gameBoard.innerHTML = '';

        // Create anagram container
        const anagramContainer = document.createElement("div");
        anagramContainer.className = "anagram-container";
        this.gameBoard.appendChild(anagramContainer);

        // Create input area
        const inputArea = document.createElement("div");
        inputArea.className = "input-area";

        const wordInput = document.createElement("input");
        wordInput.type = "text";
        wordInput.id = "word-input";
        wordInput.placeholder = "Type your answer...";
        wordInput.autocomplete = "off";

        const submitButton = document.createElement("button");
        submitButton.className = "button submit-button";
        submitButton.textContent = "Submit";

        inputArea.appendChild(wordInput);
        inputArea.appendChild(submitButton);
        this.gameBoard.appendChild(inputArea);

        // Add hint text
        const hint = document.createElement("div");
        hint.className = "hint";
        hint.textContent = "Click tiles to rearrange letters or type directly in the input box";
        this.gameBoard.appendChild(hint);

        // Event listeners
        submitButton.addEventListener("click", () => this.checkAnswer());
        wordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.checkAnswer();
            }
        });
    }

    createWordList() {
        this.words.forEach(({ french }) => {
            const wordItem = document.createElement("div");
            wordItem.className = "word-item";
            wordItem.textContent = french;
            wordItem.dataset.word = french;
            this.wordList.appendChild(wordItem);
        });
    }

    createNewAnagram() {
        // Find a word that hasn't been solved yet
        const remainingWords = this.words.filter(word => 
            !this.foundWords.has(word.french)
        );

        if (remainingWords.length === 0) {
            this.handleWin();
            return;
        }

        // Select a random word from remaining words
        const word = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        this.currentScrambled = {
            original: word.english.toUpperCase(),
            french: word.french,
            scrambled: this.scrambleWord(word.english.toUpperCase())
        };

        // Update anagram container
        const anagramContainer = this.gameBoard.querySelector(".anagram-container");
        anagramContainer.innerHTML = "";

        [...this.currentScrambled.scrambled].forEach(letter => {
            const tile = document.createElement("div");
            tile.className = "letter-tile";
            tile.textContent = letter;
            anagramContainer.appendChild(tile);
        });

        // Clear input
        const wordInput = document.getElementById("word-input");
        if (wordInput) {
            wordInput.value = "";
        }

        // Setup tile click handlers
        this.setupTileHandlers();
    }

    setupTileHandlers() {
        const tiles = document.querySelectorAll(".letter-tile");
        let selectedTiles = [];

        tiles.forEach(tile => {
            tile.addEventListener("click", () => {
                if (tile.classList.contains("selected")) {
                    tile.classList.remove("selected");
                    selectedTiles = selectedTiles.filter(t => t !== tile);
                } else {
                    tile.classList.add("selected");
                    selectedTiles.push(tile);

                    if (selectedTiles.length === 2) {
                        // Swap tiles
                        const [tile1, tile2] = selectedTiles;
                        const temp = tile1.textContent;
                        tile1.textContent = tile2.textContent;
                        tile2.textContent = temp;

                        // Clear selection
                        tile1.classList.remove("selected");
                        tile2.classList.remove("selected");
                        selectedTiles = [];
                    }
                }
            });
        });
    }

    checkAnswer() {
        const wordInput = document.getElementById("word-input");
        const answer = wordInput.value.trim().toUpperCase();

        if (answer === this.currentScrambled.original) {
            this.foundWords.add(this.currentScrambled.french);
            
            // Update UI
            document.querySelector(`.word-item[data-word="${this.currentScrambled.french}"]`)
                .classList.add("found");

            // Create new anagram
            this.createNewAnagram();
        } else {
            wordInput.classList.add("shake");
            setTimeout(() => wordInput.classList.remove("shake"), 500);
        }
    }

    handleWin() {
        const finalTime = this.timer.stop();
        const isNewBestTime = this.bestTime === null || finalTime < this.bestTime;
        
        if (isNewBestTime) {
            BestScore.setBestScore('anagrams', finalTime);
            this.bestTime = finalTime;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        const popup = new Popup();
        const content = `
            <h2>Congratulations!</h2>
            <p>You completed all anagrams in <span>${this.timer.formatTime(finalTime)}</span>!</p>
            <p class="best-score-text" style="color: ${isNewBestTime ? "#27ae60" : "#666"}">
                ${isNewBestTime ? "🎉 New Best Time! 🎉" : `Best Time: ${this.timer.formatTime(this.bestTime)}`}
            </p>
            <button class="retry-button">Play Again</button>
        `;

        popup
            .setContent(content)
            .onHide(() => {
                const canvas = window.confetti.canvas;
                if (canvas) {
                    canvas.style.transition = "opacity 0.3s ease-out";
                    canvas.style.opacity = "0";
                    setTimeout(() => {
                        window.confetti.stop();
                        canvas.style.opacity = "1";
                        canvas.style.transition = "";
                    }, 300);
                }

                setTimeout(() => {
                    location.reload();
                }, 300);
            });

        const retryButton = popup.popup.querySelector(".retry-button");
        retryButton.addEventListener("click", () => {
            popup.hide();
        });

        popup.show();
    }
}

// Start the game
new Anagrams(8);
