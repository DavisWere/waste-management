from django.urls import path
from services.views import resident_dashboard, waste_bins, \
    resident_pickup_schedules, collector_dashboard, \
        collector_pickups, market_requirements_view, download_user_report_pdf

urlpatterns = [
    path('resident/dashboard/', resident_dashboard, name='resident-dashboard'),
    path('waste/bins/', waste_bins, name='waste_bins'),
    path('pickups/', resident_pickup_schedules, name='pickup_schedules'),
    path('collector/dashboard/', collector_dashboard, name='collector-dashboard'),
    path('collector/pickups/', collector_pickups, name='collector_pickups'),
    path('market/requirements/', market_requirements_view, name='market_requirements'),
    path('reports/download/', download_user_report_pdf, name='download_user_report'),
]