// DOM Elements
const loginForm = document.querySelector('.login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const passwordToggle = document.querySelector('.password-toggle');
const rememberCheckbox = document.getElementById('remember');
const loginBtn = document.querySelector('.login-btn');
const loadingOverlay = document.getElementById('loadingOverlay');
const socialButtons = document.querySelectorAll('.social-btn');
const floatingIcons = document.querySelectorAll('.floating-icon');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupEventListeners();
    loadRememberedUser();
    setupFormValidation();
});

// Setup Event Listeners
function setupEventListeners() {
    // Form submission
    loginForm.addEventListener('submit', handleFormSubmit);
    
    // Password toggle
    passwordToggle.addEventListener('click', togglePassword);
    
    // Input focus effects
    usernameInput.addEventListener('focus', handleInputFocus);
    passwordInput.addEventListener('focus', handleInputFocus);
    usernameInput.addEventListener('blur', handleInputBlur);
    passwordInput.addEventListener('blur', handleInputBlur);
    
    // Remember me checkbox
    rememberCheckbox.addEventListener('change', handleRememberMe);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Loading overlay click to close
    loadingOverlay.addEventListener('click', hideLoadingOverlay);
}

// Form Submit Handler - Modified to work with Django
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate all fields
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();
    
    if (!usernameInput.value.trim()) {
        setValidationError(usernameInput.closest('.input-container'), 'Username is required');
        usernameInput.focus();
        return;
    }
    
    if (!passwordInput.value) {
        setValidationError(passwordInput.closest('.input-container'), 'Password is required');
        passwordInput.focus();
        return;
    }
    
    if (!isUsernameValid || !isPasswordValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }
    
    // Show loading state
    showLoadingOverlay();
    
    // Animate button
    loginBtn.style.transform = 'scale(0.98)';
    setTimeout(() => {
        loginBtn.style.transform = 'scale(1)';
    }, 150);
    
    // Save remember me preference
    if (rememberCheckbox.checked) {
        localStorage.setItem('swiftcollect_remember', usernameInput.value);
    } else {
        localStorage.removeItem('swiftcollect_remember');
    }
    
    // Submit the form normally (Django will handle authentication)
    loginForm.submit();
}

// Remove the entire simulateLogin function and any references to it
// Also remove any demo credential checks

// Keep all other utility functions (togglePassword, showNotification, etc.)
// ... [rest of your utility functions remain unchanged]