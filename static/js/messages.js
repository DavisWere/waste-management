// messages.js - JavaScript for the messages/notifications system

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMessages();
    setupEventListeners();
    setupSearch();
    setupFormValidation();
});

// Initialize messages functionality
function initializeMessages() {
    // Update message timestamps periodically
    updateTimestamps();
    setInterval(updateTimestamps, 60000); // Update every minute
    
    // Setup auto-refresh for new messages
    setupAutoRefresh();
    
    // Initialize message counters
    updateMessageCounters();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

// Setup event listeners
function setupEventListeners() {
    // Mark read forms
    const markReadForms = document.querySelectorAll('.mark-read-form');
    markReadForms.forEach(form => {
        form.addEventListener('submit', handleMarkRead);
    });
    
    // Reply forms
    const replyForms = document.querySelectorAll('.reply-message-form');
    replyForms.forEach(form => {
        form.addEventListener('submit', handleReplySubmit);
    });
    
    // Main message form
    const messageForm = document.querySelector('.message-form');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }
    
    // Escape key to close modals/forms
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Click outside to close options
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.message-options') && !e.target.closest('.btn')) {
            closeAllMessageOptions();
        }
    });
}

// Toggle composer form visibility
function toggleComposer() {
    const composer = document.getElementById('composerForm');
    const toggleBtn = document.querySelector('.toggle-composer');
    const isVisible = composer.style.display !== 'none';
    
    if (isVisible) {
        composer.style.display = 'none';
        toggleBtn.querySelector('.text').textContent = 'New Message';
        toggleBtn.querySelector('.icon').textContent = '➕';
        toggleBtn.classList.remove('active');
    } else {
        composer.style.display = 'block';
        toggleBtn.querySelector('.text').textContent = 'Cancel';
        toggleBtn.querySelector('.icon').textContent = '✕';
        toggleBtn.classList.add('active');
        
        // Focus on recipient field
        const recipientField = composer.querySelector('select, input');
        if (recipientField) {
            recipientField.focus();
        }
    }
    
    // Animate the form
    if (!isVisible) {
        composer.style.opacity = '0';
        composer.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            composer.style.opacity = '1';
            composer.style.transform = 'translateY(0)';
        }, 10);
    }
}

// Filter messages by type
function filterMessages(filterType) {
    const messages = document.querySelectorAll('.notification');
    const tabs = document.querySelectorAll('.tab-btn');
    
    // Update active tab
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === filterType) {
            tab.classList.add('active');
        }
    });
    
    let visibleCount = 0;
    
    messages.forEach(message => {
        let shouldShow = false;
        
        switch (filterType) {
            case 'all':
                shouldShow = true;
                break;
            case 'unread':
                shouldShow = message.classList.contains('unread');
                break;
            case 'sent':
                shouldShow = message.dataset.type === 'sent';
                break;
            case 'received':
                shouldShow = message.dataset.type === 'received';
                break;
        }
        
        if (shouldShow) {
            message.style.display = 'flex';
            visibleCount++;
        } else {
            message.style.display = 'none';
        }
    });
    
    // Update visible count
    document.getElementById('visibleCount').textContent = visibleCount;
    
    // Show empty state if no messages
    const emptyState = document.querySelector('.empty-state');
    const messagesContainer = document.querySelector('.messages-container');
    
    if (visibleCount === 0 && !emptyState) {
        showEmptyState(filterType);
    } else if (visibleCount > 0 && emptyState) {
        emptyState.style.display = 'none';
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('messageSearch');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value.toLowerCase());
        }, 300);
    });
}

// Perform message search
function performSearch(searchTerm) {
    const messages = document.querySelectorAll('.notification');
    let visibleCount = 0;
    
    messages.forEach(message => {
        const title = message.querySelector('h4').textContent.toLowerCase();
        const content = message.querySelector('.message-body p').textContent.toLowerCase();
        const sender = message.querySelector('.message-avatar').textContent.toLowerCase();
        
        const matchesSearch = !searchTerm || 
            title.includes(searchTerm) || 
            content.includes(searchTerm) || 
            sender.includes(searchTerm);
        
        if (matchesSearch) {
            message.style.display = 'flex';
            visibleCount++;
            highlightSearchTerm(message, searchTerm);
        } else {
            message.style.display = 'none';
        }
    });
    
    document.getElementById('visibleCount').textContent = visibleCount;
    
    if (visibleCount === 0) {
        showEmptyState('search', searchTerm);
    }
}

// Highlight search terms
function highlightSearchTerm(messageElement, searchTerm) {
    if (!searchTerm) return;
    
    const textElements = messageElement.querySelectorAll('h4, .message-body p');
    textElements.forEach(element => {
        const originalText = element.textContent;
        const highlightedText = originalText.replace(
            new RegExp(`(${searchTerm})`, 'gi'),
            '<mark>$1</mark>'
        );
        if (highlightedText !== originalText) {
            element.innerHTML = highlightedText;
        }
    });
}

