from django.urls import path
from .views import notification_view

urlpatterns = [
    path('messages/', notification_view, name='notifications'),
]