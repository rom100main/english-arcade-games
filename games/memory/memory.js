class MemoryGame {
    constructor(rows = 4, cols = 5) {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.isLocked = false;
        this.bestScore = BestScore.getBestScore('memory');
        this.popup = null;
        this.rows = rows;
        this.cols = cols;

        this.gameBoard = document.getElementById('game-board');
        this.pairsDisplay = document.getElementById('pairs');
        this.attemptsDisplay = document.getElementById('attempts');
        this.difficultySelect = document.getElementById('difficulty');

        this.difficulty = this.difficultySelect.value;

        this.difficultySelect.addEventListener("change", () => {
            this.difficulty = this.difficultySelect.value;
            this.reset();
        });

        this.init();
        this.updateBestScoreDisplay();
    }

    init(rows = 4, cols = 5) {
        this.rows = rows;
        this.cols = cols;

        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        // Calculate number of pairs needed
        const totalCells = this.rows * this.cols;
        const numPairs = Math.floor(totalCells / 2);
        const selectedWords = Random.getRandomWords(numPairs, this.difficulty);

        const cardPairs = selectedWords.map(word => [
            { text: word.french, type: 'french' },
            { text: word.english, type: 'english' }
        ]).flat();
        this.cards = this.shuffle(cardPairs);
        
        this.cards.forEach((card, index) => {
            const cardElement = this.createCard(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }

    reset() {
        this.isLocked = true;
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.remove('flipped', 'matched');
        });

        setTimeout(() => {
            this.gameBoard.innerHTML = '';
            this.cards = [];
            this.flippedCards = [];
            this.matchedPairs = 0;
            this.attempts = 0;
            this.isLocked = false;
            this.pairsDisplay.textContent = '0';
            this.attemptsDisplay.textContent = '0';
            this.init();
        }, 300); // card flip animation duration
    }

    // Create
    createCard(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;

        const front = document.createElement('div');
        front.className = 'card-front';
        front.textContent = '?';

        const back = document.createElement('div');
        back.className = 'card-back';
        back.textContent = card.text;

        cardElement.appendChild(front);
        cardElement.appendChild(back);

        cardElement.addEventListener('click', () => this.flipCard(cardElement, card));
        return cardElement;
    }

    // Update
    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById('best-score');
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestScore === null ? '-' : this.bestScore;
        }
    }

    // Utils
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    flipCard(cardElement, card) {
        if (
            this.isLocked || 
            this.flippedCards.length >= 2 || 
            cardElement.classList.contains('flipped') ||
            cardElement.classList.contains('matched')
        ) {
            return;
        }

        cardElement.classList.add('flipped');
        this.flippedCards.push({ element: cardElement, card });

        if (this.flippedCards.length === 2) {
            this.attempts++;
            this.attemptsDisplay.textContent = this.attempts;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.flippedCards;
        const isMatch = 
            first.card.type !== second.card.type && 
            ((first.card.type === 'french' && this.findMatchingPair(first.card.text, 'french') === second.card.text) ||
             (first.card.type === 'english' && this.findMatchingPair(first.card.text, 'english') === second.card.text));

        if (isMatch) this.handleMatch();
        else this.handleMismatch();
    }

    findMatchingPair(text, type) {
        const word = words[this.difficulty].find(w => 
            type === 'french' ? w.french === text : w.english === text
        );
        return type === 'french' ? word.english : word.french;
    }

    // Handlers
    handleMatch() {
        this.flippedCards.forEach(({ element }) => {
            element.classList.add('matched');
        });
        this.matchedPairs++;
        this.pairsDisplay.textContent = this.matchedPairs;
        this.flippedCards = [];

        if (this.matchedPairs === Math.floor(this.rows * this.cols / 2)) {
            setTimeout(() => {
                this.handleGameOver();
            }, 500);
        }
    }

    handleMismatch() {
        this.isLocked = true;
        setTimeout(() => {
            this.flippedCards.forEach(({ element }) => {
                element.classList.remove('flipped');
            });
            this.flippedCards = [];
            this.isLocked = false;
        }, 1000);
    }

    handleGameOver() {
        const isNewBestScore = this.bestScore === null || this.attempts < this.bestScore;

        if (isNewBestScore) {
            BestScore.setBestScore('memory', this.attempts);
            this.bestScore = this.attempts;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        this.popup = new Popup();

        const content = `
            <h2>Congratulations!</h2>
            <p>You completed the game in <span id="final-attempts">${this.attempts}</span> attempts!</p>
            <p class="best-score-text" style="color: ${isNewBestScore ? '#27ae60' : '#666'}">
                ${isNewBestScore ? '🎉 New Best Score! 🎉' : `Best Score: ${this.bestScore}`}
            </p>
            <button class="button">Play Again</button>
        `;

        this.popup
            .setContent(content)
            .onHide(() => {
                window.confetti.hide();
                setTimeout(() => {
                    this.reset();
                    this.popup.destroy();
                    this.popup = null;
                }, 300);
            });

        const retryButton = this.popup.popup.querySelector('.button');
        retryButton.addEventListener('click', () => {
            this.popup.hide();
        });

        this.popup.show();
    }
}

let game = new MemoryGame();
