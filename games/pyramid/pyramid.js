class WordPyramid {
    constructor() {
        this.words = [];
        this.input = document.getElementById("word-input");
        this.submitBtn = document.getElementById("submit-btn");
        this.giveUpBtn = document.getElementById("give-up-btn");
        this.pyramidContainer = document.getElementById("pyramid-container");
        this.wordCount = document.getElementById("word-count");
        this.bestScore = BestScore.getBestScore('pyramid');
        
        this.timer = new Timer({
            duration: 10,
            countdown: true,
            onTimeout: () => this.handleGameOver()
        });
        
        this.setupEventListeners();
        this.updateBestScoreDisplay();
        this.updateWordCount();
    }

    reset() {
        this.words = [];
        this.pyramidContainer.innerHTML = '';
        this.input.value = '';

        this.updateWordCount();
        
        this.timer.reset();
        document.getElementById("timer").textContent = this.timer.duration;
        this.input.focus();
    }

    // Update
    updateWordCount() {
        this.wordCount.textContent = this.words.length;
    }

    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById("best-score");
        bestScoreElement.textContent = this.bestScore === null ? "-" : this.bestScore;
    }

    // Utils
    canMakeWord(newWord, sourceWord) {
        if (this.words.includes(newWord)) return false;

        const sourceLetters = [...sourceWord.toLowerCase()];
        const newLetters = [...newWord.toLowerCase()];
        
        if (newLetters.length > sourceLetters.length) return false;
        
        const letterCount = {};
        sourceLetters.forEach(letter => {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        });
        
        for (const letter of newLetters) {
            if (!letterCount[letter]) return false;
            letterCount[letter]--;
        }
        
        return true;
    }

    isValidWord(word) {
        return dictionary.hasOwnProperty(word.toLowerCase());
    }

    showError() {
        this.input.classList.add("invalid");
        setTimeout(() => {
            this.input.classList.remove("invalid");
        }, 500);
    }

    addWordToDisplay(word) {
        const wordElement = document.createElement("div");
        wordElement.className = "pyramid-word";
        
        [...word.toUpperCase()].forEach(letter => {
            const letterCell = document.createElement("div");
            letterCell.className = "letter-cell";
            letterCell.textContent = letter;
            wordElement.appendChild(letterCell);
        });
        
        this.pyramidContainer.appendChild(wordElement);
        this.pyramidContainer.scrollTop -= 60;
    }

    collapsePyramid() {
        const letters = this.pyramidContainer.querySelectorAll('.letter-cell');

        letters.forEach((letter, index) => {
            const delay = Math.random() * 500;
            const randomX = (Math.random() - 0.5) * 100;
            letter.style.setProperty('--random-x', `${randomX}px`);
            
            setTimeout(() => {
                const clone = letter.cloneNode(true);
                clone.style.left = letter.offsetLeft + 'px';
                clone.style.top = letter.offsetTop + 'px';
                clone.classList.add('falling');
                letter.style.opacity = 0;
                document.body.appendChild(clone);
                
                setTimeout(() => clone.remove(), 1500);
            }, delay);
        });

        setTimeout(() => {
            this.pyramidContainer.innerHTML = '';
        }, 2000);
    }

    // Events
    setupEventListeners() {
        this.submitBtn.addEventListener("click", () => this.handleSubmit());
        this.giveUpBtn.addEventListener("click", () => this.handleGameOver());
        this.input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.handleSubmit();
        });
    }

    // Handlers
    handleSubmit() {
        const newWord = this.input.value.trim().toLowerCase();
        
        if (!newWord) return;
        
        if (!this.isValidWord(newWord)) {
            this.showError();
            return;
        }
        
        if (this.words.length > 0) {
            const lastWord = this.words[this.words.length - 1];
            if (!this.canMakeWord(newWord, lastWord)) {
                this.showError();
                return;
            }
            this.timer.reset();
            this.timer.start();
        } else {
            this.timer.start();
        }
        
        this.words.push(newWord);
        this.addWordToDisplay(newWord);
        this.updateWordCount();
        this.input.value = "";
    }

    handleGameOver() {
        this.timer.stop();

        const finalScore = this.words.length;
        const isNewBestScore = this.bestScore === null || finalScore > this.bestScore;
        
        this.collapsePyramid();

        if (isNewBestScore) {
            BestScore.setBestScore('pyramid', finalScore);
            this.bestScore = finalScore;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        setTimeout(() => { // delay popup to allow animation to play
            const popup = new Popup();
            const content = `
                <h2>Congratulations!</h2>
                <p>You created a pyramid with ${finalScore} words!</p>
                <p class="best-score-text" style="color: ${isNewBestScore ? "#27ae60" : "#666"}">
                    ${isNewBestScore ? "🎉 New Best Score! 🎉" : `Best Score: ${this.bestScore === null ? "-" : this.bestScore} words`}
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
        }, 1000);
    }
}

let game = new WordPyramid();
