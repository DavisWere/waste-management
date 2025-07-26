from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import WasteBin, WasteType
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from decimal import Decimal
from .models import PickupSchedule, WastePickup, WasteType, MarketRequirement
from payment.models import Payment
from django.db.models import Q
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO
from .models import WasteTransaction
import datetime

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


@login_required(login_url='/login/')
def collector_pickups(request):
    if request.user.user_type != 'garbage_collector':
        return redirect('home')
    
    # Get today's date for filtering
    today = timezone.now().date()
    
    # Get all pickups assigned to this collector
    pickups = WastePickup.objects.filter(
        Q(driver_name__icontains=request.user.username) |
        Q(driver_contact=request.user.phone_number)
    ).order_by('pickup_date')
    
    # Filter pickups by status if requested
    status_filter = request.GET.get('status')
    if status_filter:
        pickups = pickups.filter(status=status_filter)
    
    # Separate upcoming and past pickups
    upcoming_pickups = pickups.filter(pickup_date__gte=today)
    past_pickups = pickups.filter(pickup_date__lt=today)
    
    # Handle status updates
    if request.method == 'POST' and 'update_status' in request.POST:
        pickup_id = request.POST.get('pickup_id')
        new_status = request.POST.get('new_status')
        notes = request.POST.get('notes', '')
        
        pickup = get_object_or_404(WastePickup, id=pickup_id)
        pickup.status = new_status
        pickup.notes = notes
        
        if new_status == 'in_progress':
            pickup.driver_name = request.user.get_full_name()
            pickup.driver_contact = request.user.phone_number
        
        if new_status == 'completed':
            pickup.actual_pickup_date = timezone.now()
        
        pickup.save()
        return redirect('collector_pickups')
    
    context = {
        'upcoming_pickups': upcoming_pickups,
        'past_pickups': past_pickups,
        'status_choices': dict(WastePickup.PICKUP_STATUS),
        'today': today,
        'status_filter': status_filter
    }
    
    return render(request, 'collector_pickups.html', context)

def market_requirements_view(request):
    requirements = MarketRequirement.objects.select_related('waste_type').order_by('-created_at')

    context = {
        'requirements': requirements
    }
    return render(request, 'market.html', context)
from django.http import HttpResponse
from django.template.loader import get_template
from django.contrib.auth.decorators import login_required
from xhtml2pdf import pisa
from io import BytesIO
from .models import WasteTransaction
from django.shortcuts import get_object_or_404
import datetime

@login_required
def download_user_report_pdf(request):
    # Get all transactions for the logged-in user
    transactions = WasteTransaction.objects.filter(
        pickup__user=request.user
    ).order_by('-transaction_date')
    
    # Prepare context data
    context = {
        'user': request.user,
        'transactions': transactions,
        'date': datetime.datetime.now().strftime("%Y-%m-%d"),
        'logo_path': 'static/images/gorescue_logo.png'  # Update with your logo path
    }
    
    # Load template
    template = get_template('transaction_pdf.html')
    html = template.render(context)
    
    # Create PDF
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
    
    if not pdf.err:
        response = HttpResponse(result.getvalue(), content_type='application/pdf')
        filename = f"gorescue_report_{request.user.username}_{datetime.datetime.now().strftime('%Y%m%d')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    
    return HttpResponse("Error generating PDF", status=500)

