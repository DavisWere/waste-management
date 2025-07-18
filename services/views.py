from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import WasteBin, WasteType
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from decimal import Decimal
from .models import PickupSchedule, WastePickup, WasteType, MarketRequirement
from payment.models import Payment
from django.db.models import Q

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
def resident_pickup_schedules(request):
    if request.method == 'POST':
        try:
            # Handle schedule creation
            if 'create_schedule' in request.POST:
                PickupSchedule.objects.create(
                    user=request.user,
                    waste_type_id=request.POST.get('waste_type'),
                    frequency=request.POST.get('frequency'),
                    pickup_day=request.POST.get('pickup_day'),
                    pickup_time=request.POST.get('pickup_time'),
                    is_active=True
                )
                messages.success(request, "Schedule created successfully!")
                return redirect('pickup_schedules')
                
            # Handle schedule update
            elif 'update_schedule' in request.POST:
                schedule = get_object_or_404(PickupSchedule, id=request.POST.get('schedule_id'), user=request.user)
                schedule.waste_type_id = request.POST.get('waste_type')
                schedule.frequency = request.POST.get('frequency')
                schedule.pickup_day = request.POST.get('pickup_day')
                schedule.pickup_time = request.POST.get('pickup_time')
                schedule.save()
                messages.success(request, "Schedule updated successfully!")
                return redirect('pickup_schedules')
                
            # Handle schedule deletion
            elif 'delete_schedule' in request.POST:
                schedule = get_object_or_404(PickupSchedule, id=request.POST.get('schedule_id'), user=request.user)
                schedule.delete()
                messages.success(request, "Schedule deleted successfully!")
                return redirect('pickup_schedules')
                
        except Exception as e:
            messages.error(request, f"Error: {str(e)}")
    
    # Get all schedules for the current user
    schedules = PickupSchedule.objects.filter(user=request.user)
    
    # Get upcoming pickups (assuming WastePickup is created from schedules)
    upcoming_pickups = WastePickup.objects.filter(
        user=request.user,
        pickup_date__gte=timezone.now()
    ).order_by('pickup_date')
    
    # Get available waste types
    waste_types = WasteType.objects.all()
    
    context = {
        'schedules': schedules,
        'waste_types': waste_types,
        'upcoming_pickups': upcoming_pickups,
        'frequency_choices': dict(PickupSchedule.FREQUENCY_CHOICES),
        'day_choices': dict(PickupSchedule.DAY_CHOICES),
    }
    return render(request, 'resident_pickups.html', context)


@login_required(login_url='/login/')
def resident_dashboard(request):
    return render(request, 'resident_dashboard.html')

@login_required(login_url='/login/')
def collector_dashboard(request):
    return render(request, 'collector_dashboard.html')

 
