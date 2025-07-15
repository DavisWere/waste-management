// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeCharts();
    initializeInteractions();
});

// Initialize Dashboard
function initializeDashboard() {
    console.log('Dashboard initialized');
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize navigation
    initializeNavigation();
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            // Filter dashboard cards based on search term
            const statCards = document.querySelectorAll('.stat-card');
            
            statCards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm) || searchTerm === '') {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                } else {
                    card.style.opacity = '0.3';
                }
            });
        });
    }
}

// Navigation Functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // You can add routing logic here for Django views
            const itemText = this.textContent.trim();
            console.log(`Navigating to: ${itemText}`);
        });
    });
}

// Chart Initialization
function initializeCharts() {
    // Initialize all charts
    initializePickupTrendChart();
    initializeWasteChart();
    initializeScheduledChart();
    initializeRatioChart();
    initializeDeviceChart();
    initializeStreamChart();
}

// Pickup Trend Chart (Line Chart)
function initializePickupTrendChart() {
    const canvas = document.getElementById('pickupTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Sample data for trend
    const data = [20, 25, 22, 28, 32, 35, 30, 38, 42, 45, 48, 52];
    const max = Math.max(...data);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw trend line
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - (value / max) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Add gradient fill
    ctx.fillStyle = 'rgba(0, 212, 170, 0.1)';
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
}

// Waste Chart (Bar Chart)
function initializeWasteChart() {
    const canvas = document.getElementById('wasteChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Data for waste types
    const wasteData = [
        { type: 'Metal', value: 80, color: '#00d4aa' },
        { type: 'Plastic', value: 60, color: '#0099cc' },
        { type: 'Electronic', value: 70, color: '#00b4d8' },
        { type: 'Paper', value: 90, color: '#90e0ef' },
        { type: 'Other', value: 40, color: '#48cae4' }
    ];
    
    const barWidth = width / wasteData.length - 10;
    const maxValue = Math.max(...wasteData.map(d => d.value));
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw bars
    wasteData.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * height * 0.8;
        const x = index * (barWidth + 10) + 5;
        const y = height - barHeight;
        
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth, barHeight);
    });
}

