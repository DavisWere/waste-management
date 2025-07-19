from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Notification, User
from .forms import NotificationForm, ReplyForm
from django.utils import timezone

@login_required
def notification_view(request):
    # Handle marking notifications as read
    if request.method == 'POST' and 'mark_read' in request.POST:
        notification_id = request.POST.get('notification_id')
        notification = get_object_or_404(Notification, id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        messages.success(request, "Notification marked as read")
        return redirect('notifications')
    
    # Handle sending new notifications
    if request.method == 'POST' and 'send_notification' in request.POST:
        form = NotificationForm(request.POST)
        if form.is_valid():
            notification = form.save(commit=False)
            notification.sender = request.user
            notification.save()
            messages.success(request, "Notification sent successfully")
            return redirect('notifications')
    else:
        form = NotificationForm()
    
    # Handle replying to notifications
    if request.method == 'POST' and 'send_reply' in request.POST:
        reply_form = ReplyForm(request.POST)
        if reply_form.is_valid():
            original_notification = get_object_or_404(
                Notification, 
                id=request.POST.get('original_id'),
                user=request.user
            )
            
            # Create new notification as reply
            Notification.objects.create(
                user=original_notification.sender,
                sender=request.user,
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
            return redirect('notifications')
    else:
        reply_form = ReplyForm()
    
    # Get all notifications for the user
    user_notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    
    # Get unread count for badge
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    
    context = {
        'notifications': user_notifications,
        'unread_count': unread_count,
        'form': form,
        'reply_form': reply_form,
    }
    
    return render(request, 'messages.html', context)