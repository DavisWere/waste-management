from django.urls import path
from users.views import  login_view, home, logout_view, register_resident

urlpatterns =[
    path('login/', login_view, name='login'),
    path('', home, name='home'),
    path('logout/', logout_view, name='logout'),
    path("signup/", register_resident, name="signup"),
    
]