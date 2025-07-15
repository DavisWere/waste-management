from django.urls import path
from services.views import resident_dashboard

urlpatterns = [
    path('resident/dashboard/', resident_dashboard, name='resident-dashboard'),
]