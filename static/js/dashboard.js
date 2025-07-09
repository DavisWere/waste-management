// SwiftCollect Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    initializeInteractions();
    initializeThemeToggle();
    startRealTimeUpdates();
});

// Chart initialization
function initializeCharts() {
    // Pickup Trend Chart
    const pickupTrendCtx = document.getElementById('pickupTrendChart');
    if (pickupTrendCtx) {
        const pickupTrendChart = new Chart(pickupTrendCtx, {
            type: 'line',
            data: {
                labels: Array.from({length: 30}, (_, i) => i + 1),
                datasets: [{
                    data: generateTrendData(30),
                    borderColor: '#00d4aa',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    line: { borderWidth: 2 }
                }
            }
        });
    }

    // Scheduled vs Pickups Chart
    const scheduledCtx = document.getElementById('scheduledChart');
    if (scheduledCtx) {
        const scheduledChart = new Chart(scheduledCtx, {
            type: 'bar',
            data: {
                labels: ['2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan', '8 Jan', '9 Jan', '10 Jan', '11 Jan', '12 Jan', '13 Jan'],
                datasets: [{
                    label: 'Collected',
                    data: [800, 900, 600, 1000, 950, 850, 900, 750, 1100, 950, 1200, 1000],
                    backgroundColor: '#00d4aa',
                    borderRadius: 4,
                    barThickness: 20
                }, {
                    label: 'Leftover',
                    data: [200, 300, 400, 200, 250, 350, 300, 450, 150, 250, 100, 200],
                    backgroundColor: '#ff6b35',
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666' }
                    },
                    y: {
                        grid: { color: '#333' },
                        ticks: { color: '#666' }
                    }
                }
            }
        });
    }

    // Stream Chart
    const streamCtx = document.getElementById('streamChart');
    if (streamCtx) {
        const streamChart = new Chart(streamCtx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => i + ':00'),
                datasets: [{
                    label: 'Stream',
                    data: generateStreamData(24),
                    borderColor: '#00d4aa',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666' }
                    },
                    y: {
                        grid: { color: '#333' },
                        ticks: { color: '#666' }
                    }
                }
            }
        });
    }

    // Ratio Chart (Radial)
    const ratioCtx = document.getElementById('ratioChart');
    if (ratioCtx) {
        const ratioChart = new Chart(ratioCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [75, 25],
                    backgroundColor: ['#00d4aa', '#333'],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Device Status Chart
    const deviceCtx = document.getElementById('deviceChart');
    if (deviceCtx) {
        const deviceChart = new Chart(deviceCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Online',
                    data: generateDeviceData(20, 'online'),
                    backgroundColor: '#00d4aa',
                    pointRadius: 6
                }, {
                    label: 'Offline',
                    data: generateDeviceData(5, 'offline'),
                    backgroundColor: '#ff6b35',
                    pointRadius: 6
                }, {
                    label: 'Maintenance',
                    data: generateDeviceData(3, 'maintenance'),
                    backgroundColor: '#ffd93d',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { display: false }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { display: false }
                    }
                }
            }
        });
    }
}

// Navigation interactions
function initializeInteractions() {
    const navItems = document.querySelectorAll('.nav-item');
    const searchInput = document.querySelector('.search-bar input');
    const wasteBreakdownBars = document.querySelectorAll('.bar');

    // Navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Add pulse animation
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'pulse 0.6s ease-out';
            }, 10);
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            // Implement search logic here
            console.log('Searching for:', query);
        });
    }

    // Waste breakdown bar interactions
    wasteBreakdownBars.forEach(bar => {
        bar.addEventListener('mouseenter', function() {
            this.style.transform = 'scaleY(1.1)';
            this.style.filter = 'brightness(1.2)';
        });

        bar.addEventListener('mouseleave', function() {
            this.style.transform = 'scaleY(1)';
            this.style.filter = 'brightness(1)';
        });
    });

    // Table row hover effects
    const tableRows = document.querySelectorAll('.data-table tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });

        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
}

// Real-time updates simulation
function startRealTimeUpdates() {
    setInterval(updateStats, 5000);
    setInterval(updateCharts, 30000);
}

function updateStats() {
    const pickupValue = document.querySelector('.stat-value .main-number');
    const wastePercentage = document.querySelectorAll('.stat-value .main-number')[1];
    
    if (pickupValue) {
        const currentValue = parseFloat(pickupValue.textContent);
        const newValue = (currentValue + (Math.random() - 0.5) * 0.1).toFixed(2);
        pickupValue.textContent = newValue;
        
        // Add animation
        pickupValue.style.animation = 'none';
        setTimeout(() => {
            pickupValue.style.animation = 'pulse 0.5s ease-out';
        }, 10);
    }
    
    if (wastePercentage) {
        const currentValue = parseInt(wastePercentage.textContent);
        const newValue = Math.max(70, Math.min(80, currentValue + (Math.random() - 0.5) * 2));
        wastePercentage.textContent = Math.round(newValue) + '%';
    }
}

function updateCharts() {
    // Update charts with new data
    console.log('Updating charts with real-time data...');
}

// Utility functions
function generateTrendData(points) {
    return Array.from({length: points}, () => Math.floor(Math.random() * 100) + 50);
}

function generateStreamData(points) {
    return Array.from({length: points}, (_, i) => {
        const base = 50 + Math.sin(i * 0.5) * 30;
        return Math.floor(base + (Math.random() - 0.5) * 20);
    });
}

function generateDeviceData(count, status) {
    return Array.from({length: count}, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100
    }));
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes glow {
        0% { box-shadow: 0 0 5px rgba(0, 212, 170, 0.5); }
        50% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.8); }
        100% { box-shadow: 0 0 5px rgba(0, 212, 170, 0.5); }
    }
`;
document.head.appendChild(style);

// Export functions for Django templates
window.SwiftCollect = {
    initializeCharts,
    updateStats,
    generateTrendData,
    generateStreamData
};

// Add this to your existing SwiftCollect.js file

// Theme toggle functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply saved theme
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        icon.className = 'fas fa-sun';
    } else {
        body.removeAttribute('data-theme');
        icon.className = 'fas fa-moon';
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme');
        
        if (currentTheme === 'light') {
            // Switch to dark theme
            body.removeAttribute('data-theme');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
        } else {
            // Switch to light theme
            body.setAttribute('data-theme', 'light');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
        }
        
        // Add animation to the button
        themeToggle.style.animation = 'pulse 0.3s ease-out';
        setTimeout(() => {
            themeToggle.style.animation = '';
        }, 300);
    });
}

// // Update your existing DOMContentLoaded event listener to include theme toggle
// document.addEventListener('DOMContentLoaded', function() {
//     initializeCharts();
//     initializeInteractions();
//     initializeThemeToggle(); // Add this line
//     startRealTimeUpdates();
// });