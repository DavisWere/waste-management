from django.urls import path
from services.views import resident_dashboard, waste_bins, pickup_schedules

urlpatterns = [
    path('resident/dashboard/', resident_dashboard, name='resident-dashboard'),
    path('waste/bins/', waste_bins, name='waste_bins'),
    path('pickups/', pickup_schedules, name='pickup_schedules'),
]