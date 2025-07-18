from django.urls import path
from services.views import resident_dashboard, waste_bins, \
    resident_pickup_schedules, collector_dashboard

urlpatterns = [
    path('resident/dashboard/', resident_dashboard, name='resident-dashboard'),
    path('waste/bins/', waste_bins, name='waste_bins'),
    path('pickups/', resident_pickup_schedules, name='pickup_schedules'),
    path('collector/dashboard/', collector_dashboard, name='collector-dashboard'),
]