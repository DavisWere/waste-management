from django.db import models
from users.models import User

### 2. Service Requests (Pickup Scheduling)
class ServiceRequest(models.Model):
    WASTE_TYPES = (
        ('ORGANIC', 'Organic'),
        ('RECYCLABLE', 'Recyclable'),
        ('HAZARDOUS', 'Hazardous'),
        ('GENERAL', 'General'),
    )
    resident = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'RESIDENT'})
    waste_type = models.CharField(max_length=10, choices=WASTE_TYPES)
    pickup_date = models.DateField()
    pickup_time = models.TimeField()
    address = models.TextField()
    special_instructions = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='PENDING', choices=(
        ('PENDING', 'Pending'),
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ))
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Request #{self.pk} by {self.resident.username}"

