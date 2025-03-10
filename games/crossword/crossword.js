class Crossword {
    constructor(size = 20, nbWords = 8) {
        this.gameBoard = document.getElementById("game-board");
        this.wordList = document.getElementById("word-list");
        this.difficultySelect = document.getElementById("difficulty");

        this.size = size;
        this.nbWords = nbWords;
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.words = [];
        this.placedWords = [];
        this.foundWords = new Set();
        this.bestTime = BestScore.getBestScore('crossword', this.difficultySelect.value);
        this.direction = null; // 'horizontal' or 'vertical'
        this.lastInput = null; // track last input cell coordinates
        this.revealedCells = new Set();

        this.difficulty = this.difficultySelect.value;
        
        this.timer = new Timer();

        this.difficultySelect.addEventListener("change", () => {
            this.difficulty = this.difficultySelect.value;
            this.bestTime = BestScore.getBestScore('crossword', this.difficulty);
            this.updateBestScoreDisplay();
            this.reset();
        });
        
        this.init();
        this.updateBestScoreDisplay();
        this.timer.start();
    }

    init() {
        this.words = Random.getRandomWords(this.nbWords, this.difficulty);
        
        this.words.sort((a, b) => b.english.length - a.english.length); // for better placement
        
        this.placeWords();
        
        this.createBoard();
        this.createWordList();
    }

    reset() {
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.words = [];
        this.placedWords = [];
        this.foundWords = new Set();
        this.direction = null;
        this.lastInput = null;
        this.revealedCells = new Set();

        this.gameBoard.innerHTML = '';
        this.wordList.innerHTML = '';

        this.timer.stop();
        this.timer.reset();
        
        this.init();
        this.timer.start();
    }

    // Create
    createBoard() {
        // Hint box
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

        // Grid box for the cells
        const gridBox = document.createElement("div");
        gridBox.className = "grid-box";
        gridBox.style.gridTemplateColumns = `repeat(${this.size}, 40px)`;
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                
                if (this.board[y][x] && this.board[y][x].letter) {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.maxLength = 1;
                    input.dataset.x = x;
                    input.dataset.y = y;
                    input.dataset.correct = this.board[y][x].letter;
                    cell.appendChild(input);
                    
                    if (this.board[y][x].numbers && this.board[y][x].numbers.length > 0) {
                        const number = document.createElement("span");
                        number.className = "number";
                        number.textContent = this.board[y][x].numbers.join('/');
                        cell.appendChild(number);
                    }
                } else {
                    cell.classList.add("empty");
                }
                
                gridBox.appendChild(cell);
            }
        }
        this.gameBoard.appendChild(gridBox);

        // Add input event listeners
        gridBox.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", (e) => {
                // Prevent input if the cell is already correct
                if (e.target.parentElement.classList.contains('correct')) {
                    e.target.value = e.target.dataset.correct;
                    return;
                }

                e.target.value = e.target.value.toUpperCase();
                if (e.target.value === e.target.dataset.correct) this.checkWords();
                
                if (e.target.value) {
                    const currentCell = e.target;
                    // Store current input for direction tracking
                    if (this.lastInput) {
                        const lastX = parseInt(this.lastInput.dataset.x);
                        const lastY = parseInt(this.lastInput.dataset.y);
                        const currentX = parseInt(currentCell.dataset.x);
                        const currentY = parseInt(currentCell.dataset.y);
                        
                        if (currentX === lastX && currentY !== lastY) this.direction = 'vertical';
                        else if (currentY === lastY && currentX !== lastX) this.direction = 'horizontal';
                    }
                    this.lastInput = currentCell;
                    
                    const next = this.findNextCell(currentCell);
                    if (next) next.focus();
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key.startsWith("Arrow")) {
                    e.preventDefault();
                    const x = parseInt(e.target.dataset.x);
                    const y = parseInt(e.target.dataset.y);
                    let nextInput = null;

                    switch (e.key) {
                        case "ArrowUp":
                            nextInput = gridBox.querySelector(`input[data-x="${x}"][data-y="${y - 1}"]`);
                            if (nextInput) this.direction = 'vertical';
                            break;
                        case "ArrowDown":
                            nextInput = gridBox.querySelector(`input[data-x="${x}"][data-y="${y + 1}"]`);
                            if (nextInput) this.direction = 'vertical';
                            break;
                        case "ArrowLeft":
                            nextInput = gridBox.querySelector(`input[data-x="${x - 1}"][data-y="${y}"]`);
                            if (nextInput) this.direction = 'horizontal';
                            break;
                        case "ArrowRight":
                            nextInput = gridBox.querySelector(`input[data-x="${x + 1}"][data-y="${y}"]`);
                            if (nextInput) this.direction = 'horizontal';
                            break;
                    }

                    if (nextInput) {
                        nextInput.focus();
                        this.lastInput = nextInput;
                    }
                    return;
                }

                // Prevent any deletion if cell is correct
                if (e.target.parentElement.classList.contains('correct') && (e.key === "Backspace" || e.key === "Delete")) {
                    e.preventDefault();
                    return;
                }
                
                // Handle backspace for non-correct cells
                if (e.key === "Backspace") {
                    if (!e.target.value) {
                        const prev = this.findPrevCell(input);
                        if (prev && !prev.parentElement.classList.contains('correct')) {
                            e.preventDefault();
                            prev.focus();
                            prev.value = "";
                            prev.parentElement.classList.remove("correct");
                        }
                    } else if (!e.target.parentElement.classList.contains('correct')) {
                        e.target.parentElement.classList.remove("correct");
                    }
                }
            });
        });
    }

    createWordList() {
        this.placedWords.forEach((placed, index) => {
            const originalWord = this.words.find(w => w.english.toUpperCase() === placed.word);
            if (!originalWord) return;

            const wordItem = document.createElement("div");
            wordItem.className = "word-item";
            wordItem.textContent = `${index + 1}. ${originalWord.french}`;
            wordItem.dataset.word = originalWord.english;
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

        // Get all unrevealedCells that are part of placed words
        const availableCells = [];
        this.placedWords.forEach(placed => {
            let { x, y, word, direction } = placed;

            for (let i = 0; i < word.length; i++) {
                const cellX = direction === 'horizontal' ? x + i : x;
                const cellY = direction === 'horizontal' ? y : y + i;
                const input = this.gameBoard.querySelector(`input[data-x="${cellX}"][data-y="${cellY}"]`);
                const cellKey = `${cellX},${cellY}`;

                if (input && !input.parentElement.classList.contains('correct') && !this.revealedCells.has(cellKey)) {
                    availableCells.push({ input, x: cellX, y: cellY, letter: word[i] });
                }
            }
        });

        if (availableCells.length > 0) {
            // Choose random unrevealed cell
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            
            if (randomCell.input) {
                randomCell.input.value = randomCell.letter;
                randomCell.input.parentElement.classList.add('correct');
                this.revealedCells.add(`${randomCell.x},${randomCell.y}`);
                hintButton.classList.add('used');
                this.checkWords();
            }
        }
    }

    placeWords() {
        let wordNumber = 1;
        
        // Try to place first word horizontally in the middle
        const firstWord = this.words[0].english.toUpperCase();
        const startY = Math.floor(this.size / 2);
        const startX = Math.floor((this.size - firstWord.length) / 2);
        
        for (let i = 0; i < firstWord.length; i++) {
            this.board[startY][startX + i] = {
                letter: firstWord[i],
                isStart: i === 0,
                numbers: i === 0 ? [wordNumber++] : [],
                word: firstWord
            };
        }
        
        this.placedWords.push({
            word: firstWord,
            direction: 'horizontal',
            x: startX,
            y: startY
        });

        // Try to place remaining words
        for (let i = 1; i < this.words.length; i++) {
            const word = this.words[i].english.toUpperCase();
            let placed = false;

            // Try to find intersections with placed words
            for (let y = 0; y < this.size && !placed; y++) {
                for (let x = 0; x < this.size && !placed; x++) {
                    if (this.board[y][x] && this.board[y][x].letter) {
                        const letter = this.board[y][x].letter;
                        const letterIndex = word.indexOf(letter);
                        
                        if (letterIndex !== -1) {
                            // Try vertical placement
                            if (!this.placedWords.some(w => w.word === word)) {
                                const startY = y - letterIndex;
                                if (this.canPlaceWordVertically(word, x, startY)) {
                                    this.placeWordVertically(word, x, startY, wordNumber++);
                                    placed = true;
                                }
                            }
                            
                            // Try horizontal placement
                            if (!placed && !this.placedWords.some(w => w.word === word)) {
                                const startX = x - letterIndex;
                                if (this.canPlaceWordHorizontally(word, startX, y)) {
                                    this.placeWordHorizontally(word, startX, y, wordNumber++);
                                    placed = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    canPlaceWordHorizontally(word, startX, y) {
        if (startX < 0 || startX + word.length > this.size) return false;
        
        for (let i = 0; i < word.length; i++) {
            const cell = this.board[y][startX + i];
            if (cell && cell.letter) {
                if (cell.letter !== word[i]) return false;
                continue;
            }

            if (y > 0 && this.board[y-1][startX + i]?.letter) return false;
            if (y < this.size-1 && this.board[y+1][startX + i]?.letter) return false;
        }

        if (startX > 0 && this.board[y][startX - 1]?.letter) return false;
        if (startX + word.length < this.size && this.board[y][startX + word.length]?.letter) return false;

        return true;
    }

    canPlaceWordVertically(word, x, startY) {
        if (startY < 0 || startY + word.length > this.size) return false;
        
        for (let i = 0; i < word.length; i++) {
            const cell = this.board[startY + i]?.[x];
            if (cell && cell.letter) {
                if (cell.letter !== word[i]) return false;
                continue;
            }

            if (x > 0 && this.board[startY + i][x-1]?.letter) return false;
            if (x < this.size-1 && this.board[startY + i][x+1]?.letter) return false;
        }

        if (startY > 0 && this.board[startY - 1]?.[x]?.letter) return false;
        if (startY + word.length < this.size && this.board[startY + word.length]?.[x]?.letter) return false;

        return true;
    }

    placeWordHorizontally(word, startX, y, number) {
        for (let i = 0; i < word.length; i++) {
            const cell = this.board[y][startX + i] || {};
            this.board[y][startX + i] = {
                ...cell,
                letter: word[i],
                isStart: i === 0 && !cell.isStart,
                numbers: i === 0 ? [...(cell.numbers || []), number] : (cell.numbers || []),
                word: word
            };
        }
        
        this.placedWords.push({
            word,
            direction: 'horizontal',
            x: startX,
            y
        });
    }

    placeWordVertically(word, x, startY, number) {
        for (let i = 0; i < word.length; i++) {
            const cell = this.board[startY + i]?.[x] || {};
            this.board[startY + i][x] = {
                ...cell,
                letter: word[i],
                isStart: i === 0 && !cell.isStart,
                numbers: i === 0 ? [number, ...(cell.numbers || [])] : (cell.numbers || []),
                word: word
            };
        }
        
        this.placedWords.push({
            word,
            direction: 'vertical',
            x,
            y: startY
        });
    }

    findNextCell(currentInput) {
        const x = parseInt(currentInput.dataset.x);
        const y = parseInt(currentInput.dataset.y);
        const gridBox = this.gameBoard.querySelector('.grid-box');
        
        if (this.direction === 'vertical') {
            const nextInput = gridBox.querySelector(`input[data-x="${x}"][data-y="${y + 1}"]`);
            if (nextInput && !nextInput.parentElement.classList.contains('correct')) {
                return nextInput;
            }
        } else {
            const nextInput = gridBox.querySelector(`input[data-x="${x + 1}"][data-y="${y}"]`);
            if (nextInput && !nextInput.parentElement.classList.contains('correct')) {
                return nextInput;
            }
        }

        // If can't move in current direction, try any next available cell
        const inputs = Array.from(gridBox.querySelectorAll("input"));
        const currentIndex = inputs.indexOf(currentInput);
        for (let i = currentIndex + 1; i < inputs.length; i++) {
            if (!inputs[i].parentElement.classList.contains('correct')) {
                return inputs[i];
            }
        }
        return null;
    }

    findPrevCell(currentInput) {
        const x = parseInt(currentInput.dataset.x);
        const y = parseInt(currentInput.dataset.y);
        const gridBox = this.gameBoard.querySelector('.grid-box');
        
        if (this.direction === 'vertical') {
            const prevInput = gridBox.querySelector(`input[data-x="${x}"][data-y="${y - 1}"]`);
            if (prevInput && !prevInput.parentElement.classList.contains('correct')) {
                return prevInput;
            }
        } else {
            const prevInput = gridBox.querySelector(`input[data-x="${x - 1}"][data-y="${y}"]`);
            if (prevInput && !prevInput.parentElement.classList.contains('correct')) {
                return prevInput;
            }
        }

        // If can't move in current direction, try any previous available cell
        const inputs = Array.from(gridBox.querySelectorAll("input"));
        const currentIndex = inputs.indexOf(currentInput);
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (!inputs[i].parentElement.classList.contains('correct')) {
                return inputs[i];
            }
        }
        return null;
    }

    checkWords() {
        const input = event.target;
        const x = parseInt(input.dataset.x);
        const y = parseInt(input.dataset.y);
        const gridBox = this.gameBoard.querySelector('.grid-box');

        let anyWordComplete = false;

        // Check horizontal words
        const horizontalWords = this.placedWords.filter(w => w.direction === 'horizontal' && y === w.y);
        horizontalWords.forEach(placed => {
            const originalWord = this.words.find(w => w.english.toUpperCase() === placed.word);
            if (!originalWord || this.foundWords.has(originalWord.french)) return;

            let complete = true;
            for (let i = 0; i < placed.word.length; i++) {
                const input = gridBox.querySelector(`input[data-x="${placed.x + i}"][data-y="${placed.y}"]`);
                if (!input || input.value !== placed.word[i]) {
                    complete = false;
                    break;
                }
            }

            if (complete) {
                anyWordComplete = true;
                this.foundWords.add(originalWord.french);
                document.querySelector(`[data-word="${originalWord.english}"]`).classList.add("found");
            }
        });

        // Check vertical words
        const verticalWords = this.placedWords.filter(w => w.direction === 'vertical' && x === w.x);
        verticalWords.forEach(placed => {
            const originalWord = this.words.find(w => w.english.toUpperCase() === placed.word);
            if (!originalWord || this.foundWords.has(originalWord.french)) return;

            let complete = true;
            for (let i = 0; i < placed.word.length; i++) {
                const input = gridBox.querySelector(`input[data-x="${placed.x}"][data-y="${placed.y + i}"]`);
                if (!input || input.value !== placed.word[i]) {
                    complete = false;
                    break;
                }
            }

            if (complete) {
                anyWordComplete = true;
                this.foundWords.add(originalWord.french);
                document.querySelector(`[data-word="${originalWord.english}"]`).classList.add("found");
            }
        });

        if (anyWordComplete) {
            this.placedWords.forEach(placed => {
                if (this.foundWords.has(this.words.find(w => w.english.toUpperCase() === placed.word).french)) {
                    if (placed.direction === 'horizontal') {
                        for (let i = 0; i < placed.word.length; i++) {
                            const input = gridBox.querySelector(`input[data-x="${placed.x + i}"][data-y="${placed.y}"]`);
                            if (input) {
                                input.parentElement.classList.add('correct');
                            }
                        }
                    } else {
                        for (let i = 0; i < placed.word.length; i++) {
                            const input = gridBox.querySelector(`input[data-x="${placed.x}"][data-y="${placed.y + i}"]`);
                            if (input) {
                                input.parentElement.classList.add('correct');
                            }
                        }
                    }
                }
            });
        }

        if (this.foundWords.size === this.placedWords.length) {
            this.handleGameOver();
        }
    }

    // Handlers
    handleGameOver() {
        const finalTime = this.timer.stop();
        const isNewBestTime = this.bestTime === null || finalTime < this.bestTime;
        
        if (isNewBestTime) {
            BestScore.setBestScore('crossword', finalTime, this.difficulty);
            this.bestTime = finalTime;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        const popup = new Popup();
        const content = `
            <h2>Congratulations!</h2>
            <p>You completed the crossword in <span>${this.timer.formatTime(finalTime)}</span>!</p>
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

let game = new Crossword();
