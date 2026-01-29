// ===== GLOBAL STATE =====
let fireActive = false;
let particles = [];
let animationFrameId = null;

// ===== DOM ELEMENTS =====
const logo = document.getElementById('logo');
const fireToggle = document.getElementById('fire-toggle');
const fireCanvas = document.getElementById('fire-canvas');
const dashboard = document.getElementById('dashboard');
const startBtn = document.getElementById('start-btn');
const slashTransition = document.getElementById('slash-transition');
const storyContainer = document.getElementById('story-container');
const choiceBtns = document.querySelectorAll('.choice-btn');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupFireCanvas();
    setupEventListeners();
    setupScrollAnimations();
});

// ===== LOGO - SCROLL TO TOP =====
logo.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Start button - trigger sword slash
    startBtn.addEventListener('click', startGame);
    
    // Fire toggle button
    fireToggle.addEventListener('click', toggleFire);
    
    // Choice buttons
    choiceBtns.forEach(btn => {
        btn.addEventListener('click', handleChoice);
    });
}

// ===== START GAME - SWORD SLASH ANIMATION =====
function startGame() {
    // Play sword slash animation
    playSwordSlash();
    
    // Hide dashboard after animation
    setTimeout(() => {
        dashboard.classList.remove('active');
        storyContainer.classList.add('visible');
    }, 1500);
}

function playSwordSlash() {
    const slashPath = document.getElementById('slash-path');
    slashTransition.classList.add('active');
    
    // Animate the slash path
    let progress = 0;
    const duration = 1200; // ms
    const startTime = Date.now();
    
    function animateSlash() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing function for more dynamic slash
        const eased = easeOutCubic(progress);
        
        // Create diagonal slash path from top-right to bottom-left
        const slashProgress = eased * 100;
        
        // Build SVG path for diagonal slash
        if (progress < 0.5) {
            // First half - blade appears
            const bladeProgress = (progress / 0.5) * 100;
            slashPath.setAttribute('d', `
                M${1920 - bladeProgress * 19.2},0 
                L1920,0 L1920,1080 L${1920 - bladeProgress * 19.2},1080 Z
            `);
            slashPath.setAttribute('opacity', '1');
        } else {
            // Second half - screen splits and reveals content
            const splitProgress = ((progress - 0.5) / 0.5) * 100;
            slashPath.setAttribute('d', `
                M0,0 
                L${splitProgress * 9.6},0 
                L${splitProgress * 9.6},1080 
                L0,1080 Z
            `);
            slashPath.setAttribute('opacity', `${1 - (splitProgress / 100)}`);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateSlash);
        } else {
            slashTransition.classList.remove('active');
            slashPath.setAttribute('opacity', '0');
        }
    }
    
    animateSlash();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ===== SCROLL ANIMATIONS =====
function setupScrollAnimations() {
    const phases = document.querySelectorAll('.story-phase');
    
    const observerOptions = {
        root: null,
        threshold: 0.3,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    phases.forEach(phase => {
        phase.style.opacity = '0';
        phase.style.transform = 'translateY(50px)';
        phase.style.transition = 'opacity 1s ease, transform 1s ease';
        observer.observe(phase);
    });
}

// ===== CHOICE SYSTEM =====
function handleChoice(e) {
    const ending = e.currentTarget.getAttribute('data-ending');
    
    // Hide choice phase
    const choicePhase = document.getElementById('phase-5');
    choicePhase.style.display = 'none';
    
    // Show selected ending
    if (ending === 'shura') {
        document.getElementById('ending-shura').style.display = 'flex';
        
        // Add dramatic fire effect for Shura
        setTimeout(() => {
            if (!fireActive) {
                toggleFire();
            }
        }, 1000);
    } else {
        document.getElementById('ending-severance').style.display = 'flex';
    }
    
    // Scroll to ending
    setTimeout(() => {
        const endingElement = document.getElementById(`ending-${ending}`);
        endingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ===== FIRE PARTICLE SYSTEM =====
function setupFireCanvas() {
    fireCanvas.width = window.innerWidth;
    fireCanvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        fireCanvas.width = window.innerWidth;
        fireCanvas.height = window.innerHeight;
    });
}

function toggleFire() {
    fireActive = !fireActive;
    fireToggle.classList.toggle('active', fireActive);
    fireCanvas.classList.toggle('active', fireActive);
    
    if (fireActive) {
        startFireAnimation();
    } else {
        stopFireAnimation();
    }
}

function startFireAnimation() {
    const ctx = fireCanvas.getContext('2d');
    
    function createParticle() {
        return {
            x: Math.random() * fireCanvas.width,
            y: fireCanvas.height + 20,
            vx: (Math.random() - 0.5) * 2,
            vy: -(Math.random() * 3 + 2),
            life: 1,
            decay: Math.random() * 0.01 + 0.005,
            size: Math.random() * 8 + 3,
            color: Math.random() > 0.5 ? 'rgba(255, 107, 0, ' : 'rgba(255, 69, 0, '
        };
    }
    
    function animate() {
        if (!fireActive) return;
        
        ctx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
        
        // Create new particles
        for (let i = 0; i < 3; i++) {
            particles.push(createParticle());
        }
        
        // Update and draw particles
        particles = particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.vy -= 0.05; // Gravity effect
            
            if (particle.life > 0) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color + particle.life + ')';
                ctx.fill();
                
                // Add glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = particle.color + particle.life + ')';
                ctx.fill();
                ctx.shadowBlur = 0;
                
                return true;
            }
            return false;
        });
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
}

function stopFireAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    particles = [];
    const ctx = fireCanvas.getContext('2d');
    ctx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
}

// ===== PARALLAX SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const phases = document.querySelectorAll('.story-phase');
    
    phases.forEach((phase, index) => {
        const speed = 0.5;
        const yPos = -(scrolled * speed);
        phase.style.backgroundPositionY = `${yPos}px`;
    });
});

// ===== BLOOD SPLATTER ANIMATION =====
document.querySelectorAll('.blood-splatter').forEach((splatter, index) => {
    const delay = index * 0.5;
    splatter.style.animationDelay = `${delay}s`;
});

// ===== SETTINGS BUTTON (PLACEHOLDER) =====
const settingsBtn = document.querySelectorAll('.menu-item')[1];
settingsBtn.addEventListener('click', () => {
    alert('Settings menu - Coming soon! 設定メニュー');
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // ESC - return to dashboard
    if (e.key === 'Escape' && !dashboard.classList.contains('active')) {
        storyContainer.classList.remove('visible');
        dashboard.classList.add('active');
    }
    
    // Space - toggle fire
    if (e.key === ' ' && !dashboard.classList.contains('active')) {
        e.preventDefault();
        toggleFire();
    }
    
    // Home - scroll to top
    if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Reduce particle count on lower-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    const originalCreateParticle = startFireAnimation;
    // Reduce particle generation for performance
}

// ===== CONSOLE EASTER EGG =====
console.log('%c隻狼 SEKIRO: Shadows Die Twice', 'font-size: 24px; font-weight: bold; color: #D4AF37;');
console.log('%cHesitation is defeat...', 'font-size: 14px; font-style: italic; color: #8B0000;');
