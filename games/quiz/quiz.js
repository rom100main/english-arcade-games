class Quiz {
    constructor() {
        this.score = 0;
        this.bestScore = BestScore.getBestScore('quiz');
        this.currentWord = null;
        this.choices = [];
        
        this.wordDisplay = document.getElementById('word-display');
        this.choicesContainer = document.getElementById('choices');
        this.scoreDisplay = document.getElementById('score');
        this.difficultySelect = document.getElementById('difficulty');
        
        this.difficulty = this.difficultySelect.value;
        
        this.updateBestScoreDisplay();
        
        this.difficultySelect.addEventListener('change', () => {
            this.difficulty = this.difficultySelect.value;
            this.reset();
        });
        
        this.init();
    }

    init() {
        this.generateQuestion();
    }

    reset() {
        this.score = 0;
        this.scoreDisplay.textContent = '0';
        this.generateQuestion();
    }

    // Update
    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById('best-score');
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestScore || '-';
        }
    }

    updateScore(newscore) {
        this.score = newscore;
        this.scoreDisplay.textContent = this.score;
    }

    // Utils
    generateQuestion() {
        console.log('Generating question...');

        const allWords = Random.getRandomWords(20, this.difficulty);
        
        const questionIndex = Math.floor(Math.random() * allWords.length);
        this.currentWord = allWords[questionIndex];
        
        this.choices = this.generateChoices(allWords, questionIndex);
        
        const isEnglish = Math.random() < 0.5;
        this.wordDisplay.textContent = isEnglish ? this.currentWord.english : this.currentWord.french;
        
        this.choicesContainer.innerHTML = '';
        this.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = isEnglish ? choice.french : choice.english;
            button.addEventListener('click', () => this.handleChoice(index));
            this.choicesContainer.appendChild(button);
        });
    }

    generateChoices(words, correctIndex) {
        let choices = [words[correctIndex]];

        while (choices.length < 4) {
            const randomIndex = Math.floor(Math.random() * words.length);
            if (randomIndex !== correctIndex && !choices.includes(words[randomIndex])) {
                choices.push(words[randomIndex]);
            }
        }
        
        return choices.sort(() => Math.random() - 0.5);
    }

    // Handlers
    handleChoice(index) {
        const buttons = this.choicesContainer.querySelectorAll('.choice-button');
        buttons.forEach(button => button.disabled = true);
        
        const isCorrect = this.choices[index] === this.currentWord;
        buttons[index].classList.add(isCorrect ? 'correct' : 'incorrect');
        
        if (isCorrect) {
            this.updateScore(this.score + 1)
            setTimeout(() => {
                this.generateQuestion();
            }, 1000);
            return;
        }

        const correctIndex = this.choices.indexOf(this.currentWord);
        buttons[correctIndex].classList.add('correct');
        this.handleGameOver();
    }

    handleGameOver() {
        const isNewBestScore = this.score > this.bestScore;
        
        if (isNewBestScore) {
            BestScore.setBestScore('quiz', this.score);
            this.bestScore = this.score;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }
        
        setTimeout(() => { // delay popup to allow animation to play
            const popup = new Popup();
            const content = `
                <h2>Game Over!</h2>
                <p>Final Score: ${this.score}</p>
                <p class="best-score-text" style="color: ${isNewBestScore ? "var(--green)" : ""}">
                    ${isNewBestScore ? "🎉 New Best Score! 🎉" : `Best Score: ${this.bestScore || '-'}`}
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

let game = new Quiz();
