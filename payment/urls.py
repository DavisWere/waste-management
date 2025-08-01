# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('collector/select-pickup/', views.select_pickup_for_payment, name='select_pickup'),
    path('collector/pickup/<int:pickup_id>/set-payment/', views.set_payment, name='set_payment'),
    path('resident/pickup/<int:pickup_id>/pay/', views.make_payment, name='make_payment'),

]
