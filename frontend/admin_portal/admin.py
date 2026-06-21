from django.contrib import admin
from .models import (
    Admin as SystemAdmin, DeliveryBoy, DeliveryPayment,
    RestroCategoryNotApproved, EatInPay
)

@admin.register(SystemAdmin)
class SystemAdminAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'username', 'email')
    search_fields = ('full_name', 'username', 'email')

@admin.register(DeliveryBoy)
class DeliveryBoyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'username', 'email', 'mobile_number', 'status', 'user_role')
    search_fields = ('name', 'username', 'email')
    list_filter = ('status', 'user_role')

@admin.register(DeliveryPayment)
class DeliveryPaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'salary', 'payment_status', 'order_id', 'created_at')
    search_fields = ('username', 'order_id')
    list_filter = ('payment_status',)

@admin.register(RestroCategoryNotApproved)
class RestroCategoryNotApprovedAdmin(admin.ModelAdmin):
    list_display = ('cid', 'title', 'image_name', 'featured', 'active', 'status', 'restro_name', 'created_at')
    search_fields = ('title', 'restro_name')
    list_filter = ('status', 'restro_name')

@admin.register(EatInPay)
class EatInPayAdmin(admin.ModelAdmin):
    list_display = ('id', 'table_id', 'amount', 'tran_id', 'order_date', 'payment_status', 'order_status')
    search_fields = ('table_id', 'tran_id')
    list_filter = ('payment_status', 'order_status')
