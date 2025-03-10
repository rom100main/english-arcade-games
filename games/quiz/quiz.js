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

    generateQuestion() {
        // Get all words for current difficulty
        const allWords = Random.getRandomWords(20, this.difficulty);
        
        // Select one random word as the question
        const questionIndex = Math.floor(Math.random() * allWords.length);
        this.currentWord = allWords[questionIndex];
        
        // Create choices (1 correct + 3 random incorrect)
        this.choices = this.generateChoices(allWords, questionIndex);
        
        // Display question
        const isEnglish = Math.random() < 0.5;
        this.wordDisplay.textContent = isEnglish ? this.currentWord.english : this.currentWord.french;
        
        // Create choice buttons
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
        
        // Get 3 random incorrect answers
        while (choices.length < 4) {
            const randomIndex = Math.floor(Math.random() * words.length);
            if (randomIndex !== correctIndex && !choices.includes(words[randomIndex])) {
                choices.push(words[randomIndex]);
            }
        }
        
        // Shuffle choices
        return choices.sort(() => Math.random() - 0.5);
    }

    handleChoice(index) {
        const buttons = this.choicesContainer.querySelectorAll('.choice-button');
        buttons.forEach(button => button.disabled = true);
        
        const isCorrect = this.choices[index] === this.currentWord;
        buttons[index].classList.add(isCorrect ? 'correct' : 'incorrect');
        
        if (isCorrect) {
            this.updateScore(this.score + 1)
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                BestScore.setBestScore('quiz', this.score);
                this.updateBestScoreDisplay();
            }
        } else {
            this.updateScore(0)
            this.updateBestScoreDisplay();
            const correctIndex = this.choices.indexOf(this.currentWord);
            buttons[correctIndex].classList.add('correct');
        }
        
        setTimeout(() => {
            this.generateQuestion();
        }, 1000);
    }

    updateScore(newscore) {
        if (newscore%10==0) {
            window.confetti.start();
            setTimeout(() => window.confetti.stop(), 2000);
        }
        this.score = newscore;
        this.scoreDisplay.textContent = this.score;
    }

    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById('best-score');
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestScore || '-';
        }
    }
}

let game = new Quiz();
