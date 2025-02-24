class hangman {
    constructor() {
        this.counter = document.getElementById("counter");
        this.word_field = document.getElementById("word_field");
        this.guess_field = document.getElementById("guess_field");
        this.guess_button = document.getElementById("guess_button");
        this.default_char = "-";
        this.won_popup = null;
        this.lost_popup = null;
        this.confetti = null;
        this.word = "";
        this.left = 10;
        
        this.init();
    }

    init() {
        window.confetti = new Confetti();
        this.won_popup = new Popup();
        this.lost_popup = new Popup();

        let won_content = "<div>"
        + "<p>Congratulation! You won found the word.</p>"
        + "<button class=\"retry-button\">Play again</button>"
        + "</div>"

        let lost_content = "<div>"
        + "<p>Oh no, you have no tries left...</p>"
        + "<button class=\"retry-button\">Play again</button>"
        + "</div>"

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

            // Reset game after transition
            setTimeout(() => {
                this.won_popup.destroy();
                this.won_popup = null;
            }, 300);
            this.resetGame();
        });
        this.won_popup.setContent(won_content);
        this.won_popup.popup.querySelector('.retry-button').addEventListener('click', () => { this.won_popup.hide() });

        this.lost_popup.onHide(() => {
            // Reset game after transition
            setTimeout(() => {
                this.lost_popup.destroy();
                this.lost_popup = null;
            }, 300);
            this.resetGame();
        });
        this.lost_popup.setContent(lost_content);
        this.lost_popup.popup.querySelector('.retry-button').addEventListener('click', () => { this.lost_popup.hide() });

        this.randomWord();
        this.guess_button.addEventListener('click', () => { this.guess() } )
    }

    resetGame() {
        this.randomWord();
    }

    refreshCount() {
        counter.textContent = this.left.toString();
    }

    randomWord() {
        var index = random(0, words.length - 1);
        this.word = words[index].english;

        this.left = this.word.length + 10;
        this.refreshCount();

        console.log("Word: " + this.word);

        this.word_field.innerHTML = "";
        for (let letter = 0; letter < this.word.length; letter++) {
            let text = document.createElement('p');
            text.innerHTML = this.default_char;
            this.word_field.append(text); 
        }
    }

    guess() {
        var letter = guess_field.value;
        for (let i = 0; i < this.word.length; i++) {
            if (this.word[i].toLowerCase() == letter.toLowerCase()) {
                this.word_field.children[i].textContent = letter;
            }
        }
        this.guess_field.value = "";
        this.left--;
        this.refreshCount();
        if (this.isComplete()) {
            this.showWonpopup();
        }
        else if (this.left == 0) {
            console.log("Lost");
            this.showLostpopup();
        }
    }

    showWonpopup() {
        window.confetti.start();
        this.won_popup.show();
    }

    showLostpopup() {
        this.lost_popup.show();
    }

    isComplete() {
        for (let i = 0; i < this.word.length; i++) {
            if (this.word_field.children[i].textContent == this.default_char) {
                return false;
            }
        }
        return true;
    }
}

new hangman();