from django.urls import path
from users.views import dashboard, login_view

urlpatterns =[
    path('dashboard/', dashboard ,name='dashboard'),
    path('login/', login_view, name='login'),
]