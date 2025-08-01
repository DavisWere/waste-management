from django.db import models
from services.models import WastePickup

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('MOBILE', 'Mobile Money'),
        ('CARD', 'Credit/Debit Card'),
        ('CASH', 'Cash on Pickup'),
    )
    waste = models.ForeignKey(WastePickup, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, blank=True)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Payment for Request #{self.amount}"

