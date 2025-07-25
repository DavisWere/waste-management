from django.contrib.auth.forms import UserCreationForm
from django import forms
from users.models import User


class VictimRegistrationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["username","first_name", "last_name", "email", "phone_number",  "password1", "password2"]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.user_type = "resident"  
        if commit:
            user.save()
        return user


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number']  # exclude user_type