// Scheduled vs Pickups Chart
function initializeScheduledChart() {
    const canvas = document.getElementById('scheduledChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Sample data for scheduled vs collected
    const scheduledData = [800, 750, 900, 1200, 1100, 950, 1000, 850, 920, 1050, 1150, 1000, 1100];
    const collectedData = [600, 580, 720, 800, 750, 700, 650, 600, 680, 750, 800, 720, 750];
    
    const barWidth = width / scheduledData.length - 4;
    const maxValue = Math.max(...scheduledData);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw bars
    scheduledData.forEach((scheduled, index) => {
        const collected = collectedData[index];
        const x = index * (barWidth + 4) + 2;
        
        // Scheduled bar (background)
        const scheduledHeight = (scheduled / maxValue) * height * 0.8;
        const scheduledY = height - scheduledHeight;
        
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(x, scheduledY, barWidth, scheduledHeight);
        
        // Collected bar (foreground)
        const collectedHeight = (collected / maxValue) * height * 0.8;
        const collectedY = height - collectedHeight;
        
        ctx.fillStyle = '#00d4aa';
        ctx.fillRect(x, collectedY, barWidth, collectedHeight);
    });
    
    // Add month labels
    const months = ['2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan', '8 Jan', '9 Jan', '10 Jan', '11 Jan', '12 Jan', '13 Jan'];
    ctx.fillStyle = '#888888';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    months.forEach((month, index) => {
        const x = index * (barWidth + 4) + barWidth / 2 + 2;
        if (index % 2 === 0) { // Show every other label to avoid crowding
            ctx.fillText(month, x, height - 5);
        }
    });
}

// Pickup Ratio Chart (Donut Chart)
function initializeRatioChart() {
    const canvas = document.getElementById('ratioChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw donut chart
    const percentage = 0.75; // 75%
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (percentage * 2 * Math.PI);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 20;
    ctx.stroke();
    
    // Progress arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Add percentage text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('75%', centerX, centerY);
}

// IoT Device Status Chart
function initializeDeviceChart() {
    const canvas = document.getElementById('deviceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sample IoT device data (scattered points)
    const devices = [
        { x: 20, y: 30, status: 'online' },
        { x: 50, y: 40, status: 'online' },
        { x: 80, y: 25, status: 'offline' },
        { x: 120, y: 60, status: 'online' },
        { x: 160, y: 45, status: 'online' },
        { x: 30, y: 80, status: 'offline' },
        { x: 70, y: 90, status: 'online' },
        { x: 140, y: 100, status: 'online' },
        { x: 180, y: 80, status: 'maintenance' }
    ];
    
    // Draw connection lines
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    devices.forEach((device, index) => {
        if (index > 0) {
            ctx.moveTo(devices[index - 1].x, devices[index - 1].y);
            ctx.lineTo(device.x, device.y);
        }
    });
    ctx.stroke();
    
    // Draw device points
    devices.forEach(device => {
        ctx.beginPath();
        ctx.arc(device.x, device.y, 4, 0, 2 * Math.PI);
        
        switch(device.status) {
            case 'online':
                ctx.fillStyle = '#00d4aa';
                break;
            case 'offline':
                ctx.fillStyle = '#ff6b35';
                break;
            case 'maintenance':
                ctx.fillStyle = '#ffd23f';
                break;
        }
        
        ctx.fill();
    });
}

// Stream Chart
function initializeStreamChart() {
    const canvas = document.getElementById('streamChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create flowing stream effect
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(0, 212, 170, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 212, 170, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 212, 170, 0.1)');
    
    ctx.fillStyle = gradient;
    
    // Draw flowing curves
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    for (let x = 0; x < width; x += 10) {
        const y = height / 2 + Math.sin(x * 0.02) * 20;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
    
    // Add flowing particles
    ctx.fillStyle = '#00d4aa';
    for (let i = 0; i < 10; i++) {
        const x = (i / 10) * width;
        const y = height / 2 + Math.sin(x * 0.02) * 20;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Interactive Features
function initializeInteractions() {
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 20px rgba(0, 212, 170, 0.1)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add click handlers for interactive elements
    initializeTableInteractions();
    initializeChartInteractions();
}

// Table Interactions
function initializeTableInteractions() {
    const tableRows = document.querySelectorAll('.requirements-table tr');
    
    tableRows.forEach(row => {
        if (row.querySelector('td')) { // Skip header row
            row.addEventListener('click', function() {
                // Remove active class from all rows
                tableRows.forEach(r => r.classList.remove('active-row'));
                
                // Add active class to clicked row
                this.classList.add('active-row');
                
                // You can add more functionality here (e.g., show details modal)
                console.log('Row clicked:', this.textContent);
            });
        }
    });
}

// Chart Interactions
function initializeChartInteractions() {
    // Add click handlers for charts
    const chartCanvases = document.querySelectorAll('canvas');
    
    chartCanvases.forEach(canvas => {
        canvas.addEventListener('click', function(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            console.log(`Chart clicked at: ${x}, ${y}`);
            
            // You can add chart-specific interaction logic here
            // For example, show tooltips or drill-down functionality
        });
    });
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function updateDashboardData() {
    // Function to update dashboard with new data
    // This would typically fetch data from Django backend
    console.log('Updating dashboard data...');
    
    // Example: Update total pickups
    const totalPickups = document.querySelector('.stat-number');
    if (totalPickups) {
        // Simulate data update
        const newValue = (Math.random() * 100 + 50).toFixed(2);
        totalPickups.textContent = newValue;
    }
    
    // Re-initialize charts with new data
    initializeCharts();
}

// Auto-refresh functionality
function startAutoRefresh() {
    setInterval(updateDashboardData, 30000); // Refresh every 30 seconds
}

// Export functions for Django integration
window.dashboardAPI = {
    updateData: updateDashboardData,
    refreshCharts: initializeCharts,
    startAutoRefresh: startAutoRefresh
};

// Initialize auto-refresh on load
// startAutoRefresh(); // Uncomment to enable auto-refresh

// Add CSS for active row styling
const style = document.createElement('style');
style.textContent = `
    .active-row {
        background-color: rgba(0, 212, 170, 0.1) !important;
    }
    
    .stat-card {
        transition: all 0.3s ease;
    }
    
    .requirements-table tr:hover {
        background-color: rgba(255, 255, 255, 0.05);
        cursor: pointer;
    }
`;
document.head.appendChild(style);