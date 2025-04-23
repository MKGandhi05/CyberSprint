// CyberSprint Hackathon Website JavaScript

// Wait for the document to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation enhancement
    const navbarCollapse = document.getElementById('navbarNav');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    
    // If overlay is clicked, close the menu
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            navbarCollapse.classList.remove('show');
        });
    }
    
    // Close menu when clicking on a nav link on mobile
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                navbarCollapse.classList.remove('show');
            }
        });
    });

    // Typing animation
    const typingText = document.querySelector('.typing-text');
    const words = ["Code", "Compete", "Conquer"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 150; // Base speed in milliseconds

    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Removing characters
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 80; // Faster when deleting
        } else {
            // Adding characters
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150; // Normal speed when typing
        }
        
        // If word is complete, start deleting after a pause
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 1000; // Pause at the end of a word
        } 
        // If deletion is complete, move to next word
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length; // Loop through words
            typingSpeed = 500; // Pause before starting new word
        }
        
        setTimeout(typeEffect, typingSpeed);
    }
    
    // Start the typing animation if element exists
    if (typingText) {
        setTimeout(typeEffect, 1000); // Initial delay
    }

    // Cursor blink animation in the terminal
    setInterval(function() {
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }
    }, 500);

    // Terminal typing animation
    const commandElements = document.querySelectorAll('.command');
    commandElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        const typing = setInterval(function() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, 100);
    });

    // Countdown timer
    const hackathonDate = new Date('October 15, 2025 00:00:00').getTime();
    
    // Update the countdown every second
    const countdownTimer = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Find the time difference between now and the hackathon date
        const timeDifference = hackathonDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        // Display the result in the elements with corresponding IDs
        document.getElementById('days').textContent = days < 10 ? '0' + days : days;
        document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
        
        // If the countdown is finished, clear the interval and display a message
        if (timeDifference < 0) {
            clearInterval(countdownTimer);
            document.getElementById('countdown-timer').innerHTML = '<div class="hackathon-live">Hackathon is LIVE!</div>';
        }
    }, 1000);

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.topic-card, .counter-item, .timeline-item, .sponsor-logo');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenHeight = window.innerHeight;
            
            if (elementPosition < screenHeight - 100) {
                element.classList.add('visible');
            }
        });
    };

    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
    // Run once on load to check for visible elements
    animateOnScroll();

    // Form submission handling
    const subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Simulating form submission success
                emailInput.value = '';
                showToast('Thanks for subscribing!', 'success');
            } else {
                showToast('Please enter a valid email', 'error');
            }
        });
    }

    // Helper function to validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Toast notification system
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove the toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Add CSS for the toast
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: var(--card-bg);
            color: var(--text-color);
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            font-family: 'Fira Code', monospace;
        }
        .toast-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        .toast-notification.success {
            border-left: 4px solid var(--accent-green);
        }
        .toast-notification.error {
            border-left: 4px solid var(--accent-red);
        }
        .toast-notification.info {
            border-left: 4px solid var(--accent-blue);
        }
    `;
    document.head.appendChild(style);
});