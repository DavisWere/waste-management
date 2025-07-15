from django.shortcuts import render, redirect
from django.contrib import messages
from .models import WasteBin, WasteType
from django.contrib.auth.decorators import login_required

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


def resident_dashboard(request):
    return render(request, 'resident_dashboard.html')
 
