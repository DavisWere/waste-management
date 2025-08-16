from django import forms
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

class NotificationForm(forms.ModelForm):
    user = forms.ModelChoiceField(
        queryset=User.objects.all(),  
        label='Recipient',
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Notification
        fields = ['user', 'notification_type', 'title', 'message', 'priority']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'notification_type': forms.Select(attrs={'class': 'form-control'}),
            'priority': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        current_user = kwargs.pop('current_user', None)
        super().__init__(*args, **kwargs)

        if current_user:
            if current_user.user_type == 'resident':
                self.fields['user'].queryset = User.objects.all()
            elif current_user.user_type == 'garbage_collector':
                self.fields['user'].queryset = User.objects.all()
            else:
                self.fields['user'].queryset = User.objects.all()

class ReplyForm(forms.Form):
    message = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}))