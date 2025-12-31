/* Configuration */
const messages = {
    1: "You shine in ways I can’t quite explain.",
    2: "You carry quiet strength — something that feels close to home.",
    3: "You’re the perfect description of a gentleman.",
    4: "Human sunshine.",
    5: "You are kinder and gentler than you realize.",
    6: "Officially drawing the curtains on 25 — what a beautiful way to bid farewell. Couldn’t have asked for better company.",
    7: "You’re a deep thinker — the universe likes that, and so do I.",
    8: "You’re one hell of an amazing human.",
    9: "Awesome sauce. Officially my favourite human to exist.",
    10: "You will always be seen and heard."
};

/**
 * STARFIELD SYSTEM (Canvas)
 */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let width, height;
let stars = [];
let shootingStars = [];
let particles = []; // Floating dust
let mouseX = 0, mouseY = 0;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
    initParticles();
}

// Parallax Mouse Tracking
document.addEventListener('mousemove', (e) => {
    // Center origin (0,0) handling
    mouseX = (e.clientX - width / 2) * 0.05;
    mouseY = (e.clientY - height / 2) * 0.05;
});

class Star {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2 + 0.5; // Depth
        this.size = Math.random() * 2.0 + 1.0;
        this.baseAlpha = Math.random() * 0.5 + 0.3;
        this.alpha = this.baseAlpha;
        this.pulse = Math.random() * 0.03;
        this.pulseDir = 1;
    }
    update() {
        // Standard drift + Mouse Parallax
        this.x -= (0.1 * this.z) + (mouseX * 0.01 * this.z);
        this.y -= (mouseY * 0.01 * this.z);

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Twinkle
        this.alpha += this.pulse * this.pulseDir;
        if (this.alpha > 0.9 || this.alpha < 0.2) this.pulseDir *= -1;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (this.z * 0.4), 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.speedY = Math.random() * 0.3 + 0.1;
        this.alpha = Math.random() * 0.4;
    }
    update() {
        this.y -= this.speedY; // Float up
        if (this.y < 0) {
            this.y = height;
            this.x = Math.random() * width;
        }
    }
    draw() {
        ctx.fillStyle = `rgba(150, 220, 255, ${this.alpha})`; // Blue-ish tint
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ShootingStar {
    constructor(forced = false) {
        this.init(forced);
    }
    init(forced) {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.6;
        this.len = Math.random() * 100 + 100;
        this.speed = Math.random() * 10 + 10;
        this.size = Math.random() * 2;
        this.dirX = -1;
        this.dirY = 0.5;
        this.active = true;
        this.opacity = 1;

        if (forced) {
            this.len = 300;
            this.speed = 25;
            this.size = 3;
            this.opacity = 1;
            this.x = Math.random() * width * 0.8 + width * 0.1;
            this.y = Math.random() * height * 0.3;
        }
    }
    update() {
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
        this.len -= this.speed * 0.2;
        this.opacity -= 0.015;
        if (this.len <= 0 || this.opacity <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        const tailX = this.x - (this.dirX * this.len);
        const tailY = this.y - (this.dirY * this.len);

        const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${this.opacity})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
    }
}

function initStars() {
    stars = [];
    for (let i = 0; i < 300; i++) stars.push(new Star());
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) particles.push(new Particle());
}

// Sparkle System
let sparkles = [];

