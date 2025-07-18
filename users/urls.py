from django.urls import path
from users.views import  login_view, home

urlpatterns =[
    path('login/', login_view, name='login'),
    path('', home, name='home'),
    
]