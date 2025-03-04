class WordSearch {
    constructor(size = 15, nbWords = 8) {
        this.gameBoard = document.getElementById("game-board");
        this.wordList = document.getElementById("word-list");
        this.difficultySelect = document.getElementById("difficulty");

        this.size = size;
        this.nbWords = nbWords;
        this.board = [];
        this.words = [];
        this.placedWords = [];
        this.selectedCells = [];
        this.foundWords = new Set();
        this.revealedCells = new Set();
        this.difficulty = this.difficultySelect.value;
        this.bestTime = BestScore.getBestScore('wordsearch', this.difficultySelect.value);
        
        this.timer = new Timer();

        this.difficultySelect.addEventListener("change", () => {
            this.difficulty = this.difficultySelect.value;
            this.bestTime = BestScore.getBestScore('wordsearch', this.difficulty);
            this.updateBestScoreDisplay();
            this.reset();
        });
        
        this.init();
    }

    init() {
        this.revealedCells = new Set();
        this.board = Array(this.size).fill(null)
            .map(() => Array(this.size).fill(""));
        
        this.words = Random.getRandomWords(this.nbWords, this.difficulty);
        
        this.words.forEach(word => {
            this.placeWord(word.english);
        });
        this.fillEmptySpaces();
        
        this.createHintBox();
        this.createBoard();
        this.createWordList();
        
        this.setupEventListeners();

        this.updateBestScoreDisplay();
        this.timer.start();
    }

    reset() {
        this.gameBoard.innerHTML = '';
        this.wordList.innerHTML = '';
        
        this.board = [];
        this.words = [];
        this.placedWords = [];
        this.selectedCells = [];
        this.foundWords = new Set();
        
        this.timer.stop();
        this.timer.reset();
        
        this.init();
        this.timer.start();
    }

    // Create
    createBoard() {
        const gridBox = document.createElement("div");
        gridBox.className = "grid-box";
        gridBox.style.gridTemplateColumns = `repeat(${this.size}, 40px)`;
        
        this.board.forEach((row, y) => {
            row.forEach((letter, x) => {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.textContent = 'A';
                cell.dataset.x = x;
                cell.dataset.y = y;
                gridBox.appendChild(cell);

                setTimeout(() => {
                    let currentLetter = 'A';
                    const targetLetter = letter;
                    const interval = setInterval(() => {
                        cell.textContent = currentLetter;
                        if (currentLetter === targetLetter) clearInterval(interval);
                        else if (currentLetter === 'Z' ) currentLetter = 'A';
                        currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
                    }, 50);
                }, Math.random() * 500);
            });
        });
        
        this.gameBoard.appendChild(gridBox);
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

    createHintBox() {
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

        // Get all unrevealedCells that are part of a word
        const availableCells = [];
        this.placedWords.forEach(({ startX, startY, direction, length }) => {
            for (let i = 0; i < length; i++) {
                const x = startX + i * direction[1];
                const y = startY + i * direction[0];
                const cellKey = `${x},${y}`;
                if (!this.revealedCells.has(cellKey)) {
                    availableCells.push({ x, y });
                }
            }
        });

        if (availableCells.length > 0) {
            // Choose random unrevealed cell
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            const cell = document.querySelector(`.cell[data-x="${randomCell.x}"][data-y="${randomCell.y}"]`);
            
            if (cell && !cell.classList.contains('found')) {
                cell.classList.add('found');
                this.revealedCells.add(`${randomCell.x},${randomCell.y}`);
                hintButton.classList.add('used');
            }
        }
    }

    placeWord(word) {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down
            [1, -1],  // diagonal up
            [-1, 1],  // diagonal up-right
            [-1, -1], // diagonal up-left
            [-1, 0],  // up
            [0, -1]   // left
        ];

        const wordArray = word.replace(/\s/g, "").toUpperCase().split("");
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const startX = Math.floor(Math.random() * this.size);
            const startY = Math.floor(Math.random() * this.size);
            
            if (this.canPlaceWord(wordArray, startX, startY, direction)) {
                this.placedWords.push({
                    word,
                    startX,
                    startY,
                    direction,
                    length: wordArray.length
                });
                
                for (let i = 0; i < wordArray.length; i++) {
                    const y = startY + i * direction[0];
                    const x = startX + i * direction[1];
                    this.board[y][x] = wordArray[i];
                }
                placed = true;
            }
            attempts++;
        }
    }

    canPlaceWord(wordArray, startX, startY, direction) {
        for (let i = 0; i < wordArray.length; i++) {
            const y = startY + i * direction[0];
            const x = startX + i * direction[1];
            
            if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;
            
            if (this.board[y][x] !== "" && this.board[y][x] !== wordArray[i]) return false;
        }
        return true;
    }

    fillEmptySpaces() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x] === "") {
                    this.board[y][x] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }

    getSelectedWord() {
        return this.selectedCells
            .map(cell => this.board[cell.y][cell.x])
            .join("");
    }

    checkWord(selectedWord) {
        const word = this.words.find(w => 
            w.english.replace(/\s/g, "").toUpperCase() === selectedWord
        );

        if (word && !this.foundWords.has(word.french)) {
            this.foundWords.add(word.french);
            
            this.selectedCells.forEach(cell => {
                cell.element.classList.remove("selected");
                cell.element.classList.add("found");
            });
            
            document.querySelector(`.word-item[data-word="${word.french}"]`)
                .classList.add("found");

            if (this.foundWords.size === this.words.length) this.handleGameOver();
            
            return true;
        }
        return false;
    }

    // Events
    setupEventListeners() {
        let isSelecting = false;
        let startCell = null;

        const handleCellInteraction = (e) => {
            if (!isSelecting) return;
            
            const cell = e.target.closest(".cell");
            if (!cell) return;

            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            
            if (startCell) {
                document.querySelectorAll(".cell.selected").forEach(cell => {
                    cell.classList.remove("selected");
                });
                
                // Get direction and select cells in line
                const dx = Math.sign(x - startCell.x);
                const dy = Math.sign(y - startCell.y);
                let currX = startCell.x;
                let currY = startCell.y;
                
                this.selectedCells = [];
                while (currX >= 0 && currX < this.size && currY >= 0 && currY < this.size) {
                    const cell = document.querySelector(`.cell[data-x="${currX}"][data-y="${currY}"]`);
                    if (cell) {
                        cell.classList.add("selected");
                        this.selectedCells.push({
                            x: currX,
                            y: currY,
                            element: cell
                        });
                    }
                    if (currX === x && currY === y) break;
                    currX += dx;
                    currY += dy;
                }
            }
        };

        this.gameBoard.addEventListener("mousedown", (e) => {
            const cell = e.target.closest(".cell");
            if (!cell) return;
            
            isSelecting = true;
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            startCell = { x, y };
            
            handleCellInteraction(e);
        });

        this.gameBoard.addEventListener("mousemove", handleCellInteraction);
        
        document.addEventListener("mouseup", () => {
            if (!isSelecting) return;
            isSelecting = false;
            startCell = null;
            
            const selectedWord = this.getSelectedWord();
            if (!this.checkWord(selectedWord)) {
                this.selectedCells.forEach(cell => {
                    cell.element.classList.remove("selected");
                });
            }
            this.selectedCells = [];
        });
    }

    // Handlers
    handleGameOver() {
        const finalTime = this.timer.stop();
        const isNewBestTime = this.bestTime === null || finalTime < this.bestTime;
        
        if (isNewBestTime) {
            BestScore.setBestScore('wordsearch', finalTime, this.difficulty);
            this.bestTime = finalTime;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        const popup = new Popup();
        const content = `
            <h2>Congratulations!</h2>
            <p>You completed the word search in <span>${this.timer.formatTime(finalTime)}</span>!</p>
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

let game = new WordSearch(15, 8);
