class Timer {
    constructor(options = {}) {
        this.startTime = null;
        this.timerInterval = null;
        this.timerDisplay = document.getElementById("timer");
        this.duration = options.duration;
        this.countdown = options.countdown || false;
        this.onTimeout = options.onTimeout;
    }

    start() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            
            if (this.countdown && this.duration) {
                const remaining = Math.max(0, this.duration - Math.floor(elapsed / 1000));
                this.timerDisplay.textContent = remaining;
                
                if (remaining <= 0) {
                    this.stop();
                    if (this.onTimeout) this.onTimeout();
                }
            } else {
                this.timerDisplay.textContent = this.formatTime(elapsed);
            }
        }, 100);
    }

    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            return Date.now() - this.startTime;
        }
        return 0;
    }

    reset() {
        this.stop();
        this.start();
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
}
