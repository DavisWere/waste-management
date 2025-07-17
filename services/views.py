from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import WasteBin, WasteType
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import PickupSchedule, WastePickup, WasteType

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
                messages.success(request, "Pickup schedule created successfully!")
            
            # Handle schedule update
            elif 'update_schedule' in request.POST:
                schedule = get_object_or_404(PickupSchedule, id=request.POST.get('schedule_id'), user=request.user)
                schedule.frequency = request.POST.get('frequency')
                schedule.pickup_day = request.POST.get('pickup_day')
                schedule.pickup_time = request.POST.get('pickup_time')
                schedule.is_active = request.POST.get('is_active') == 'on'
                schedule.save()
                messages.success(request, "Schedule updated successfully!")
            
            # Handle schedule deletion
            elif 'delete_schedule' in request.POST:
                schedule = get_object_or_404(PickupSchedule, id=request.POST.get('schedule_id'), user=request.user)
                schedule.delete()
                messages.success(request, "Schedule deleted successfully!")
            
            return redirect('pickup_schedules')
        
        except Exception as e:
            messages.error(request, f"Error: {str(e)}")
    
    # Get all data for template
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
    }
    return render(request, 'resident_pickups.html', context)

def collector_pickup_schedules(request):
    if request.method == 'POST':
        try:
            # Handle pickup status update
            if 'update_status' in request.POST:
                pickup = get_object_or_404(WastePickup, id=request.POST.get('pickup_id'))
                pickup.status = request.POST.get('status')
                
                if pickup.status == 'completed':
                    pickup.actual_pickup_date = timezone.now()
                    pickup.driver_name = request.POST.get('driver_name', '')
                    pickup.driver_contact = request.POST.get('driver_contact', '')
                    pickup.weight_collected = request.POST.get('weight_collected')
                    pickup.notes = request.POST.get('notes', '')
                
                pickup.save()
                messages.success(request, "Pickup status updated successfully!")
            
            return redirect('pickup_schedules')
        
        except Exception as e:
            messages.error(request, f"Error: {str(e)}")
    
    # Get all scheduled pickups for this collector
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
 
