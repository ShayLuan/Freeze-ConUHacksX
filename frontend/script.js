// DOM Elements
const typingText = document.getElementById('typing-text');
const cursor = document.querySelector('.cursor');
const polaroidTimeline = document.getElementById('polaroidTimeline');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const timelineDots = document.querySelector('.timeline-dots');

// Rotating Phrases Array
const rotatingPhrases = [
    "relive your precious moments",
    "your highlight reel",
    "surf the sands of time",
    "feel it again",
    "no moment left behind",
    "press pause on perfect",
    "time stands here",
    "more than pictures, stories",
    "your life, in focus",
    "capture the feeling",
    "memories that stay",
    "frozen in happiness"
];

let currentPhraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;
let typingPause = 2000;

// Polaroid Data
const polaroidData = [
    {
        image: 'assets/images/polaroids/young-family-with-little-daughter-winter-forest-full-snow.jpg',
        caption: "Claire's first Snow day!",
        date: 'Dec 2023',
        icon: 'fas fa-heart'
    },
    {
        image: 'assets/images/polaroids/family-happy-fun-walk-nature.jpg',
        caption: 'Parc du Bois-Beckett',
        date: 'Jan 2024',
        icon: 'fas fa-snowflake'
    },
    {
        image: 'assets/images/polaroids/matthew-moloney-lh_g1UJEADM-unsplash.jpg',
        caption: 'Cozy Winter Evening',
        date: 'Feb 2024',
        icon: 'fas fa-fire'
    }
];

let currentPolaroidIndex = 0;
const polaroidsPerView = 3;

// Snowflake Creation
function createSnowflakes() {
    const snowflakes = document.querySelectorAll('.snowflake');
    snowflakes.forEach((snow, index) => {
        snow.style.left = Math.random() * 100 + 'vw';
        snow.style.top = Math.random() * -100 + 'px';
        const size = Math.random() * 1.5 + 0.5;
        snow.style.fontSize = size + 'rem';
        const opacity = Math.random() * 0.7 + 0.3;
        snow.style.opacity = opacity;
        const duration = Math.random() * 15 + 10;
        snow.style.animationDuration = duration + 's';
        const delay = Math.random() * 5;
        snow.style.animationDelay = delay + 's';
    });
}

// Rotating Typing Animation
function typeEffect() {
    const currentPhrase = rotatingPhrases[currentPhraseIndex];
    const currentText = currentPhrase.substring(0, charIndex);
    typingText.textContent = currentText;
    
    if (!isDeleting && charIndex < currentPhrase.length) {
        charIndex++;
        typingSpeed = 100;
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
        typingSpeed = 50;
    }
    
    if (charIndex === currentPhrase.length && !isDeleting) {
        isDeleting = true;
        typingSpeed = typingPause;
    } else if (charIndex === 0 && isDeleting) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % rotatingPhrases.length;
        typingSpeed = 500;
    }
    
    setTimeout(typeEffect, typingSpeed);
}

// Generate Polaroid Timeline
function generatePolaroidTimeline() {
    polaroidTimeline.innerHTML = '';
    timelineDots.innerHTML = '';
    
    const totalPolaroids = polaroidData.length;
    const totalDots = Math.ceil(totalPolaroids / polaroidsPerView);
    
    // Create polaroid cards
    polaroidData.forEach((item, index) => {
        const polaroidCard = document.createElement('div');
        polaroidCard.className = 'polaroid-card';
        polaroidCard.innerHTML = `
            <div class="polaroid-date">${item.date}</div>
            <img src="${item.image}" alt="${item.caption}" class="polaroid-image" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518834103328-74fc4c6d7f9f?w=400&h=300&fit=crop'">
            <div class="polaroid-caption">
                <i class="${item.icon}"></i>
                <span>${item.caption}</span>
            </div>
        `;
        polaroidTimeline.appendChild(polaroidCard);
    });
    
    // Create navigation dots
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.className = `timeline-dot ${i === 0 ? 'active' : ''}`;
        dot.dataset.index = i;
        dot.addEventListener('click', () => scrollToPolaroidSection(i));
        timelineDots.appendChild(dot);
    }
}

// Scroll to specific polaroid section
function scrollToPolaroidSection(sectionIndex) {
    const cardWidth = document.querySelector('.polaroid-card')?.offsetWidth + 40 || 320;
    const scrollPosition = sectionIndex * cardWidth * polaroidsPerView;
    polaroidTimeline.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    
    document.querySelectorAll('.timeline-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === sectionIndex);
    });
    
    currentPolaroidIndex = sectionIndex;
}

// Timeline Navigation
function setupTimelineNavigation() {
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPolaroidIndex > 0) {
                scrollToPolaroidSection(currentPolaroidIndex - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const totalDots = Math.ceil(polaroidData.length / polaroidsPerView);
            if (currentPolaroidIndex < totalDots - 1) {
                scrollToPolaroidSection(currentPolaroidIndex + 1);
            }
        });
    }
    
    polaroidTimeline.addEventListener('scroll', () => {
        const cardWidth = document.querySelector('.polaroid-card')?.offsetWidth + 40 || 320;
        const scrollPosition = polaroidTimeline.scrollLeft;
        const sectionIndex = Math.round(scrollPosition / (cardWidth * polaroidsPerView));
        
        document.querySelectorAll('.timeline-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === sectionIndex);
        });
        
        currentPolaroidIndex = sectionIndex;
    });
}

// Notification System (Optional - can be used for other purposes)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-snowflake"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1c4a7a, #0c2b4b);
        color: #8ac6d1;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #6eb5ff;
        border: 1px solid rgba(110, 181, 255, 0.3);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1001;
        transform: translateX(150%);
        transition: transform 0.5s;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Freeze...');
    
    // Create snowflakes
    createSnowflakes();
    
    // Start typing effect
    setTimeout(() => {
        typeEffect();
    }, 1000);
    
    // Generate polaroid timeline
    generatePolaroidTimeline();
    
    // Setup timeline navigation
    setupTimelineNavigation();
    
    // Add CSS for notification animation (optional)
    const style = document.createElement('style');
    style.textContent = `
        .notification i {
            color: #6eb5ff;
            animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Freeze initialized successfully');
});