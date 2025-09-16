// Secret button functionality
document.getElementById('secret-button').addEventListener('click', function() {
    window.location.href = 'login.html';
});

// Secret key combination (Ctrl + Shift + S)
let secretCombo = [];
const secretSequence = ['Control', 'Shift', 's'];

document.addEventListener('keydown', function(event) {
    // Add the pressed key to the combo array
    secretCombo.push(event.key);
    
    // Keep only the last 3 keys
    if (secretCombo.length > 3) {
        secretCombo.shift();
    }
    
    // Check if the combo matches
    if (secretCombo.length === 3 && 
        secretCombo[0] === secretSequence[0] && 
        secretCombo[1] === secretSequence[1] && 
        secretCombo[2] === secretSequence[2]) {
        // Secret combo detected!
        showSecretMessage();
        secretCombo = []; // Reset combo
    }
});

// Alternative secret: Click the top-left corner 5 times quickly
let clickCount = 0;
let clickTimer = null;

document.getElementById('secret-trigger').addEventListener('click', function() {
    clickCount++;
    
    if (clickTimer) {
        clearTimeout(clickTimer);
    }
    
    if (clickCount >= 5) {
        showSecretMessage();
        clickCount = 0;
    } else {
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 2000); // Reset after 2 seconds
    }
});

function showSecretMessage() {
    // Create a modal for the secret message
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
            margin: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
            ">
                <i class="fas fa-key" style="font-size: 2rem; color: white;"></i>
            </div>
            <h2 style="color: #333; margin-bottom: 1rem;">Secret Access Unlocked!</h2>
            <p style="color: #666; margin-bottom: 2rem;">You've discovered the secret access method. Click below to continue to the secure portal.</p>
            <button onclick="window.location.href='login.html'" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                margin-right: 1rem;
            ">Continue to Portal</button>
            <button onclick="this.closest('div').parentElement.remove()" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
            ">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        navMenu.classList.remove('active');
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Add animation to feature cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and tip cards
document.querySelectorAll('.feature-card, .tip-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Add click effects to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);