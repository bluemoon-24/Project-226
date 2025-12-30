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
 * CANVAS STARFIELD & SHOOTING STAR SYSTEM
 */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let shootingStars = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
}

class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2 + 0.5; // Depth factor
        this.size = Math.random() * 1.5;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseDir = 1;
    }

    update() {
        // Parallax movement (slow drift)
        this.x -= 0.2 * this.z;
        if (this.x < 0) this.x = width; // Wrap around

        // Twinkle
        this.alpha += this.pulseSpeed * this.pulseDir;
        if (this.alpha > 0.9 || this.alpha < 0.3) this.pulseDir *= -1;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.z * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ShootingStar {
    constructor(isForced = false) {
        this.reset(isForced);
    }

    reset(isForced = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5; // Start in upper half
        this.len = Math.random() * 80 + 100;
        this.speed = Math.random() * 10 + 15;
        this.size = Math.random() * 1 + 0.1;
        // Direction
        this.dx = -this.speed;
        this.dy = this.speed * 0.4; // Diagonal down-left

        this.active = true;
        this.opacity = 1;

        // If forced (by user interaction), make it brighter and longer
        if (isForced) {
            this.len = 250;
            this.speed = 25;
            this.size = 2;
        }
    }

    update() {
        if (!this.active) return;

        this.x += this.dx;
        this.y += this.dy;
        this.len -= this.speed * 0.4; // Tail shrinks
        this.opacity -= 0.01;

        if (this.x < -this.len || this.y > height + this.len || this.opacity <= 0) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;

        const tailX = this.x - this.dx * 2; // Approximate tail direction prevention
        const tailY = this.y - this.dy * 2;

        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.len, this.y - (this.len * 0.4));
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - (this.dx / this.speed * this.len), this.y - (this.dy / this.speed * this.len)); // Geometric tail
        ctx.stroke();
    }
}

function initStars() {
    stars = [];
    for (let i = 0; i < 400; i++) {
        stars.push(new Star());
    }
}

function animate() {
    ctx.fillStyle = "#05070a"; // Clear with bg color (or use clearRect if opaque css bg)
    ctx.clearRect(0, 0, width, height);

    // Draw Nebula (Simulated via gradient on canvas for best blend)
    // Actually, CSS gradient is better for static background, Canvas for stars.

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Manage Shooting Stars
    if (Math.random() < 0.005) { // Random chance per frame
        shootingStars.push(new ShootingStar());
    }

    shootingStars.forEach((star, index) => {
        star.update();
        star.draw();
        if (!star.active) shootingStars.splice(index, 1);
    });

    requestAnimationFrame(animate);
}

// Initial Setup
window.addEventListener('resize', resize);
resize();
animate();


/**
 * APP LOGIC
 */
const introSequence = document.getElementById('intro-sequence');
const introText = document.getElementById('intro-text');
const interactionArea = document.getElementById('interaction-area');
const magicInput = document.getElementById('magic-input');
const submitBtn = document.getElementById('submit-btn');
const messageDisplay = document.getElementById('message-display');
const messageText = document.getElementById('message-text');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const endingSequence = document.getElementById('ending-sequence');
const endTextContainer = document.getElementById('end-text-container');
const bgm = document.getElementById('bgm');
const musicToggle = document.getElementById('music-toggle');
const iconSoundOn = document.getElementById('icon-sound-on');
const iconSoundOff = document.getElementById('icon-sound-off');

let seenNumbers = new Set();
let isMusicPlaying = false;
let hasStarted = false;

bgm.volume = 0.3;

// --- Intro ---
document.addEventListener('DOMContentLoaded', () => {
    // Attempt play on load? Unlikely to work, but good to try muted if possible (not doing here)
    setTimeout(() => {
        introText.classList.remove('text-fade-in');
        introText.classList.add('text-fade-out');

        introText.addEventListener('animationend', () => {
            introSequence.classList.add('hidden');
            interactionArea.classList.remove('hidden');
            interactionArea.classList.add('text-fade-in');
            magicInput.focus();
        }, { once: true });
    }, 4500);
});

