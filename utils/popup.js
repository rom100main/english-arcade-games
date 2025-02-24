class Popup {
    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'overlay';
        
        this.popup = document.createElement('div');
        this.popup.className = 'win-popup';
        this.overlay.style.opacity = '0';
        this.popup.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        this.popup.style.visibility = 'hidden';
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.popup);

        this.onHideCallbacks = [];
    }

    setContent(htmlContent) {
        this.popup.innerHTML = htmlContent;
        return this;
    }

    onHide(callback) {
        this.onHideCallbacks.push(callback);
        return this;
    }

    show() {
        this.overlay.style.visibility = 'visible';
        this.popup.style.visibility = 'visible';
        
        // Force a reflow to ensure the transition works
        this.popup.offsetHeight;
        this.overlay.offsetHeight;

        requestAnimationFrame(() => {
            this.overlay.classList.add('show');
            this.popup.classList.add('show');
        });
        
        return this;
    }

    hide() {
        this.overlay.classList.remove('show');
        this.popup.classList.remove('show');
        
        setTimeout(() => {
            this.overlay.style.visibility = 'hidden';
            this.popup.style.visibility = 'hidden';
            this.onHideCallbacks.forEach(callback => callback());
        }, 300); // Match CSS transition duration
        
        return this;
    }

    destroy() {
        document.body.removeChild(this.overlay);
        document.body.removeChild(this.popup);
    }
}

// Export to window object for accessibility
window.Popup = Popup;