// Toggle message options
function toggleMessageOptions(messageId) {
    const options = document.getElementById(`options-${messageId}`);
    const allOptions = document.querySelectorAll('.message-options');
    
    // Close all other options first
    allOptions.forEach(option => {
        if (option.id !== `options-${messageId}`) {
            option.style.display = 'none';
        }
    });
    
    // Toggle current options
    if (options.style.display === 'none' || !options.style.display) {
        options.style.display = 'block';
        options.style.opacity = '0';
        options.style.transform = 'translateY(-5px)';
        setTimeout(() => {
            options.style.opacity = '1';
            options.style.transform = 'translateY(0)';
        }, 10);
    } else {
        options.style.display = 'none';
    }
}

// Toggle reply form
function toggleReply(messageId) {
    const replyForm = document.getElementById(`reply-${messageId}`);
    const allReplies = document.querySelectorAll('.reply-form');
    
    // Close all other reply forms
    allReplies.forEach(reply => {
        if (reply.id !== `reply-${messageId}`) {
            reply.style.display = 'none';
        }
    });
    
    // Toggle current reply form
    if (replyForm.style.display === 'none' || !replyForm.style.display) {
        replyForm.style.display = 'block';
        const textarea = replyForm.querySelector('textarea');
        if (textarea) {
            setTimeout(() => textarea.focus(), 100);
        }
    } else {
        replyForm.style.display = 'none';
    }
    
    // Close message options
    toggleMessageOptions(messageId);
}

// Handle mark as read
function handleMarkRead(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const notification = form.closest('.notification');
    const button = form.querySelector('.mark-read-btn');
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<span class="icon">⏳</span> Marking...';
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update UI
            notification.classList.remove('unread');
            const unreadIndicator = notification.querySelector('.unread-indicator');
            if (unreadIndicator) {
                unreadIndicator.remove();
            }
            form.remove();
            
            // Update counters
            updateMessageCounters();
            
            showToast('Message marked as read', 'success');
        } else {
            showToast('Failed to mark message as read', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    })
    .finally(() => {
        button.disabled = false;
    });
}

// Handle reply submission
function handleReplySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="icon">⏳</span> Sending...';
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Reply sent successfully', 'success');
            form.reset();
            form.closest('.reply-form').style.display = 'none';
            
            // Optionally refresh messages
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showToast(data.error || 'Failed to send reply', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred while sending reply', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="icon">📤</span> Send Reply';
    });
}

// Handle main message form submission
function handleMessageSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateMessageForm(form)) {
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="icon">⏳</span> Sending...';
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Message sent successfully', 'success');
            form.reset();
            toggleComposer();
            
            // Optionally refresh messages
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showToast(data.error || 'Failed to send message', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred while sending message', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="icon">📤</span> Send Message';
    });
}

// Forward message
function forwardMessage(messageId) {
    const message = document.querySelector(`[data-message-id="${messageId}"]`);
    const title = message.querySelector('h4').textContent;
    const content = message.querySelector('.message-body p').textContent;
    
    // Fill composer with forwarded content
    toggleComposer();
    
    const titleField = document.querySelector('input[name="title"]');
    const messageField = document.querySelector('textarea[name="message"]');
    
    if (titleField) {
        titleField.value = `Fwd: ${title}`;
    }
    
    if (messageField) {
        messageField.value = `\n\n--- Forwarded Message ---\n${content}`;
        messageField.focus();
        messageField.setSelectionRange(0, 0);
    }
    
    showToast('Message ready to forward', 'info');
}

// Delete message
function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('delete_message', '1');
    formData.append('message_id', messageId);
    formData.append('csrfmiddlewaretoken', getCSRFToken());
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.style.opacity = '0';
                messageElement.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    messageElement.remove();
                    updateMessageCounters();
                }, 300);
            }
            showToast('Message deleted', 'success');
        } else {
            showToast('Failed to delete message', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    });
}

// Setup form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

// Validate message form
function validateMessageForm(form) {
    const recipient = form.querySelector('[name="recipient"]');
    const title = form.querySelector('[name="title"]');
    const message = form.querySelector('[name="message"]');
    
    let isValid = true;
    
    if (!recipient?.value) {
        showFieldError(recipient, 'Please select a recipient');
        isValid = false;
    }
    
    if (!title?.value?.trim()) {
        showFieldError(title, 'Please enter a subject');
        isValid = false;
    }
    
    if (!message?.value?.trim()) {
        showFieldError(message, 'Please enter a message');
        isValid = false;
    }
    
    return isValid;
}

