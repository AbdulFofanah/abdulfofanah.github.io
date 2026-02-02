const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const overlay = document.getElementById('overlay');
const video = document.getElementById('valVideo');
const closeBtn = document.getElementById('closeBtn');
const card = document.querySelector('.card');

const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');

/*
   Helper utilities
    */

/* Clamp value between bounds */
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}

/* Axis-aligned bounding box overlap test */
function rectsOverlap(a, b) {
    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}

/*
   1. Runaway "No" button
   - Clamped to viewport
   - Avoids central card region
    */

function moveNoButton(e) {
    if (e) e.preventDefault();
    if (overlay.style.display === 'flex') return;

    const padding = 20;

    const maxX = Math.max(0, window.innerWidth - noBtn.offsetWidth - padding);
    const maxY = Math.max(0, window.innerHeight - noBtn.offsetHeight - padding);

    /* Card exclusion zone */
    const cardRect = card.getBoundingClientRect();
    const avoid = {
        left: cardRect.left - 40,
        top: cardRect.top - 40,
        right: cardRect.right + 40,
        bottom: cardRect.bottom + 40
    };

    /* Attempt multiple random placements */
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);

        const candidate = {
            left: x,
            top: y,
            right: x + noBtn.offsetWidth,
            bottom: y + noBtn.offsetHeight
        };

        if (!rectsOverlap(candidate, avoid)) {
            noBtn.style.left = `${clamp(x, padding, maxX)}px`;
            noBtn.style.top = `${clamp(y, padding, maxY)}px`;
            return;
        }
    }

    /* Fallback for very small screens */
    noBtn.style.left = `${padding}px`;
    noBtn.style.top = `${padding}px`;
}

/* Pointer + touch coverage */
noBtn.addEventListener('pointerenter', moveNoButton);
noBtn.addEventListener('touchstart', moveNoButton, { passive: false });

/*
   2. Background music toggle
    */

let musicPlaying = false;

if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', () => {
        if (!musicPlaying) {
            bgMusic.volume = 0.6;
            bgMusic.loop = true;

            bgMusic.play().catch(() => {});
            musicBtn.textContent = '⏸ Pause music';
            musicPlaying = true;
        } else {
            bgMusic.pause();
            musicBtn.textContent = '🎵 Play music';
            musicPlaying = false;
        }
    });
}

/*
   3. Heart rain effect
    */

function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '❤️';

    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
    heart.style.opacity = Math.random() * 0.7 + 0.3;

    document.body.appendChild(heart);

    /* Cleanup after animation */
    setTimeout(() => heart.remove(), 5000);
}

/*
   4. "Yes" button behaviour
    */

yesBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    noBtn.style.display = 'none';

    /* Stop background music after "Yes" */
    if (bgMusic && musicBtn) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        musicBtn.textContent = '🎵 Play music';
        musicPlaying = false;
    }

    /* Autoplay video if permitted by browser */
    video.play().catch(() => {});

    /* Timed heart animation burst */
    const heartInterval = setInterval(createHeart, 250);
    setTimeout(() => clearInterval(heartInterval), 10000);
});

/*
   5. Modal lifecycle controls
    */

function closeModal() {
    overlay.style.display = 'none';
    video.pause();
    video.currentTime = 0;
}

closeBtn.addEventListener('click', closeModal);

/* Close when clicking outside modal */
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
});

/* Escape key support */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
        closeModal();
    }
});

/*
   Initialisation + layout safety
   */

window.addEventListener('load', moveNoButton);

window.addEventListener('resize', () => {
    if (overlay.style.display !== 'flex') {
        moveNoButton();
    }
});
