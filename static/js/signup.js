// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Password visibility toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const passwordInput = this.parentElement.querySelector('.form-input');
            const isPassword = passwordInput.type === 'password';
            
            // Toggle password visibility
            passwordInput.type = isPassword ? 'text' : 'password';
            
            // Update icon
            const icon = this.querySelector('svg');
            if (isPassword) {
                // Show "eye-off" icon when password is visible
                icon.innerHTML = `
                    <path d="M1 10s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="1" y1="1" x2="19" y2="19" stroke="currentColor" stroke-width="2"/>
                `;
            } else {
                // Show "eye" icon when password is hidden
                icon.innerHTML = `
                    <path d="M1 10s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                `;
            }
        });
    });

    // Form validation and submission
    const registrationForm = document.querySelector('.registration-form');
    const submitButton = document.querySelector('.submit-button');
    
    if (registrationForm) {
        // Real-time validation
        const inputs = registrationForm.querySelectorAll('.form-input');
        const termsCheckbox = registrationForm.querySelector('input[name="terms"]');
        
        // Add input event listeners for real-time validation
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateField(this);
                updateSubmitButton();
            });
            
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
        
        // Terms checkbox validation
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', function() {
                validateTerms(this);
                updateSubmitButton();
            });
        }
        
        // Form submission
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields before submission
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (termsCheckbox && !validateTerms(termsCheckbox)) {
                isValid = false;
            }
            
            if (isValid) {
                submitForm();
            }
        });
    }
    
    // Field validation function
    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error styling
        field.classList.remove('error');
        removeErrorMessage(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Specific field validations
        switch (fieldName) {
            case 'username':
                if (value && value.length < 3) {
                    isValid = false;
                    errorMessage = 'Username must be at least 3 characters long';
                } else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Username can only contain letters, numbers, and underscores';
                }
                break;
                
            case 'email':
                if (value && !isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'password1':
                if (value && value.length < 8) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters long';
                } else if (value && !isStrongPassword(value)) {
                    isValid = false;
                    errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                }
                break;
                
            case 'password2':
                const password1 = document.querySelector('input[name="password1"]');
                if (value && password1 && value !== password1.value) {
                    isValid = false;
                    errorMessage = 'Passwords do not match';
                }
                break;
        }
        
        // Apply error styling and message
        if (!isValid) {
            field.classList.add('error');
            showErrorMessage(field, errorMessage);
        }
        
        return isValid;
    }
    
    // Terms validation
    function validateTerms(checkbox) {
        const isValid = checkbox.checked;
        const checkboxLabel = checkbox.closest('.checkbox-label');
        
        checkboxLabel.classList.toggle('error', !isValid);
        
        if (!isValid) {
            showErrorMessage(checkbox, 'You must agree to the terms and conditions');
        } else {
            removeErrorMessage(checkbox);
        }
        
        return isValid;
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Strong password validation helper
    function isStrongPassword(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return hasUpperCase && hasLowerCase && hasNumbers;
    }
    
    // Show error message
    function showErrorMessage(field, message) {
        removeErrorMessage(field); // Remove existing error message
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const formGroup = field.closest('.form-group');
        formGroup.appendChild(errorDiv);
    }
    
    // Remove error message
    function removeErrorMessage(field) {
        const formGroup = field.closest('.form-group') || field.closest('.checkbox-group');
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Update submit button state
    function updateSubmitButton() {
        const requiredFields = registrationForm.querySelectorAll('input[required]');
        const termsCheckbox = registrationForm.querySelector('input[name="terms"]');
        let allValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim() || field.classList.contains('error')) {
                allValid = false;
            }
        });
        
        if (termsCheckbox && !termsCheckbox.checked) {
            allValid = false;
        }
        
        submitButton.disabled = !allValid;
        submitButton.classList.toggle('disabled', !allValid);
    }
    
    // Form submission with loading state
    function submitForm() {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="loading-spinner" width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="37.7" stroke-dashoffset="37.7">
                    <animate attributeName="stroke-dashoffset" dur="1s" values="37.7;0" repeatCount="indefinite"/>
                </circle>
            </svg>
            Creating Account...
        `;
        
        // Simulate form submission (replace with actual form submission)
        setTimeout(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = `
                Create Account
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            `;
            
            // Here you would normally submit the form
            registrationForm.submit();
        }, 2000);
    }
    
    // Back button functionality
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // You can customize this behavior
            window.history.back();
        });
    }
    
    // Google sign-in button (placeholder functionality)
    const googleSigninButton = document.querySelector('.google-signin-button');
    if (googleSigninButton) {
        googleSigninButton.addEventListener('click', function() {
            // Placeholder for Google OAuth integration
            console.log('Google sign-in clicked');
            // You would integrate with Google OAuth here
            alert('Google sign-in functionality would be implemented here');
        });
    }
    
    // Auto-resize animation for feature section
    const featureSection = document.querySelector('.feature-section');
    if (featureSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(featureSection);
    }
    
    // Smooth scroll for any anchor links
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
    
    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        // Enter key on checkboxes
        if (e.key === 'Enter' && e.target.type === 'checkbox') {
            e.target.checked = !e.target.checked;
            e.target.dispatchEvent(new Event('change'));
        }
        
        // Escape key to clear focused input
        if (e.key === 'Escape' && e.target.classList.contains('form-input')) {
            e.target.blur();
        }
    });
    
    // Password strength indicator (optional enhancement)
    const password1Input = document.querySelector('input[name="password1"]');
    if (password1Input) {
        password1Input.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    function updatePasswordStrength(password) {
        // Remove existing strength indicator
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (password.length === 0) return;
        
        let strength = 0;
        let feedback = [];
        
        if (password.length >= 8) strength++;
        else feedback.push('At least 8 characters');
        
        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('One uppercase letter');
        
        if (/[a-z]/.test(password)) strength++;
        else feedback.push('One lowercase letter');
        
        if (/\d/.test(password)) strength++;
        else feedback.push('One number');
        
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
        
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${(strength / 5) * 100}%; background: ${strengthColors[strength - 1] || '#ef4444'}"></div>
            </div>
            <div class="strength-label" style="color: ${strengthColors[strength - 1] || '#ef4444'}">
                ${strengthLabels[strength - 1] || 'Very Weak'}
            </div>
        `;
        
        const formGroup = password1Input.closest('.form-group');
        formGroup.appendChild(strengthIndicator);
    }
});

// Add CSS for error states and loading spinner
const additionalStyles = `
    .form-input.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .checkbox-label.error .checkbox-custom {
        border-color: #ef4444 !important;
    }
    
    .error-message {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .error-message::before {
        content: '⚠';
        font-size: 0.875rem;
    }
    
    .submit-button.disabled {
        background: #6b7280 !important;
        cursor: not-allowed !important;
        transform: none !important;
    }
    
    .loading-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .password-strength {
        margin-top: 0.5rem;
    }
    
    .strength-bar {
        width: 100%;
        height: 4px;
        background: #374151;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 0.25rem;
    }
    
    .strength-fill {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 2px;
    }
    
    .strength-label {
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .feature-section {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .feature-section.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);