// Validate individual field
function validateField(field) {
    const value = field.value?.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    const formGroup = field.closest('.form-group');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.classList.add('error');
    formGroup.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error');
    const formGroup = field.closest('.form-group');
    const existingError = formGroup?.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Update message counters
function updateMessageCounters() {
    const unreadMessages = document.querySelectorAll('.notification.unread').length;
    const totalMessages = document.querySelectorAll('.notification').length;
    
    // Update header stats
    const unreadBadge = document.querySelector('.badge');
    const totalBadge = document.querySelector('.total-badge');
    
    if (unreadBadge) {
        unreadBadge.textContent = `${unreadMessages} unread`;
    }
    
    if (totalBadge) {
        totalBadge.textContent = `${totalMessages} total`;
    }
    
    // Update overview cards
    const unreadCard = document.querySelector('.overview-card .stat-number');
    if (unreadCard) {
        unreadCard.textContent = unreadMessages;
    }
    
    // Update percentage
    const percentage = totalMessages > 0 ? Math.round((unreadMessages / totalMessages) * 100) : 0;
    const trendElement = document.querySelector('.stat-trend.positive');
    if (trendElement) {
        trendElement.textContent = `${percentage}% of total`;
    }
}

// Update timestamps
function updateTimestamps() {
    const timeElements = document.querySelectorAll('.message-time');
    timeElements.forEach(element => {
        const timestamp = element.getAttribute('title');
        if (timestamp) {
            element.textContent = formatTimeAgo(new Date(timestamp));
        }
    });
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Setup auto-refresh
function setupAutoRefresh() {
    // Check for new messages every 30 seconds
    setInterval(() => {
        checkForNewMessages();
    }, 30000);
}

// Check for new messages
function checkForNewMessages() {
    fetch(window.location.href + '?check_new=1', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.new_messages > 0) {
            showToast(`You have ${data.new_messages} new message${data.new_messages > 1 ? 's' : ''}`, 'info');
            
            // Optionally auto-refresh
            if (data.new_messages > 0) {
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }
        }
    })
    .catch(error => {
        console.error('Error checking for new messages:', error);
    });
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to send message
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeForm = document.querySelector('form:focus-within');
            if (activeForm) {
                const submitBtn = activeForm.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        }
        
        // 'c' to compose new message
        if (e.key === 'c' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            toggleComposer();
        }
        
        // 'r' to refresh
        if (e.key === 'r' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            location.reload();
        }
    });
}

// Utility functions
function closeAllModals() {
    // Close composer
    const composer = document.getElementById('composerForm');
    if (composer && composer.style.display === 'block') {
        toggleComposer();
    }
    
    // Close all reply forms
    document.querySelectorAll('.reply-form').forEach(form => {
        form.style.display = 'none';
    });
    
    closeAllMessageOptions();
}

function closeAllMessageOptions() {
    document.querySelectorAll('.message-options').forEach(options => {
        options.style.display = 'none';
    });
}

function showEmptyState(filterType, searchTerm = '') {
    const messagesContainer = document.querySelector('.messages-container');
    const existingEmpty = messagesContainer.querySelector('.empty-state');
    
    if (existingEmpty) {
        existingEmpty.remove();
    }
    
    let emptyHTML = '';
    if (filterType === 'search') {
        emptyHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No messages found</h3>
                <p>No messages match your search for "${searchTerm}"</p>
                <button class="btn btn-ghost" onclick="document.getElementById('messageSearch').value = ''; performSearch('');">
                    Clear Search
                </button>
            </div>
        `;
    } else {
        const messages = {
            unread: { icon: '📬', title: 'No unread messages', desc: 'All caught up! No unread messages.' },
            sent: { icon: '📤', title: 'No sent messages', desc: 'You haven\'t sent any messages yet.' },
            all: { icon: '📭', title: 'No messages', desc: 'Your inbox is empty.' }
        };
        
        const msg = messages[filterType] || messages.all;
        emptyHTML = `
            <div class="empty-state">
                <div class="empty-icon">${msg.icon}</div>
                <h3>${msg.title}</h3>
                <p>${msg.desc}</p>
            </div>
        `;
    }
    
    messagesContainer.insertAdjacentHTML('beforeend', emptyHTML);
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getCSRFToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

// Add CSS for toast notifications and field errors
const additionalStyles = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 400px;
        z-index: 1000;
        border-left: 4px solid #10B981;
        animation: slideIn 0.3s ease;
    }
    
    .toast-error { border-left-color: #ef4444; }
    .toast-warning { border-left-color: #f59e0b; }
    .toast-info { border-left-color: #3b82f6; }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .toast-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        margin-left: 1rem;
    }
    
    .field-error {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .toggle-composer.active {
        background: #ef4444;
        color: white;
    }
    
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f4f6;
        border-top: 2px solid #10B981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);