from django.contrib.auth.forms import UserCreationForm
from .models import User

class VictimRegistrationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone_number",  "password1", "password2"]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.user_type = "resident"  
        if commit:
            user.save()
        return user
    