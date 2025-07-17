from django.db import models
from users.models import User
from django.utils import timezone
from decimal import Decimal

class WasteType(models.Model):
    WASTE_CATEGORIES = [
        ('metal', 'Metal'),
        ('plastic', 'Plastic'),
        ('electronic', 'Electronic'),
        ('paper', 'Paper'),
        ('organic', 'Organic'),
        ('glass', 'Glass'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=50, choices=WASTE_CATEGORIES, unique=True)
    description = models.TextField(blank=True)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    is_valuable = models.BooleanField(default=False)
    color_code = models.CharField(max_length=7, default='#000000')  # Hex color for charts
    
    def __str__(self):
        return self.get_name_display()

class WasteBin(models.Model):
    BIN_SIZES = [
        ('small', 'Small (50L)'),
        ('medium', 'Medium (100L)'),
        ('large', 'Large (200L)'),
        ('extra_large', 'Extra Large (500L)'),
    ]
    
    BIN_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
        ('full', 'Full'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bins')
    bin_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    size = models.CharField(max_length=20, choices=BIN_SIZES)
    waste_type = models.ForeignKey(WasteType, on_delete=models.CASCADE)
    capacity = models.DecimalField(max_digits=8, decimal_places=2)  # in liters
    current_fill_level = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # percentage
    status = models.CharField(max_length=20, choices=BIN_STATUS, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.bin_id} - {self.user.username}"
    
    @property
    def is_full(self):
        return self.current_fill_level >= 90
    
    @property
    def fill_percentage(self):
        return min(self.current_fill_level, 100)


class PickupSchedule(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
    ]
    
    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedules')
    waste_type = models.ForeignKey(WasteType, on_delete=models.CASCADE)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, null=True)
    pickup_day = models.CharField(max_length=20, choices=DAY_CHOICES)
    pickup_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.frequency} {self.pickup_day}"
    

class WastePickup(models.Model):
    PICKUP_STATUS = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('missed', 'Missed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pickups')
    bin = models.ForeignKey(WasteBin, on_delete=models.CASCADE)
    schedule = models.ForeignKey(PickupSchedule, on_delete=models.CASCADE, null=True, blank=True)
    pickup_date = models.DateTimeField()
    actual_pickup_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PICKUP_STATUS, default='scheduled')
    weight_collected = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)  # in kg
    driver_name = models.CharField(max_length=100, blank=True)
    driver_contact = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.pickup_date.strftime('%Y-%m-%d')}"
    
    @property
    def is_completed(self):
        return self.status == 'completed'
    
    @property
    def calculated_value(self):
        if self.weight_collected and self.bin.waste_type.price_per_kg:
            return self.weight_collected * self.bin.waste_type.price_per_kg
        return Decimal('0.00')

class MarketRequirement(models.Model):
    REQUIREMENT_STATUS = [
        ('active', 'Active'),
        ('fulfilled', 'Fulfilled'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    waste_type = models.ForeignKey(WasteType, on_delete=models.CASCADE)
    required_quantity = models.DecimalField(max_digits=10, decimal_places=2)  # in kg
    offered_price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=200)
    deadline = models.DateTimeField()
    status = models.CharField(max_length=20, choices=REQUIREMENT_STATUS, default='active')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.company_name} - {self.waste_type.name} - {self.required_quantity}kg"
    
    @property
    def is_active(self):
        return self.status == 'active' and self.deadline > timezone.now()
    
    @property
    def days_remaining(self):
        if self.deadline > timezone.now():
            return (self.deadline - timezone.now()).days
        return 0
    
class WasteTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('export', 'Export'),
        ('local_sale', 'Local Sale'),
        ('processing', 'Processing'),
        ('disposal', 'Disposal'),
    ]
    
    pickup = models.ForeignKey(WastePickup, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    buyer_company = models.CharField(max_length=200, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)  # in kg
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.quantity}kg - ${self.total_amount}"
    
    def save(self, *args, **kwargs):
        if not self.total_amount:
            self.total_amount = self.quantity * self.price_per_kg
        super().save(*args, **kwargs)