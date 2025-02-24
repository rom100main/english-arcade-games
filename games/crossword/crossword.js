class Crossword {
    constructor(size = 15, nbWords = 8) {
        this.size = size;
        this.nbWords = Math.min(nbWords, words.length);
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.words = [];
        this.placedWords = [];
        this.foundWords = new Set();
        this.startTime = null;
        this.timerInterval = null;
        this.bestTime = BestScore.getBestScore('crossword');
        this.direction = null; // 'horizontal' or 'vertical'
        this.lastInput = null; // Track last input cell coordinates

        this.gameBoard = document.getElementById("game-board");
        this.wordList = document.getElementById("word-list");
        this.timerDisplay = document.getElementById("timer");
        
        this.init();
        this.updateBestScoreDisplay();
        this.startTimer();
    }


    updateBestScoreDisplay() {
        const bestScoreElement = document.getElementById("best-score");
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestTime === Infinity ? "-" : this.formatTime(this.bestTime);
        }
    }

    init() {
        // Select random words
        this.words = this.getRandomWords(this.nbWords);
        
        // Sort words by length (descending) for better placement
        this.words.sort((a, b) => b.english.length - a.english.length);
        
        // Place words on board
        this.placeWords();
        
        // Create the game board UI
        this.createBoard();
        
        // Create word list UI with hints
        this.createWordList();
    }

    getRandomWords(count) {
        const shuffled = [...words]
            .filter(word => !word.english.includes(" "))
            .sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
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

        let hasIntersection = false;
        
        // Check if space is available and look for intersections
        for (let i = 0; i < word.length; i++) {
            const cell = this.board[y][startX + i];
            if (cell && cell.letter) {
                // If there's a letter, it must match
                if (cell.letter !== word[i]) return false;
                hasIntersection = true;
                continue;
            }

            // If no intersection at this point, check for parallel words
            if (!hasIntersection) {
                // Check cells above and below for parallel words
                if (y > 0 && this.board[y-1][startX + i]?.letter) return false;
                if (y < this.size-1 && this.board[y+1][startX + i]?.letter) return false;
            }
        }

        // Check left and right ends for touching words
        if (startX > 0 && this.board[y][startX - 1]?.letter) return false;
        if (startX + word.length < this.size && this.board[y][startX + word.length]?.letter) return false;

        return true;
    }

    canPlaceWordVertically(word, x, startY) {
        if (startY < 0 || startY + word.length > this.size) return false;

        let hasIntersection = false;
        
        // Check if space is available and look for intersections
        for (let i = 0; i < word.length; i++) {
            const cell = this.board[startY + i]?.[x];
            if (cell && cell.letter) {
                // If there's a letter, it must match
                if (cell.letter !== word[i]) return false;
                hasIntersection = true;
                continue;
            }

            // If no intersection at this point, check for parallel words
            if (!hasIntersection) {
                // Check cells left and right for parallel words
                if (x > 0 && this.board[startY + i][x-1]?.letter) return false;
                if (x < this.size-1 && this.board[startY + i][x+1]?.letter) return false;
            }
        }

        // Check top and bottom ends for touching words
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
                numbers: i === 0 ? [...(cell.numbers || []), number] : (cell.numbers || []),
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

    createBoard() {
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.size}, 40px)`;
        
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
                
                this.gameBoard.appendChild(cell);
            }
        }

        // Add input event listeners
        this.gameBoard.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", (e) => {
                // Prevent input if the cell is already correct
                if (e.target.parentElement.classList.contains('correct')) {
                    e.target.value = e.target.dataset.correct;
                    return;
                }

                e.target.value = e.target.value.toUpperCase();
                if (e.target.value === e.target.dataset.correct) {
                    this.checkWords();
                }
                
                if (e.target.value) {
                    const currentCell = e.target;
                    // Store current input for direction tracking
                    if (this.lastInput) {
                        const lastX = parseInt(this.lastInput.dataset.x);
                        const lastY = parseInt(this.lastInput.dataset.y);
                        const currentX = parseInt(currentCell.dataset.x);
                        const currentY = parseInt(currentCell.dataset.y);
                        
                        if (currentX === lastX && currentY !== lastY) {
                            this.direction = 'vertical';
                        } else if (currentY === lastY && currentX !== lastX) {
                            this.direction = 'horizontal';
                        }
                    }
                    this.lastInput = currentCell;
                    
                    const next = this.findNextCell(currentCell);
                    if (next) next.focus();
                }
            });

            input.addEventListener("keydown", (e) => {
                // Handle arrow key navigation
                if (e.key.startsWith("Arrow")) {
                    e.preventDefault();
                    const x = parseInt(e.target.dataset.x);
                    const y = parseInt(e.target.dataset.y);
                    let nextInput = null;

                    switch (e.key) {
                        case "ArrowUp":
                            nextInput = this.gameBoard.querySelector(`input[data-x="${x}"][data-y="${y - 1}"]`);
                            if (nextInput) this.direction = 'vertical';
                            break;
                        case "ArrowDown":
                            nextInput = this.gameBoard.querySelector(`input[data-x="${x}"][data-y="${y + 1}"]`);
                            if (nextInput) this.direction = 'vertical';
                            break;
                        case "ArrowLeft":
                            nextInput = this.gameBoard.querySelector(`input[data-x="${x - 1}"][data-y="${y}"]`);
                            if (nextInput) this.direction = 'horizontal';
                            break;
                        case "ArrowRight":
                            nextInput = this.gameBoard.querySelector(`input[data-x="${x + 1}"][data-y="${y}"]`);
                            if (nextInput) this.direction = 'horizontal';
                            break;
                    }

                    if (nextInput) {
                        nextInput.focus();
                        this.lastInput = nextInput;
                    }
                    return;
                }

                // Prevent any deletion if the cell is correct
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

    findNextCell(currentInput) {
        const x = parseInt(currentInput.dataset.x);
        const y = parseInt(currentInput.dataset.y);
        
        // Try to move in the current direction first
        if (this.direction === 'vertical') {
            // Look for next cell below
            const nextInput = this.gameBoard.querySelector(`input[data-x="${x}"][data-y="${y + 1}"]`);
            if (nextInput && !nextInput.parentElement.classList.contains('correct')) {
                return nextInput;
            }
        } else {
            // Default to horizontal or when no direction is set
            const nextInput = this.gameBoard.querySelector(`input[data-x="${x + 1}"][data-y="${y}"]`);
            if (nextInput && !nextInput.parentElement.classList.contains('correct')) {
                return nextInput;
            }
        }

        // If can't move in current direction, try any next available cell
        const inputs = Array.from(this.gameBoard.querySelectorAll("input"));
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
        
        // Try to move in the current direction first
        if (this.direction === 'vertical') {
            // Look for previous cell above
            const prevInput = this.gameBoard.querySelector(`input[data-x="${x}"][data-y="${y - 1}"]`);
            if (prevInput && !prevInput.parentElement.classList.contains('correct')) {
                return prevInput;
            }
        } else {
            // Default to horizontal or when no direction is set
            const prevInput = this.gameBoard.querySelector(`input[data-x="${x - 1}"][data-y="${y}"]`);
            if (prevInput && !prevInput.parentElement.classList.contains('correct')) {
                return prevInput;
            }
        }

        // If can't move in current direction, try any previous available cell
        const inputs = Array.from(this.gameBoard.querySelectorAll("input"));
        const currentIndex = inputs.indexOf(currentInput);
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (!inputs[i].parentElement.classList.contains('correct')) {
                return inputs[i];
            }
        }
        return null;
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

    checkWords() {
        const input = event.target;
        const x = parseInt(input.dataset.x);
        const y = parseInt(input.dataset.y);

        let anyWordComplete = false;

        // Check horizontal words
        const horizontalWords = this.placedWords.filter(w => w.direction === 'horizontal' && y === w.y);
        horizontalWords.forEach(placed => {
            const originalWord = this.words.find(w => w.english.toUpperCase() === placed.word);
            if (!originalWord || this.foundWords.has(originalWord.french)) return;

            let complete = true;
            for (let i = 0; i < placed.word.length; i++) {
                const input = this.gameBoard.querySelector(`input[data-x="${placed.x + i}"][data-y="${placed.y}"]`);
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
                const input = this.gameBoard.querySelector(`input[data-x="${placed.x}"][data-y="${placed.y + i}"]`);
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

        // Mark cells as correct if they are part of any completed word
        if (anyWordComplete) {
            // Check all placed words to mark completed cells
            this.placedWords.forEach(placed => {
                if (this.foundWords.has(this.words.find(w => w.english.toUpperCase() === placed.word).french)) {
                    // Mark all cells in this completed word
                    if (placed.direction === 'horizontal') {
                        for (let i = 0; i < placed.word.length; i++) {
                            const input = this.gameBoard.querySelector(`input[data-x="${placed.x + i}"][data-y="${placed.y}"]`);
                            if (input) {
                                input.parentElement.classList.add('correct');
                            }
                        }
                    } else {
                        for (let i = 0; i < placed.word.length; i++) {
                            const input = this.gameBoard.querySelector(`input[data-x="${placed.x}"][data-y="${placed.y + i}"]`);
                            if (input) {
                                input.parentElement.classList.add('correct');
                            }
                        }
                    }
                }
            });
        }

        // Check for win condition
        if (this.foundWords.size === this.words.length) {
            this.handleWin();
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.timerDisplay.textContent = this.formatTime(elapsed);
        }, 1000);
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    handleWin() {
        clearInterval(this.timerInterval);
        const finalTime = Date.now() - this.startTime;
        const isNewBestTime = finalTime < this.bestTime;
        
        if (isNewBestTime) {
            BestScore.setBestScore('crossword', finalTime);
            this.bestTime = finalTime;
            this.updateBestScoreDisplay();
            window.confetti.start();
        }

        const popup = new Popup();
        const content = `
            <h2>Congratulations!</h2>
            <p>You completed the crossword in <span>${this.formatTime(finalTime)}</span>!</p>
            <p class="best-score-text" style="color: ${isNewBestTime ? "#27ae60" : "#666"}">
                ${isNewBestTime ? "🎉 New Best Time! 🎉" : `Best Time: ${this.formatTime(this.bestTime)}`}
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
new Crossword(15, 8);