// --- Audio Handling ---
function tryPlayAudio() {
    if (!hasStarted) {
        hasStarted = true;
        bgm.play().then(() => {
            isMusicPlaying = true;
            updateMusicIcon();
        }).catch(err => {
            console.log("Auto-play blocked, waiting for explicit interaction.", err);
        });
    }
}

// Global unlock on first click anywhere
document.body.addEventListener('click', () => {
    if (!isMusicPlaying) tryPlayAudio();
}, { once: true });


musicToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't trigger the body listener
    if (bgm.paused) {
        bgm.play();
        isMusicPlaying = true;
    } else {
        bgm.pause();
        isMusicPlaying = false;
    }
    updateMusicIcon();
});

function updateMusicIcon() {
    if (!bgm.paused) {
        iconSoundOff.classList.add('hidden');
        iconSoundOn.classList.remove('hidden');
        musicToggle.style.opacity = '1';
    } else {
        iconSoundOn.classList.add('hidden');
        iconSoundOff.classList.remove('hidden');
        musicToggle.style.opacity = '0.7';
    }
}

// --- Interaction ---
submitBtn.addEventListener('click', handleInput);
magicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleInput();
});

nextBtn.addEventListener('click', () => {
    // Fade out message
    messageDisplay.classList.remove('text-fade-in');
    messageDisplay.classList.add('text-fade-out');

    setTimeout(() => {
        messageDisplay.classList.add('hidden');
        messageDisplay.classList.remove('text-fade-out'); // Reset for next time

        // Show input again
        document.getElementById('prompt-text').classList.remove('hidden');
        magicInput.parentElement.classList.remove('hidden');
        magicInput.parentElement.classList.add('text-fade-in');
        finishBtn.classList.remove('hidden');
        finishBtn.classList.add('text-fade-in');

        magicInput.value = '';
        magicInput.focus();
    }, 1000);
});

finishBtn.addEventListener('click', triggerEnding);

function handleInput() {
    // Double check audio
    tryPlayAudio();

    const val = parseInt(magicInput.value);

    if (val >= 1 && val <= 10) {
        // Trigger forced shooting star
        shootingStars.push(new ShootingStar(true));

        // UI Transitions
        magicInput.parentElement.classList.remove('text-fade-in');
        magicInput.parentElement.classList.add('text-fade-out');
        document.getElementById('prompt-text').classList.add('hidden');
        finishBtn.classList.add('hidden');

        setTimeout(() => {
            magicInput.parentElement.classList.add('hidden');
            magicInput.parentElement.classList.remove('text-fade-out'); // Reset class
            displayMessage(val);
        }, 1000);

    } else {
        // Shake effect via CSS class
        const wrapper = magicInput.parentElement;
        wrapper.style.transform = "translateX(5px)";
        setTimeout(() => wrapper.style.transform = "translateX(-5px)", 50);
        setTimeout(() => wrapper.style.transform = "translateX(5px)", 100);
        setTimeout(() => wrapper.style.transform = "translateX(0)", 150);
    }
}

function displayMessage(num) {
    messageText.textContent = messages[num];
    messageDisplay.classList.remove('hidden');
    messageDisplay.classList.add('text-fade-in');
}

function triggerEnding() {
    interactionArea.classList.add('text-fade-out');

    setTimeout(() => {
        interactionArea.classList.add('hidden');
        endingSequence.classList.remove('hidden');
        playEndingSequence();
    }, 1500);
}

function playEndingSequence() {
    const lines = [
        "Happy New Year.",
        "Here’s to another great year",
        "filled with unforgettable moments",
        "and memories worth cherishing.",
        " ",
        "May the odds be forever in your favour."
    ];

    let delay = 500;

    lines.forEach((line) => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.textContent = line;
            p.classList.add('final-line', 'text-fade-in');
            if (line.trim() === "") p.style.height = "1rem";
            endTextContainer.appendChild(p);
        }, delay);
        delay += 3000;
    });

    setTimeout(() => {
        const sig = document.querySelector('.signature');
        sig.classList.remove('hidden');
        sig.classList.add('text-fade-in');
        // Final volley of shooting stars
        shootingStars.push(new ShootingStar(true));
        setTimeout(() => shootingStars.push(new ShootingStar(true)), 500);
        setTimeout(() => shootingStars.push(new ShootingStar(true)), 1000);
    }, delay + 1000);
}
