class Hangman {
    constructor() {
        this.counter = document.getElementById("counter");
        this.word_field = document.getElementById("word_field");
        this.clue_field = document.getElementById("clue-field");
        this.clue_button = document.getElementById("clue-button");
        this.guess_field = document.getElementById("guess_area");
        this.guess_button = document.getElementById("guess_button");
        this.guessed_field = document.getElementById("guessed_field");
        this.difficultySelect = document.getElementById("difficulty");
        this.bestScoreDisplay = document.getElementById("best-score");
        this.default_char = "-";
        this.won_popup = new Popup();
        this.lost_popup = new Popup();
        this.word = "";
        this.letters = [];
        this.tries = 10;
        this.guessed = [];
        this.currentScore = 0;
        
        this.init();
    }

    init() {
        // * * * * * EVENTS * * * * *
        this.clue_button.addEventListener('click', () => this.revealClue());
        this.guess_button.addEventListener('click', () => this.guess());
        this.difficultySelect.addEventListener('change', () => this.resetGame());
        this.guess_field.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.guess();
            }
        });

        // * * * * * INITIAL SETUP * * * * *
        this.displayBestScore();
        this.resetGame();
    }

    displayBestScore() {
        const bestScore = BestScore.getBestScore('hangman-' + this.difficultySelect.value);
        this.bestScoreDisplay.textContent = bestScore !== null ? bestScore : '-';
    }

    updateBestScore() {
        const gameId = 'hangman-' + this.difficultySelect.value;
        const currentBest = BestScore.getBestScore(gameId);
        if (currentBest === null || this.tries > currentBest) {
            BestScore.setBestScore(gameId, this.tries);
            this.displayBestScore();
            return true;
        }
        return false;
    }

    getRandomWord() {
        const level = this.difficultySelect.value;
        const word = Random.getRandomWords(1, level)[0];
        this.word = word.english.toUpperCase();
        this.letters = [];
        for (let i = 0; i < this.word.length; i++) {
            if (!this.letters.includes(this.word[i])) {
                this.letters.push(this.word[i]);
            }
        }    
        this.word_field.innerHTML = "";
        for (let letter = 0; letter < this.word.length; letter++) {
            let text = document.createElement('p');
            text.textContent = this.default_char;
            this.word_field.append(text); 
        }

        this.revealRandomLetter(1);
    }

    revealRandomLetter(n) {
        let a = 0;
        while (a < n) {
            a++;
            const index = Random.random(0, this.letters.length - 1);
            for (let i = 0; i < this.word.length; i++) {
                if (this.word[i] == this.letters.at(index)) {
                    this.word_field.children[i].innerHTML = this.word[i];
                }
            }
            this.letters.splice(index, 1);
            console.log("letters = " + this.letters);
        }
    }

    revealClue() {
        this.reduceTries(1); 
        this.revealRandomLetter(1);
        this.checkComplete();
    }

    checkComplete() {
        if (this.isComplete()) {
            this.showWonPopup();
        } else if (this.tries === 0) {
            this.showLostPopup();
        }
    }

    guess() {
        const letter = this.guess_field.value.toUpperCase();
        if (!letter || this.guessed.includes(letter)) {
            return;
        }

        let found = false;
        for (let i = 0; i < this.word.length; i++) {
            if (this.word[i] === letter) {
                this.word_field.children[i].textContent = this.word[i];
                found = true;
            }
        }

        if (!found) {
            this.reduceTries(1);
        }

        for (let i = 0; i < this.letters.length; i++) {
            if (this.letters.at(i) === letter) {
                this.letters.splice(i, 1);
            }
        }
        console.log("letters = " + this.letters);

        this.guess_field.value = "";
        this.addGuessed(letter);
        this.checkComplete();

        this.guess_field.focus();
    }

    reduceTries(n) {
        this.tries -= n;
        this.counter.textContent = this.tries;
    }

    isComplete() {
        for (let i = 0; i < this.word.length; i++) {
            if (this.word_field.children[i].textContent === this.default_char) {
                return false;
            }
        }
        return true;
    }

    addGuessed(letter) {
        if (!this.guessed.includes(letter)) {
            this.guessed.push(letter);
            const p = document.createElement('p');
            p.textContent = letter;
            this.guessed_field.appendChild(p);
        }
    }

    resetGuessed() {
        this.guessed = [];
        this.guessed_field.innerHTML = "";
    }

    showWonPopup() {
        const isNewBest = this.updateBestScore();
        const currentBest = BestScore.getBestScore('hangman-' + this.difficultySelect.value);
        
        let won_content = `
            <div class="popup-content">
                <h2>Congratulations!</h2>
                <p>You found the word with <span style="font-weight: bold;">${this.tries}</span> tries left!</p>
                <div class="best-score-text">Best Score: <span id="popup-best-score">${currentBest}</span></div>
                ${isNewBest ? '<p style="color: #4CAF50">New Best Score!</p>' : ''}
                <button class="retry-button">Play again</button>
            </div>
        `;

        this.won_popup.setContent(won_content);
        this.won_popup.popup.querySelector('.retry-button').addEventListener('click', () => {
            window.confetti.hide();
            this.won_popup.hide();
            this.resetGame();
        });
        window.confetti.start();
        this.won_popup.show();
    }

    showLostPopup() {
        const lost_content = `
            <div class="popup-content">
                <h2>Game Over</h2>
                <p>The word was: <span style="font-weight: bold;">${this.word}</span></p>
                <button class="retry-button">Try again</button>
            </div>
        `;
        this.lost_popup.setContent(lost_content);
        this.lost_popup.popup.querySelector('.retry-button').addEventListener('click', () => {
            this.lost_popup.hide();
            this.resetGame();
        });
        this.lost_popup.show();
    }

    resetGame() {
        this.tries = 10;
        this.counter.textContent = this.tries;
        this.resetGuessed();
        this.getRandomWord();
        this.displayBestScore();
    }
}

new Hangman();
