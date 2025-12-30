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

const app = document.getElementById('app');
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

// Config audio
bgm.volume = 0.25;

// --- Flow Control ---

// Start Sequence
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // First text fade out after reading time
        introText.classList.remove('text-fade-in');
        introText.classList.add('text-fade-out');

        introText.addEventListener('animationend', () => {
            introSequence.classList.add('hidden');
            interactionArea.classList.remove('hidden');
            interactionArea.classList.add('text-fade-in');
            magicInput.focus();
        }, { once: true });
    }, 4000); // 4 seconds to read "Tonight, the universe listens."
});

// Input Handling
submitBtn.addEventListener('click', handleInput);
magicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleInput();
});

// Next/Reset
nextBtn.addEventListener('click', () => {
    messageDisplay.classList.add('hidden');
    magicInput.value = '';
    magicInput.parentElement.classList.remove('hidden');
    document.getElementById('prompt-text').classList.remove('hidden');
    finishBtn.classList.remove('hidden'); // Ensure finish is visible
    magicInput.focus();
});

// Finish
finishBtn.addEventListener('click', triggerEnding);

// Music Toggle
musicToggle.addEventListener('click', () => {
    if (bgm.paused) {
        bgm.play().then(() => {
            isMusicPlaying = true;
            updateMusicIcon();
        }).catch(e => console.log("Audio autoplay prevented", e));
    } else {
        bgm.pause();
        isMusicPlaying = false;
        updateMusicIcon();
    }
});

function updateMusicIcon() {
    if (!bgm.paused) {
        iconSoundOff.classList.add('hidden');
        iconSoundOn.classList.remove('hidden');
    } else {
        iconSoundOn.classList.add('hidden');
        iconSoundOff.classList.remove('hidden');
    }
}

// First interaction trigger for audio (browser policy)
function tryPlayAudio() {
    if (!hasStarted) {
        hasStarted = true;
        bgm.play().then(() => {
            isMusicPlaying = true;
            updateMusicIcon();
        }).catch(() => {
            // If failed, user must toggle manually
        });
    }
}

// Main Logic
function handleInput() {
    tryPlayAudio();
    const val = parseInt(magicInput.value);

    if (val >= 1 && val <= 10) {
        // Valid
        seenNumbers.add(val);
        showShootingStar();
        displayMessage(val);
        
        // Hide input area temporarily
        magicInput.parentElement.classList.add('hidden');
        document.getElementById('prompt-text').classList.add('hidden');
    } else {
        // Invalid visual feedback (shake or simple clear)
        magicInput.style.borderColor = '#ff6b6b';
        setTimeout(() => magicInput.style.borderColor = 'rgba(255,255,255,0.3)', 500);
    }
}

function displayMessage(num) {
    messageText.textContent = messages[num];
    messageDisplay.classList.remove('hidden');
    messageDisplay.classList.add('text-fade-in');
    
    // Pulse effect on text
    messageText.classList.add('pulse-glow');
}

function showShootingStar() {
    const star = document.createElement('div');
    star.classList.add('shooting-star');
    
    // Random position
    const startY = Math.random() * (window.innerHeight * 0.5);
    const startX = Math.random() * (window.innerWidth);
    
    star.style.top = `${startY}px`;
    star.style.left = `${startX}px`;
    
    document.getElementById('shooting-star-container').appendChild(star);
    
    // Cleanup
    setTimeout(() => {
        star.remove();
    }, 2000);
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
    // Stars slow down effect (handled via adding a class if we want, or just let them alone)
    // We'll just let the text fade in line by line.
    
    const lines = [
        "Happy New Year.",
        "Here’s to another great year",
        "filled with unforgettable moments",
        "and memories worth cherishing.",
        " ",
        "May the odds be forever in your favour."
    ];

    let delay = 0;
    
    lines.forEach((line, index) => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.textContent = line;
            p.classList.add('final-line', 'text-fade-in');
            if(line.trim() === "") p.style.height = "1rem"; // spacer
            endTextContainer.appendChild(p);
        }, delay);
        delay += 2500; // Slow pace
    });

    // Final signature and star
    setTimeout(() => {
        const sig = document.querySelector('.signature');
        sig.classList.remove('hidden');
        sig.classList.add('text-fade-in');
        showShootingStar(); // Final star
    }, delay + 1000);
}
