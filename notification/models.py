from django.db import models
from users.models import User


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('pickup_scheduled', 'Pickup Scheduled'),
        ('pickup_completed', 'Pickup Completed'),
        ('bin_full', 'Bin Full'),
        ('payment_received', 'Payment Received'),
        ('device_offline', 'Device Offline'),
        ('market_opportunity', 'Market Opportunity'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']