class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1; // slightly larger than stars
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2 + 1; // burst speed
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        // Gravity? No, space is floaty.
        // Friction
        this.vx *= 0.95;
        this.vy *= 0.95;
    }
    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `rgba(200, 230, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1; // Reset
    }
}

function createBurst(x, y) {
    for (let i = 0; i < 15; i++) {
        sparkles.push(new Sparkle(x, y));
    }
}

// Global click/touch for burst
document.addEventListener('mousedown', (e) => createBurst(e.clientX, e.clientY));
// For touch devices
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    createBurst(touch.clientX, touch.clientY);
}, { passive: true });


function animate() {
    // Clear canvas - Transparent so CSS background shows
    ctx.clearRect(0, 0, width, height);

    // Draw Particles (Background layer)
    particles.forEach(p => { p.update(); p.draw(); });

    // --- CONSTELLATION EFFECT ---
    // Connect particles near mouse
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 0.5;

    // We'll use the 'particles' array for connections to not overwhelm with all stars
    particles.forEach(p => {
        const dx = p.x - (width / 2 + mouseX / 0.05); // Approximating mouse pos removal of parallax logic reverse... 
        // Actually simpler: we have mouseX/Y relative to center stored from mousemove listener
        // Let's just track raw mouse coordinates too for this effect.
    });

    // Re-doing mouse tracking for canvas logic
}
// Fix: We need raw mouse coordinates for constellation
let rawMouseX = -1000, rawMouseY = -1000;
document.addEventListener('mousemove', (e) => {
    rawMouseX = e.clientX;
    rawMouseY = e.clientY;
    // Parallax values
    mouseX = (e.clientX - width / 2) * 0.05;
    mouseY = (e.clientY - height / 2) * 0.05;
});

// Redefine animate to include logic properly
function animate() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Particles & Constellation Connections
    particles.forEach(p => {
        p.update();
        p.draw();

        // Connect to mouse
        const dist = Math.hypot(p.x - rawMouseX, p.y - rawMouseY);
        if (dist < 120) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 120})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(rawMouseX, rawMouseY);
            ctx.stroke();
        }
    });

    // 2. Draw Stars
    stars.forEach(s => { s.update(); s.draw(); });

    // 3. Sparkles (Burst)
    sparkles.forEach((s, i) => {
        s.update();
        s.draw();
        if (s.alpha <= 0) sparkles.splice(i, 1);
    });

    // 4. Shooting Stars
    if (Math.random() < 0.007) shootingStars.push(new ShootingStar());

    shootingStars.forEach((s, i) => {
        s.update();
        s.draw();
        if (!s.active) shootingStars.splice(i, 1);
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();


/**
 * APP LOGIC
 */
const startOverlay = document.getElementById('start-overlay');
const enterBtn = document.getElementById('enter-btn');
const app = document.getElementById('app');
const bgm = document.getElementById('bgm');
const musicToggle = document.getElementById('music-toggle');
const iconOn = document.getElementById('icon-sound-on');
const iconOff = document.getElementById('icon-sound-off');

// Sections
const introSeq = document.getElementById('intro-sequence');
const interactArea = document.getElementById('interaction-area');
const magicInput = document.getElementById('magic-input');
const inputContainer = document.querySelector('.input-container');
const messageDisplay = document.getElementById('message-display');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const endingSeq = document.getElementById('ending-sequence');

bgm.volume = 0.4;
let isPlaying = false;

// 1. ENTER EXPERIENCE
enterBtn.addEventListener('click', () => {
    // Play Audio
    bgm.play().then(() => {
        isPlaying = true;
        updateIcon();
    }).catch(e => console.log(e));

    // Fade out overlay
    startOverlay.style.opacity = '0';
    setTimeout(() => {
        startOverlay.classList.add('hidden');
        app.classList.remove('hidden'); // Show app
        startIntro();
    }, 1500);
});

function startIntro() {
    setTimeout(() => {
        // Fade out initial text
        introSeq.querySelector('h1').style.animation = 'fadeOut 1.5s forwards';

        setTimeout(() => {
            introSeq.classList.add('hidden');
            interactArea.classList.remove('hidden');
        }, 1500);
    }, 4000);
}

// 2. INTERACTION
const submitBtn = document.getElementById('submit-btn');

submitBtn.addEventListener('click', processInput);
magicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') processInput();
});

function processInput() {
    const val = parseInt(magicInput.value);
    if (val >= 1 && val <= 10) {
        // Valid
        shootingStars.push(new ShootingStar(true)); // Big star

        // Hide input
        inputContainer.style.display = 'none';
        document.getElementById('prompt-text').style.display = 'none';
        finishBtn.style.display = 'none';

        // Show Message
        messageDisplay.classList.remove('hidden');
        document.getElementById('message-text').textContent = messages[val];
        document.getElementById('message-text').classList.add('text-blur-in');

    } else {
        // Shake
        inputContainer.style.transform = "translateX(5px)";
        setTimeout(() => inputContainer.style.transform = "translateX(0)", 100);
    }
}

nextBtn.addEventListener('click', () => {
    messageDisplay.classList.add('hidden');
    inputContainer.style.display = 'flex';
    document.getElementById('prompt-text').style.display = 'block';
    finishBtn.classList.remove('hidden');
    finishBtn.style.display = 'inline-block';

    magicInput.value = '';
    magicInput.focus();
});

finishBtn.addEventListener('click', () => {
    interactArea.classList.add('hidden');
    endingSeq.classList.remove('hidden');
    playEnding();
});

function playEnding() {
    const lines = [
        "Happy New Year.",
        "Here’s to another great year",
        "filled with unforgettable moments",
        "and memories worth cherishing.",
        " ",
        "May the odds be forever in your favour."
    ];

    let delay = 500;
    const container = document.getElementById('end-text-container');

    lines.forEach(line => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.textContent = line;
            p.className = 'final-line';
            if (line.trim() === "") p.style.height = '1rem';
            container.appendChild(p);
        }, delay);
        delay += 3000;
    });

    setTimeout(() => {
        document.querySelector('.signature').classList.remove('hidden');
        document.querySelector('.signature').classList.add('text-blur-in');

        // Final volley
        for (let i = 0; i < 5; i++) {
            setTimeout(() => shootingStars.push(new ShootingStar(true)), i * 400);
        }
    }, delay + 1000);
}


// 3. AUDIO TOGGLE
musicToggle.addEventListener('click', () => {
    if (bgm.paused) {
        bgm.play();
        isPlaying = true;
    } else {
        bgm.pause();
        isPlaying = false;
    }
    updateIcon();
});

function updateIcon() {
    if (isPlaying) {
        iconOff.classList.add('hidden');
        iconOn.classList.remove('hidden');
    } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
    }
}
