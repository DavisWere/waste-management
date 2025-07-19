from django import forms
from .models import Notification

class NotificationForm(forms.ModelForm):
    class Meta:
        model = Notification
        fields = ['user', 'notification_type', 'title', 'message', 'priority']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 3}),
        }

class ReplyForm(forms.Form):
    message = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}))