from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Notification, User
from .forms import NotificationForm, ReplyForm
from django.utils import timezone

@login_required
def notification_view(request):
    user = request.user

    # Initialize forms early
    form = NotificationForm(request.POST or None, current_user=user)
    reply_form = ReplyForm(request.POST or None)

    # Handle marking notifications as read
    if request.method == 'POST' and 'mark_read' in request.POST:
        notification_id = request.POST.get('notification_id')
        notification = get_object_or_404(Notification, id=notification_id, user=user)
        notification.is_read = True
        notification.save()
        messages.success(request, "Notification marked as read")
        return redirect('resident-dashboard' if user.user_type == 'resident' else 'collector-dashboard')

    # Handle sending new notifications
    elif request.method == 'POST' and 'send_notification' in request.POST:
        if form.is_valid():
            notification = form.save(commit=False)
            notification.sender = user
            notification.save()
            messages.success(request, "Notification sent successfully")
            return redirect('resident-dashboard' if user.user_type == 'resident' else 'collector-dashboard')
        else:
            messages.error(request, "Please correct the form errors.")

    # Handle replying to notifications
    elif request.method == 'POST' and 'send_reply' in request.POST:
        if reply_form.is_valid():
            original_notification = get_object_or_404(
                Notification,
                id=request.POST.get('original_id'),
                user=user
            )

            # Create reply notification
            Notification.objects.create(
                user=original_notification.sender,
                sender=user,
                notification_type='message',
                title=f"Re: {original_notification.title}",
                message=reply_form.cleaned_data['message'],
                priority=original_notification.priority,
                is_read=False
            )

            # Mark original as read
            original_notification.is_read = True
            original_notification.save()

            messages.success(request, "Reply sent successfully")
            return redirect('resident-dashboard' if user.user_type == 'resident' else 'collector-dashboard')
        else:
            messages.error(request, "Please correct the reply form.")

    # Load notifications normally
    user_notifications = Notification.objects.filter(user=user).order_by('-created_at')
    unread_count = Notification.objects.filter(user=user, is_read=False).count()

    context = {
        'notifications': user_notifications,
        'unread_count': unread_count,
        'form': form,
        'reply_form': reply_form,
    }

    return render(request, 'messages.html', context)            