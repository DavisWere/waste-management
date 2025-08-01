# views.py
from django.shortcuts import render, get_object_or_404, redirect
from .models import WastePickup, Payment
from .forms import PaymentForm
from django.contrib.auth.decorators import login_required
from django.utils import timezone

@login_required
def set_payment(request, pickup_id):
    pickup = get_object_or_404(WastePickup, id=pickup_id)

    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            payment = form.save(commit=False)
            payment.waste = pickup
            payment.save()
            return redirect('collector_pickups')  # or any success URL
    else:
        form = PaymentForm()

    return render(request, 'set_payment.html', {'form': form, 'pickup': pickup})


@login_required
def make_payment(request, pickup_id):
    pickup = get_object_or_404(WastePickup, id=pickup_id, user=request.user)
    payment = Payment.objects.filter(waste=pickup).first()

    if request.method == 'POST' and payment and not payment.is_paid:
        # Simulate payment success
        payment.is_paid = True
        payment.transaction_id = f"TXN{timezone.now().strftime('%Y%m%d%H%M%S')}"
        payment.paid_at = timezone.now()
        payment.save()
        return redirect('payment_success')  # or your preferred page

    return render(request, 'make_payment.html', {'pickup': pickup, 'payment': payment})



@login_required
def select_pickup_for_payment(request):
    pickups = WastePickup.objects.filter(user=request.user, payment__isnull=True)
    return render(request, 'select_pickup.html', {'pickups': pickups})
