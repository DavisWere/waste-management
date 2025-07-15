from django.contrib import admin
from notification.models import Notification

# Create your views here.
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['resident', 'notification_type', 'title', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['resident__user__username', 'title', 'message']
    date_hierarchy = 'created_at'