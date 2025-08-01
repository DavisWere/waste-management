from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Payment, WasteTransaction
from django.utils import timezone

@login_required
def make_payment(request, transaction_id):
    # Only residents can make payments
    if request.user.user_type != 'resident':
        messages.error(request, "Only residents can make payments")
        return redirect('home')

    transaction = get_object_or_404(WasteTransaction, id=transaction_id, user=request.user)
    
    if request.method == 'POST':
        try:
            payment = Payment.objects.create(
                waste=transaction,
                amount=request.POST.get('amount'),
                method=request.POST.get('payment_method'),
                transaction_id=request.POST.get('transaction_id', ''),
                is_paid=True,
                paid_at=timezone.now()
            )
            messages.success(request, "Payment successful!")
            return redirect('view_payments')
        except Exception as e:
            messages.error(request, f"Payment failed: {str(e)}")
    
    context = {
        'transaction': transaction,
        'payment_methods': Payment.PAYMENT_METHODS
    }
    return render(request, 'make_payments.html', context)

@login_required
def view_payments(request):
    # Both residents and collectors can view their payments
    if request.user.user_type == 'resident':
        payments = Payment.objects.filter(waste__user=request.user)
    elif request.user.user_type == 'garbage_collector':
        payments = Payment.objects.filter(waste__driver_name=request.user.get_full_name())
    else:
        payments = Payment.objects.none()
    
    context = {
        'payments': payments.order_by('-paid_at')
    }
    return render(request, 'view_payments.html', context)