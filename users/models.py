from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class User(AbstractUser):
    USER_TYPES = [
        ('resident', 'Resident'),
        ('garbage_collector', 'Garbage Collection Company'),
        ('municipal_authority', 'Municipal Authority'),
    ]
    phone_regex = RegexValidator(
    regex=r'^\+\d{1,3}\d{9}$',  
    message="Phone number must start with '+' followed by country code and 9 digits."
    )
    first_name=models.CharField(max_length=30, null=True, blank=True)
    last_name = models.CharField(max_length=30, null=True, blank=True)
    phone_number = models.CharField(
        max_length=20,
        validators=[phone_regex],
        blank=True,
        null=True
    )
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='resident')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username




