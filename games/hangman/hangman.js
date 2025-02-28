class hangman {
    constructor() {
        this.counter = document.getElementById("counter");
        this.word_field = document.getElementById("word_field");
        this.guess_field = document.getElementById("guess_area");
        this.guess_button = document.getElementById("guess_button");
        this.guessed_field = document.getElementById("guessed_field");
        this.default_char = "-";
        this.won_popup = null;
        this.lost_popup = null;
        this.confetti = null;
        this.word = "";
        this.left = 10;
        this.guessed = [];
        
        this.init();
    }

    init() {
        //* * * * * CONFETTI * * * * *
        window.confetti = new Confetti();

        // * * * * * WON * * * * *
        this.won_popup = new Popup();
        let won_content = `
            <div class="popup-content">
                <h2>Congratulations!</h2>
                <p>You found the correct word.</p>
                <button class="retry-button">Play again</button>
            </div>
        `;
        this.won_popup.onHide(() => {
            const canvas = window.confetti.canvas;
            if (canvas) {
                canvas.style.transition = 'opacity 0.3s ease-out';
                canvas.style.opacity = '0';
                setTimeout(() => {
                    window.confetti.stop();
                    canvas.style.opacity = '1';
                    canvas.style.transition = '';
                }, 300);
            }
            this.resetGame();
        });
        this.won_popup.setContent(won_content);
        this.won_popup.popup.querySelector('.retry-button').addEventListener('click', () => { this.won_popup.hide() });

        // * * * * * LOST * * * * *
        this.lost_popup = new Popup();
        let lost_content = `
            <div class="popup-content">
                <h2>Game Over</h2>
                <p>Oh no, you have no tries left...</p>
                <button class="retry-button">Play again</button>
            </div>
        `;
        this.lost_popup.setContent(lost_content);
        this.lost_popup.popup.querySelector('.retry-button').addEventListener('click', () => { this.lost_popup.hide() });

        // * * * * * GUESS * * * * *
        this.guess_button.addEventListener('click', () => { this.guess() } )

        this.resetGame();
    }

    refreshCount() {
        this.counter.textContent = this.left.toString();
    }

    randomWord() {
        var index = random(0, words.length - 1);
        this.word = words[index].english;

        this.left = this.word.length + 10;
        console.log("Word: " + this.word);

        this.word_field.innerHTML = "";
        for (let letter = 0; letter < this.word.length; letter++) {
            let text = document.createElement('p');
            text.innerHTML = this.default_char;
            this.word_field.append(text); 
        }

        this.revealRandomLetter(Math.max(this.word.length / 3, 1));
        this.refreshCount();
    }

    revealRandomLetter(n) {
        var inword = [];
        for (let i = 0; i < n; i++) {
            var index = random(0, this.word.length - 1);
            inword.push(this.word[index]);
        }
        inword.forEach(element => {
            for (let i = 0; i < this.word.length; i++) {
                if (this.word[i] == element) this.word_field.children[i].textContent = this.word[i];
            }
        });
    }

    guess() {
        var letter = this.guess_field.value;
        var found = false;
        for (let i = 0; i < this.word.length; i++) {
            if (this.word[i].toLowerCase() == letter.toLowerCase()) {
                this.word_field.children[i].textContent = this.word[i];
                found = true;
            }
        }
        this.guess_field.value = "";
        this.addGuessed(letter);
        if (!found) this.left--;
        this.refreshCount();
        if (this.isComplete()) {
            this.showWonPopup();
        }
        else if (this.left == 0) {
            this.showLostPopup();
        }
    }

    isComplete() {
        for (let i = 0; i < this.word.length; i++) {
            if (this.word_field.children[i].textContent == this.default_char) {
                return false;
            }
        }
        return true;
    }

    addGuessed(letter) {
        this.guessed.push(letter);
        this.guessed_field.innerHTML += "<p>" + letter + "</p>";
    }

    resetGuessed() {
        this.guessed = [];
        this.guessed_field.innerHTML = "";
    }

    resetGame() {
        this.resetGuessed();
        this.randomWord();
    }

    showWonPopup() {
        window.confetti.start();
        this.won_popup.show();
    }

    showLostPopup() {
        this.lost_popup.show();
    }
}

new hangman();
