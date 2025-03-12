class Anagrams {
    constructor(nbWords = 8) {
        this.gameBoard = document.getElementById("game-board");
        this.wordList = document.getElementById("word-list");
        this.difficultySelect = document.getElementById("difficulty");

        this.nbWords = nbWords;
        this.words = [];
        this.foundWords = new Set();
        this.bestTime = BestScore.getBestScore('anagrams', this.difficultySelect.value);
        this.currentScrambled = null;
        this.placedIndices = new Set();
        this.difficulty = this.difficultySelect.value;
        
        this.timer = new Timer();

        this.difficultySelect.addEventListener("change", () => {
            this.difficulty = this.difficultySelect.value;
            this.bestTime = BestScore.getBestScore('anagrams', this.difficulty);
            this.updateBestScoreDisplay();
            this.reset();
        });
        
        this.init();
        this.updateBestScoreDisplay();
        this.timer.start();
    }

    init() {
        this.words = Random.getRandomWords(this.nbWords, this.difficulty);
        
        this.createBoard();
        this.createWordList();
        this.createNewAnagram();
    }

    reset() {
        this.words = [];
        this.foundWords = new Set();
        this.currentScrambled = null;
        this.placedIndices = new Set();
        this.wordList.innerHTML = '';
        
        this.timer.stop();
        this.timer.reset();
        
        this.init();
        this.timer.start();
    }

    // Create
    createNewAnagram() {
        const remainingWords = this.words.filter(word => 
            !this.foundWords.has(word.french)
        );

        if (remainingWords.length === 0) {
            this.handleGameOver();
            return;
        }

        // Next words
        const word = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        this.currentScrambled = {
            original: word.english.toUpperCase(),
            french: word.french,
            scrambled: this.scrambleWord(word.english.toUpperCase())
        };

        const anagramContainer = this.gameBoard.querySelector(".anagram-container");
        anagramContainer.innerHTML = "";

        [...this.currentScrambled.scrambled].forEach(letter => {
            const tile = document.createElement("div");
            tile.className = "letter-tile";
            tile.textContent = letter;
            anagramContainer.appendChild(tile);
        });

        const wordInput = document.getElementById("word-input");
        if (wordInput) wordInput.value = "";

        // Reset placed indices and hint buttons
        this.placedIndices = new Set();
        document.querySelectorAll('.hint-button').forEach(button => {
            button.classList.remove('used');
        });

        this.setupTileHandlers();
    }

    createBoard() {
        this.gameBoard.innerHTML = '';

        const hintBox = document.createElement("div");
        hintBox.className = "hint-box";
        for (let i = 0; i < 3; i++) {
            const hintButton = document.createElement("div");
            hintButton.className = "hint-button";
            hintButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 20h6v2H9zm7.906-6.288C17.936 12.506 19 11.259 19 9c0-3.859-3.141-7-7-7S5 5.141 5 9c0 2.285 1.067 3.528 2.101 4.73.358.418.729.851 1.084 1.349.144.206.38.996.591 1.921H8v2h8v-2h-.774c.213-.927.45-1.719.593-1.925.352-.503.726-.94 1.087-1.363zm-2.724.213c-.434.617-.796 2.075-1.006 3.075h-2.351c-.209-1.002-.572-2.463-1.011-3.08a20.502 20.502 0 0 0-1.196-1.492C7.644 11.294 7 10.544 7 9c0-2.757 2.243-5 5-5s5 2.243 5 5c0 1.521-.643 2.274-1.615 3.413-.373.438-.796.933-1.203 1.512z"></path></svg>`;
            hintButton.addEventListener('click', () => this.useHint(hintButton));
            hintBox.appendChild(hintButton);
        }
        this.gameBoard.appendChild(hintBox);

        const anagramContainer = document.createElement("div");
        anagramContainer.className = "anagram-container";
        this.gameBoard.appendChild(anagramContainer);

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

        const hint = document.createElement("div");
        hint.className = "hint";
        hint.textContent = "Click tiles to rearrange letters or type directly in the input box";
        this.gameBoard.appendChild(hint);

        submitButton.addEventListener("click", () => this.checkAnswer());
        wordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.checkAnswer();
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

    // Update
    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById("best-score");
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestTime === null ? "-" : this.timer.formatTime(this.bestTime);
        }
    }

    // Utils
    useHint(hintButton) {
        if (hintButton.classList.contains('used')) return;
        
        const tiles = Array.from(document.querySelectorAll(".letter-tile"));
        const word = this.currentScrambled.original;
        let placed = false;

        // Array of unplaced indices
        const unplacedIndices = [];
        for (let i = 0; i < word.length; i++) {
            if (!this.placedIndices.has(i)) {
                unplacedIndices.push(i);
            }
        }

        if (unplacedIndices.length > 0) {
            // Randomly select an unplaced position
            const randomIndex = Math.floor(Math.random() * unplacedIndices.length);
            const i = unplacedIndices[randomIndex];
            const correctLetter = word[i];
            
            const currentTileIndex = tiles.findIndex(tile => 
                tile.textContent === correctLetter && !tile.classList.contains('placed')
            );

            if (currentTileIndex !== -1) {
                // Place the letter in the correct position
                if (currentTileIndex !== i) {
                    const temp = tiles[i].textContent;
                    tiles[i].textContent = correctLetter;
                    tiles[currentTileIndex].textContent = temp;
                }
                tiles[i].classList.add('placed');
                this.placedIndices.add(i);
                placed = true;
            }
        }

        if (placed) {
            hintButton.classList.add('used');
        }
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

    checkAnswer() {
        const wordInput = document.getElementById("word-input");
        const answer = wordInput.value.trim().toUpperCase();

        if (answer === this.currentScrambled.original) {
            this.foundWords.add(this.currentScrambled.french);
            
            document.querySelector(`.word-item[data-word="${this.currentScrambled.french}"]`)
                .classList.add("found");

            this.createNewAnagram();
        } else {
            wordInput.classList.add("shake");
            setTimeout(() => wordInput.classList.remove("shake"), 500);
        }
    }

    // Handlers
    setupTileHandlers() {
        const tiles = document.querySelectorAll(".letter-tile");
        let selectedTiles = [];

        tiles.forEach(tile => {
            tile.addEventListener("click", () => {
                if (tile.classList.contains('placed')) return;
                
                if (tile.classList.contains("selected")) {
                    tile.classList.remove("selected");
                    selectedTiles = selectedTiles.filter(t => t !== tile);
                } else {
                    tile.classList.add("selected");
                    selectedTiles.push(tile);

                    if (selectedTiles.length === 2) {
                        const [tile1, tile2] = selectedTiles;
                        if (!tile1.classList.contains('placed') && !tile2.classList.contains('placed')) {
                            const temp = tile1.textContent;
                            tile1.textContent = tile2.textContent;
                            tile2.textContent = temp;
                        }

                        tile1.classList.remove("selected");
                        tile2.classList.remove("selected");
                        selectedTiles = [];
                    }
                }
            });
        });
    }

    handleGameOver() {
        const finalTime = this.timer.stop();
        const isNewBestTime = this.bestTime === null || finalTime < this.bestTime;
        
        if (isNewBestTime) {
            BestScore.setBestScore('anagrams', finalTime, this.difficulty);
            this.bestTime = finalTime;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        const popup = new Popup();
        const content = `
            <h3>Congratulations!</h3>
            <p>You completed all anagrams in <span>${this.timer.formatTime(finalTime)}</span>!</p>
            <p class="best-score-text" style="color: ${isNewBestTime ? "var(--green)" : "" }">
                ${isNewBestTime ? "🎉 New Best Time! 🎉" : `Best Time: ${this.timer.formatTime(this.bestTime)}`}
            </p>
            <button class="button">Play Again</button>
        `;

        popup
            .setContent(content)
            .onHide(() => {
                window.confetti.hide();
                setTimeout(() => {
                    this.reset();
                }, 300);
            });

        const retryButton = popup.popup.querySelector(".button");
        retryButton.addEventListener("click", () => {
            popup.hide();
        });

        popup.show();
    }
}

let game = new Anagrams();
