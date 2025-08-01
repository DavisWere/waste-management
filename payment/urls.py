from django.urls import path
from .views import make_payment, view_payments

urlpatterns = [
    path('payments/make/<int:transaction_id>/', make_payment, name='make_payment'),
    path('payments/', view_payments, name='view_payments'),
]