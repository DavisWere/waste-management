from django.contrib import admin
from .models import (
     WasteType, WasteBin, PickupSchedule, WastePickup,
    WasteTransaction, MarketRequirement, 
)

@admin.register(WasteType)
class WasteTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_per_kg', 'is_valuable', 'color_code']
    list_filter = ['is_valuable']
    search_fields = ['name']

@admin.register(WasteBin)
class WasteBinAdmin(admin.ModelAdmin):
    list_display = ['bin_id', 'user', 'waste_type', 'size', 'current_fill_level', 'status']
    list_filter = ['size', 'waste_type', 'status', 'created_at']
    search_fields = ['bin_id', 'user__username']

@admin.register(PickupSchedule)
class PickupScheduleAdmin(admin.ModelAdmin):
    list_display = ['user', 'waste_type', 'frequency', 'pickup_day', 'pickup_time', 'is_active']
    list_filter = ['frequency', 'pickup_day', 'is_active']
    search_fields = ['user__username']

@admin.register(WastePickup)
class WastePickupAdmin(admin.ModelAdmin):
    list_display = ['user', 'bin', 'pickup_date', 'status', 'weight_collected', 'calculated_value']
    list_filter = ['status', 'pickup_date', 'bin__waste_type']
    search_fields = ['user__username', 'driver_name']
    date_hierarchy = 'pickup_date'

@admin.register(WasteTransaction)
class WasteTransactionAdmin(admin.ModelAdmin):
    list_display = ['pickup', 'transaction_type', 'buyer_company', 'quantity', 'total_amount', 'transaction_date']
    list_filter = ['transaction_type', 'transaction_date']
    search_fields = ['buyer_company', 'location']
    date_hierarchy = 'transaction_date'

@admin.register(MarketRequirement)
class MarketRequirementAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'waste_type', 'required_quantity', 'offered_price', 'location', 'status', 'deadline']
    list_filter = ['waste_type', 'status', 'created_at']
    search_fields = ['company_name', 'contact_person', 'location']
    date_hierarchy = 'deadline'





