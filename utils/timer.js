class Timer {
    constructor(options = {}) {
        this.startTime = null;
        this.timerInterval = null;
        this.timerDisplay = document.getElementById("timer");
        this.duration = options.duration;
        this.countdown = options.countdown || false;
        this.onTimeout = options.onTimeout;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now();
        this.isRunning = true;
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
        if (!this.isRunning) return 0;
        
        const elapsed = Date.now() - this.startTime;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.startTime = null;
        this.isRunning = false;
        return elapsed;
    }

    reset() {
        this.stop();
        this.startTime = null;
        this.isRunning = false;
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
}
