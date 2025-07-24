from django.shortcuts import render,redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import VictimRegistrationForm, UserProfileForm

def home(request):
    return render(request, 'home.html')



def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            print(user)

            # Redirect based on user type
            if user.user_type == "resident":
                return redirect("resident-dashboard")
            elif user.user_type == "garbage_collector": 
                return redirect("collector-dashboard")
            elif user.is_superuser:
                return redirect("admin-dashboard")
            else:
                messages.error(request, "Unauthorized access")
                return redirect("index")  

        else:
            messages.error(request, "Invalid username or password")

    return render(request, "login.html")


def logout_view(request):
    logout(request)  
    return redirect('/')


def register_resident(request):
    if request.method == "POST":
        form = VictimRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
    else:
        form = VictimRegistrationForm()
    
    return render(request, "signup.html", {"form": form})


@login_required(login_url='/login/')
def edit_profile(request):
    user = request.user

    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            if user.user_type == 'resident':
                return redirect('resident-dashboard')
            else:
                return redirect('collector-dashboard')
                

    else:
        form = UserProfileForm(instance=user)

    return render(request, 'edit_profile.html', {'form': form})