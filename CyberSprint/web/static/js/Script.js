// CyberSprint Hackathon Website JavaScript

// Wait for the document to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
    // Initialize stars background animation
    const starsCanvas = document.getElementById('stars');
    if (starsCanvas) {
        initStarsAnimation(starsCanvas);
    }
    
    // Add navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    function handleNavbarScroll() {
        if (window.scrollY > 50) { // Apply effect after scrolling 50px
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Call once on load
    handleNavbarScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleNavbarScroll);
    
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

    // Particle network animation with enhanced visibility
    function initStarsAnimation(canvas) {
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        let particles = [];
        
        // Configuration - increased values for better visibility
        const isMobile = window.innerWidth <= 768; // Check if mobile screen
        const particleCount = isMobile ? 50 : 80;  // Fewer particles on mobile
        const particleMaxSize = 4;  // Larger max size
        const particleMinSize = 1;  // Larger min size
        const particleColor = 'rgba(255, 255, 255, 0.9)';  // More opaque
        const lineColor = 'rgba(255, 255, 255, 0.3)';  // More visible lines
        const maxDistance = isMobile ? 150 : 180; // Shorter connection distance on mobile
        const particleSpeed = 0.6; // Slightly faster movement
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Create particles
        const createParticles = () => {
            particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * (particleMaxSize - particleMinSize) + particleMinSize,
                    speedX: (Math.random() - 0.5) * particleSpeed,
                    speedY: (Math.random() - 0.5) * particleSpeed
                });
            }
        };
        
        // Update particles
        const updateParticles = () => {
            particles.forEach(particle => {
                // Move particle
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Bounce off edges
                if (particle.x < 0 || particle.x > width) {
                    particle.speedX *= -1;
                }
                
                if (particle.y < 0 || particle.y > height) {
                    particle.speedY *= -1;
                }
            });
        };
        
        // Draw particles and connection lines
        const drawParticles = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw particles
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
            });
            
            // Draw connection lines
            particles.forEach((particle1, i) => {
                particles.slice(i + 1).forEach(particle2 => {
                    const dx = particle1.x - particle2.x;
                    const dy = particle1.y - particle2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < maxDistance) {
                        // Opacity based on distance (closer = more visible)
                        const opacity = 1 - (distance / maxDistance);
                        
                        ctx.beginPath();
                        ctx.moveTo(particle1.x, particle1.y);
                        ctx.lineTo(particle2.x, particle2.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            
            // Update particles for next frame
            updateParticles();
            
            // Continue animation
            requestAnimationFrame(drawParticles);
        };
        
        // Handle mouse movement (particles follow cursor)
        let mouseX = 0;
        let mouseY = 0;
        let isMouseMoving = false;
        
        canvas.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            isMouseMoving = true;
            
            // After 2 seconds of no movement, reset flag
            setTimeout(() => {
                isMouseMoving = false;
            }, 2000);
        });
        
        // Periodically attract particles to mouse position if mouse is moving
        setInterval(() => {
            if (isMouseMoving) {
                const attractionParticles = particles.slice(0, 3); // Only move a few particles
                attractionParticles.forEach(particle => {
                    // Calculate direction to mouse
                    const dx = mouseX - particle.x;
                    const dy = mouseY - particle.y;
                    
                    // Normalize and set new speed
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 5) { // Only move if not too close
                        particle.speedX = dx / distance * 2;
                        particle.speedY = dy / distance * 2;
                    }
                });
            }
        }, 100);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            createParticles();
        });
        
        // Initialize and start animation
        createParticles();
        drawParticles();
    }
});