from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import WasteBin, WasteType
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from decimal import Decimal
from .models import PickupSchedule, WastePickup, WasteType
from payment.models import Payment

@login_required(login_url='/login/')
def waste_bins(request):
    if request.method == 'POST':
        try:
            WasteBin.objects.create(
                user=request.user,
                size=request.POST.get('size'),
                waste_type_id=request.POST.get('waste_type'),
                capacity=request.POST.get('capacity'),
                current_fill_level=request.POST.get('current_fill_level', 0),
                status=request.POST.get('status', 'active'),
            )
            messages.success(request, 'Waste bin added successfully!')
            return redirect('waste_bins')
        except Exception as e:
            messages.error(request, f'Error adding bin: {str(e)}')
    
    bins = WasteBin.objects.filter(user=request.user)
    waste_types = WasteType.objects.all()
    
    context = {
        'bins': bins,
        'waste_types': waste_types,
        'bin_sizes': dict(WasteBin.BIN_SIZES),
        'bin_statuses': dict(WasteBin.BIN_STATUS),
    }
    return render(request, 'waste_bins.html', context)


@login_required(login_url='/login/')
def pickup_schedules(request):
    if request.user.user_type == 'resident':
        return resident_pickup_schedules(request)
    elif request.user.user_type == 'garbage_collector':
        return collector_pickup_schedules(request)
    else:
        messages.error(request, "Unauthorized access")
        return redirect('home')

def resident_pickup_schedules(request):
    if request.method == 'POST':
        try:
            # Handle payment
            if 'make_payment' in request.POST:
                pickup = get_object_or_404(WastePickup, id=request.POST.get('pickup_id'), user=request.user)
                amount = Decimal(request.POST.get('amount'))
                
                payment = Payment.objects.create(
                    waste=pickup.transactions.first(),  # Assuming one transaction per pickup
                    amount=amount,
                    method=request.POST.get('payment_method'),
                    transaction_id=request.POST.get('transaction_id', ''),
                    is_paid=True,
                    paid_at=timezone.now()
                )
                messages.success(request, "Payment successful! Your pickup is now confirmed.")
                return redirect('pickup_schedules')
            
            # Handle other resident actions...
            
        except Exception as e:
            messages.error(request, f"Error: {str(e)}")
    
    schedules = PickupSchedule.objects.filter(user=request.user)
    waste_types = WasteType.objects.all()
    upcoming_pickups = WastePickup.objects.filter(
        user=request.user,
        pickup_date__gte=timezone.now()
    ).order_by('pickup_date')
    
    context = {
        'schedules': schedules,
        'waste_types': waste_types,
        'upcoming_pickups': upcoming_pickups,
        'frequency_choices': dict(PickupSchedule.FREQUENCY_CHOICES),
        'day_choices': dict(PickupSchedule.DAY_CHOICES),
        'payment_methods': dict(Payment.PAYMENT_METHODS),
    }
    return render(request, 'resident_pickups.html', context)

def collector_pickup_schedules(request):
    if request.method == 'POST':
        try:
            # Handle pickup verification
            if 'verify_pickup' in request.POST:
                pickup = get_object_or_404(WastePickup, id=request.POST.get('pickup_id'))
                
                # Check if payment exists
                if not pickup.transactions.exists() or not pickup.transactions.first().payment_set.exists():
                    messages.error(request, "Cannot verify - payment not received")
                    return redirect('pickup_schedules')
                
                # Update pickup status
                pickup.status = 'in_progress'
                pickup.save()
                messages.success(request, "Pickup verified and marked as in progress")
            
            # Handle other collector actions...
            
        except Exception as e:
            messages.error(request, f"Error: {str(e)}")
    
    today = timezone.now().date()
    scheduled_pickups = WastePickup.objects.filter(
        pickup_date__date__gte=today,
        status__in=['scheduled', 'in_progress']
    ).order_by('pickup_date')
    
    context = {
        'scheduled_pickups': scheduled_pickups,
        'status_choices': dict(WastePickup.PICKUP_STATUS),
    }
    return render(request, 'collector_pickups.html', context)


def resident_dashboard(request):
    return render(request, 'resident_dashboard.html')

def collector_dashboard(request):
    return render(request, 'collector_dashboard.html')

 
