class Hangman {
    constructor() {
        this.maxTries = 6;
        this.mistakes = 0;
        this.currentWord = null;
        this.guessedLetters = new Set();
        this.gameEnded = false;
        this.bestTime = BestScore.getBestScore('hangman');

        this.gameBoard = document.getElementById("game-board");
        this.wordDisplay = document.getElementById("word-display");
        this.keyboard = document.getElementById("keyboard");
        this.difficultySelect = document.getElementById("difficulty");
        this.wordElem = document.getElementById("word");
        this.hintBox = document.getElementById("hint-box");
        this.difficulty = this.difficultySelect.value;
        
        this.timer = new Timer();

        this.difficultySelect.addEventListener("change", () => {
            this.difficulty = this.difficultySelect.value;
            this.reset();
        });
        
        this.setupGame();
        this.updateBestScoreDisplay();
        this.timer.start();
    }

    setupGame() {
        this.selectNewWord();
        this.createHintButtons();
        this.createWordDisplay();
        this.createKeyboard();
        this.setupKeyboardEvents();
    }

    reset() {
        this.mistakes = 0;
        this.guessedLetters.clear();
        this.gameEnded = false;
        this.currentWord = null;
        
        this.timer.stop();
        this.timer.reset();
        
        this.setupGame();
        this.timer.start();
    }

    selectNewWord() {
        const words = Random.getRandomWords(1, this.difficulty);
        this.currentWord = words[0];
        this.updateWordDisplay();
    }

    createHintButtons() {
        this.hintBox.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const hintButton = document.createElement("div");
            hintButton.className = "hint-button";
            hintButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 20h6v2H9zm7.906-6.288C17.936 12.506 19 11.259 19 9c0-3.859-3.141-7-7-7S5 5.141 5 9c0 2.285 1.067 3.528 2.101 4.73.358.418.729.851 1.084 1.349.144.206.38.996.591 1.921H8v2h8v-2h-.774c.213-.927.45-1.719.593-1.925.352-.503.726-.94 1.087-1.363zm-2.724.213c-.434.617-.796 2.075-1.006 3.075h-2.351c-.209-1.002-.572-2.463-1.011-3.08a20.502 20.502 0 0 0-1.196-1.492C7.644 11.294 7 10.544 7 9c0-2.757 2.243-5 5-5s5 2.243 5 5c0 1.521-.643 2.274-1.615 3.413-.373.438-.796.933-1.203 1.512z"></path></svg>`;
            hintButton.addEventListener('click', () => this.useHint(hintButton));
            this.hintBox.appendChild(hintButton);
        }
    }

    useHint(hintButton) {
        if (hintButton.classList.contains('used') || this.gameEnded) return;

        const word = this.currentWord.english.toUpperCase();
        const unguessedLetters = [...word].filter(letter => !this.guessedLetters.has(letter));

        if (unguessedLetters.length > 0) {
            const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            this.guessedLetters.add(randomLetter);
            this.createWordDisplay();
            this.createKeyboard();

            if (this.isWordComplete()) {
                this.handleGameOver(true);
            }

            hintButton.classList.add('used');
        }
    }

    updateWordDisplay() {
        this.wordElem.textContent = `${this.currentWord.french} (${this.maxTries - this.mistakes} tries left)`;
    }

    createWordDisplay() {
        this.wordDisplay.innerHTML = '';
        [...this.currentWord.english.toUpperCase()].forEach(letter => {
            const box = document.createElement('div');
            box.className = 'letter-box';
            box.textContent = this.guessedLetters.has(letter) ? letter : '';
            this.wordDisplay.appendChild(box);
        });
    }

    createKeyboard() {
        this.keyboard.innerHTML = '';
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
            const button = document.createElement('button');
            button.className = 'keyboard-key';
            button.textContent = letter;
            if (this.guessedLetters.has(letter)) {
                button.classList.add('used');
                if (this.currentWord.english.toUpperCase().includes(letter)) {
                    button.classList.add('correct');
                } else {
                    button.classList.add('wrong');
                }
            }
            if (letter === 'U') {
                this.keyboard.appendChild(document.createElement('div'));
                this.keyboard.appendChild(document.createElement('div'));
            }
            this.keyboard.appendChild(button);
        });
    }

    setupKeyboardEvents() {
        this.keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('keyboard-key') && 
                !e.target.classList.contains('used') &&
                !this.gameEnded) {
                this.handleGuess(e.target.textContent);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.gameEnded) return;
            
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key) && !this.guessedLetters.has(key)) {
                this.handleGuess(key);
            }
        });
    }

    handleGuess(letter) {
        this.guessedLetters.add(letter);
        
        const word = this.currentWord.english.toUpperCase();
        const isCorrect = word.includes(letter);
        
        if (!isCorrect) {
            this.mistakes++;
            this.updateWordDisplay();
        }
        
        this.createWordDisplay();
        this.createKeyboard();
        
        if (this.mistakes >= this.maxTries) {
            this.handleGameOver(false);
        } else if (this.isWordComplete()) {
            this.handleGameOver(true);
        }
    }

    isWordComplete() {
        return [...this.currentWord.english.toUpperCase()].every(
            letter => this.guessedLetters.has(letter)
        );
    }

    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById("best-score");
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestTime === null ? "-" : this.timer.formatTime(this.bestTime);
        }
    }

    handleGameOver(won) {
        this.gameEnded = true;
        const finalTime = this.timer.stop();
        
        const isNewBestTime = won && (this.bestTime === null || finalTime < this.bestTime);
        
        if (isNewBestTime) {
            BestScore.setBestScore('hangman', finalTime);
            this.bestTime = finalTime;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        const popup = new Popup();
        const content = won ? `
            <h2>Congratulations!</h2>
            <p>You found the word in <span>${this.timer.formatTime(finalTime)}</span>!</p>
            <p class="best-score-text" style="color: ${isNewBestTime ? "var(--green)" : ""}">
                ${isNewBestTime ? "🎉 New Best Time! 🎉" : `Best Time: ${this.timer.formatTime(this.bestTime)}`}
            </p>
            <button class="button">Play Again</button>
        ` : `
            <h2>Game Over</h2>
            <p>The word was: ${this.currentWord.english}</p>
            <button class="button">Try Again</button>
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

let game = new Hangman();
