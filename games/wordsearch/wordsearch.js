class WordSearch {
    constructor(size = 15, nbWords = 8) {
        this.size = size;
        this.nbWords = nbWords;
        this.board = [];
        this.words = [];
        this.placedWords = [];
        this.selectedCells = [];
        this.foundWords = new Set();
        this.bestTime = BestScore.getBestScore('wordsearch');

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
        // Initialize empty board
        this.board = Array(this.size).fill(null)
            .map(() => Array(this.size).fill(""));
        
        // Select random words
        this.words = this.getRandomWords(this.nbWords);
        
        // Place words on board
        this.words.forEach(word => {
            this.placeWord(word.english);
        });
        
        // Fill empty spaces
        this.fillEmptySpaces();
        
        // Create the game board UI
        this.createBoard();
        
        // Create word list UI
        this.createWordList();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    getRandomWords(count) {
        const shuffled = [...words]
            .filter(word => !word.english.includes(" "))
            .sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
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
        // Check if word fits on board
        for (let i = 0; i < wordArray.length; i++) {
            const y = startY + i * direction[0];
            const x = startX + i * direction[1];
            
            if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
                return false;
            }
            
            // Check if space is empty or has matching letter
            if (this.board[y][x] !== "" && this.board[y][x] !== wordArray[i]) {
                return false;
            }
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

    createBoard() {
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.size}, 40px)`;
        
        this.board.forEach((row, y) => {
            row.forEach((letter, x) => {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.textContent = letter;
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.gameBoard.appendChild(cell);
            });
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
                // Clear previous selection
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
            
            // Update UI
            this.selectedCells.forEach(cell => {
                cell.element.classList.remove("selected");
                cell.element.classList.add("found");
            });
            
            document.querySelector(`.word-item[data-word="${word.french}"]`)
                .classList.add("found");

            if (this.foundWords.size === this.words.length) {
                this.handleWin();
            }
            
            return true;
        }
        return false;
    }

    handleWin() {
        const finalTime = this.timer.stop();
        const isNewBestTime = this.bestTime === null || finalTime < this.bestTime;
        
        if (isNewBestTime) {
            BestScore.setBestScore('wordsearch', finalTime);
            this.bestTime = finalTime;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        const popup = new Popup();
        const content = `
            <h2>Congratulations!</h2>
            <p>You completed the word search in <span>${this.timer.formatTime(finalTime)}</span>!</p>
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
new WordSearch(15, 8);
