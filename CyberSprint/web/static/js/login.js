document.addEventListener('DOMContentLoaded', function() {
    // Login form switching logic
    const switchToOTPBtn = document.getElementById('switch-to-otp-btn');
    const switchToPasswordBtn = document.getElementById('switch-to-password-btn');
    const switchToPasswordFromOTPBtn = document.getElementById('switch-to-password-from-otp-btn');
    const sendOTPBtn = document.getElementById('send-otp-btn');
    const verifyOTPBtn = document.getElementById('verify-otp-btn');
    
    // Get section elements
    const passwordLoginSection = document.getElementById('password-login-section');
    const emailOTPSection = document.getElementById('email-otp-section');
    const otpVerificationSection = document.getElementById('otp-verification-section');
    
    // Switch from password login to email OTP
    if (switchToOTPBtn) {
        switchToOTPBtn.addEventListener('click', function(e) {
            e.preventDefault();
            passwordLoginSection.style.display = 'none';
            emailOTPSection.style.display = 'block';
            otpVerificationSection.style.display = 'none';
        });
    }
    
    // Switch from email OTP to password login
    if (switchToPasswordBtn) {
        switchToPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            passwordLoginSection.style.display = 'block';
            emailOTPSection.style.display = 'none';
            otpVerificationSection.style.display = 'none';
        });
    }
    
    // Switch from OTP verification to password login
    if (switchToPasswordFromOTPBtn) {
        switchToPasswordFromOTPBtn.addEventListener('click', function(e) {
            e.preventDefault();
            passwordLoginSection.style.display = 'block';
            emailOTPSection.style.display = 'none';
            otpVerificationSection.style.display = 'none';
        });
    }
    
    // Handle sending OTP
    let countdownInterval;
    const timerEl = document.getElementById('timer');
    const countdownTimerEl = document.getElementById('countdown-timer');
    const resendOtpBtn = document.getElementById('resend-otp-btn');
    const userEmailEl = document.querySelector('.user-email');
    
    if (sendOTPBtn) {
        sendOTPBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Show loading state
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                this.disabled = true;
                
                // Simulate API call to send OTP
                setTimeout(() => {
                    // Display user email in the OTP verification screen
                    if (userEmailEl) {
                        userEmailEl.textContent = email;
                    }
                    
                    // Switch to OTP verification section
                    passwordLoginSection.style.display = 'none';
                    emailOTPSection.style.display = 'none';
                    otpVerificationSection.style.display = 'block';
                    
                    // Reset button
                    this.innerHTML = 'Send OTP';
                    this.disabled = false;
                    
                    // Focus on the first OTP input
                    if (otpInputs && otpInputs.length > 0) {
                        otpInputs[0].focus();
                    }
                    
                    // Start countdown timer
                    startResendOtpTimer();
                    
                    showToast('OTP sent to your email', 'success');
                }, 1500);
            } else {
                showToast('Please enter a valid email address', 'error');
            }
        });
    }
    
    // Function to start the resend OTP timer
    function startResendOtpTimer() {
        // Clear any existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        // Show timer, hide resend button
        if (countdownTimerEl) countdownTimerEl.style.display = 'block';
        if (resendOtpBtn) {
            resendOtpBtn.style.display = 'none';
            resendOtpBtn.classList.add('disabled');
        }
        
        // Set initial time (120 seconds)
        let timeLeft = 120;
        if (timerEl) timerEl.textContent = timeLeft;
        
        // Start countdown
        countdownInterval = setInterval(() => {
            timeLeft--;
            
            if (timerEl) timerEl.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                // Stop the countdown
                clearInterval(countdownInterval);
                
                // Hide timer, show resend button
                if (countdownTimerEl) countdownTimerEl.style.display = 'none';
                if (resendOtpBtn) {
                    resendOtpBtn.style.display = 'block';
                    resendOtpBtn.classList.remove('disabled');
                }
            }
        }, 1000);
    }
    
    // Handle resend OTP button click
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Only proceed if button is not disabled
            if (!this.classList.contains('disabled')) {
                // Show loading state
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Simulate API call to resend OTP
                setTimeout(() => {
                    // Reset button
                    this.innerHTML = 'Resend OTP';
                    this.classList.add('disabled');
                    this.style.display = 'none';
                    
                    // Clear all OTP inputs
                    if (otpInputs) {
                        otpInputs.forEach(input => {
                            input.value = '';
                            input.classList.remove('animate-digit');
                        });
                    }
                    if (otpHiddenInput) {
                        otpHiddenInput.value = '';
                    }
                    
                    // Focus on the first OTP input
                    if (otpInputs && otpInputs.length > 0) {
                        otpInputs[0].focus();
                    }
                    
                    // Start countdown timer again
                    startResendOtpTimer();
                    
                    showToast('OTP resent to your email', 'success');
                }, 1500);
            }
        });
    }
    
    // Handle OTP input fields
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpHiddenInput = document.getElementById('otp');
    
    if (otpInputs.length > 0) {
        // Handle input in OTP fields
        otpInputs.forEach((input, index) => {
            // Focus on first input when OTP section is displayed
            if (index === 0) {
                input.addEventListener('focus', function() {
                    // Clear all inputs when focusing on first input
                    otpInputs.forEach(input => {
                        input.value = '';
                        input.classList.remove('animate-digit');
                    });
                    otpHiddenInput.value = '';
                });
            }
            
            // Handle input event
            input.addEventListener('input', function(e) {
                // Only allow numbers
                this.value = this.value.replace(/[^0-9]/g, '');
                
                if (this.value) {
                    // Add animation class
                    this.classList.add('animate-digit');
                    
                    // Move to next input
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                }
                
                // Update hidden input with all values
                updateHiddenOtpInput();
            });
            
            // Handle keydown events
            input.addEventListener('keydown', function(e) {
                // Handle backspace - move to previous input and clear
                if (e.key === 'Backspace' && !this.value && index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].value = '';
                    otpInputs[index - 1].classList.remove('animate-digit');
                    updateHiddenOtpInput();
                    e.preventDefault();
                }
                
                // Handle arrow keys for navigation
                if (e.key === 'ArrowLeft' && index > 0) {
                    otpInputs[index - 1].focus();
                    e.preventDefault();
                }
                
                if (e.key === 'ArrowRight' && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                    e.preventDefault();
                }
            });
            
            // Handle paste event (only on first input)
            if (index === 0) {
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const pasteData = e.clipboardData.getData('text').trim();
                    
                    // Check if pasted data is valid (6 digits)
                    if (/^\d{6}$/.test(pasteData)) {
                        // Populate all inputs
                        otpInputs.forEach((input, i) => {
                            input.value = pasteData[i] || '';
                            if (input.value) {
                                input.classList.add('animate-digit');
                            }
                        });
                        
                        // Update hidden input
                        updateHiddenOtpInput();
                        
                        // Focus on last input
                        otpInputs[otpInputs.length - 1].focus();
                    }
                });
            }
        });
    }
    
    // Function to update hidden input with all OTP values
    function updateHiddenOtpInput() {
        if (otpHiddenInput && otpInputs) {
            let otp = '';
            otpInputs.forEach(input => {
                otp += input.value;
            });
            otpHiddenInput.value = otp;
        }
    }
    
    // Handle OTP verification
    if (verifyOTPBtn) {
        verifyOTPBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get OTP from hidden input
            const otpValue = otpHiddenInput.value.trim();
            
            if (otpValue && otpValue.length === 6) {
                // Show loading state
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
                this.disabled = true;
                
                // Simulate API call to verify OTP
                setTimeout(() => {
                    // Simulate successful login
                    window.location.href = '/';
                }, 1500);
            } else {
                showToast('Please enter a valid 6-digit OTP', 'error');
                // Focus on first empty input or the first one if all are filled
                let focusSet = false;
                otpInputs.forEach(input => {
                    if (!input.value && !focusSet) {
                        input.focus();
                        focusSet = true;
                    }
                });
                if (!focusSet) {
                    otpInputs[0].focus();
                }
            }
        });
    }
    
    // Password toggle (show/hide)
    const passwordToggle = document.querySelector('.password-toggle-inner');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function(e) {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Toast notification function
    function showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                  type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
                  '<i class="fas fa-info-circle"></i>'}
                <span>${message}</span>
            </div>
        `;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            // Remove from DOM after animation
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }
});