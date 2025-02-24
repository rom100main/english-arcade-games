class Confetti {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.active = false;

        // Style the canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1001';

        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        return {
            x: Math.random() * this.canvas.width,
            y: -20,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            rotation: Math.random() * 0.2 - 0.1,
            rotationSpeed: Math.random() * 0.01 - 0.005
        };
    }

    start() {
        if (!document.body.contains(this.canvas)) {
            document.body.appendChild(this.canvas);
        }
        this.active = true;
        this.particles = Array(100).fill().map(() => this.createParticle());
        this.animate();
    }

    stop() {
        this.active = false;
        if (document.body.contains(this.canvas)) {
            document.body.removeChild(this.canvas);
        }
    }

    animate() {
        if (!this.active) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, index) => {
            p.y += p.speed;
            p.x += Math.sin(p.angle) * 0.5;
            p.angle += p.rotation;
            p.rotation += p.rotationSpeed;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();

            // Reset particle if it's off screen
            if (p.y > this.canvas.height + 20) {
                if (this.active) {
                    this.particles[index] = this.createParticle();
                } else {
                    this.particles.splice(index, 1);
                }
            }
        });

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Create global instance
window.confetti = new Confetti();
