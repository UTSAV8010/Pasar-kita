from django.contrib import admin
from .models import (
    Category, Food, Restro, RestroFoodItem, User,
    OrderManager, Coupon, FestivalCoupon, Review, ReviewRestro,
    ContactMessage, Aamarpay
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'image_name', 'featured', 'active')
    search_fields = ('title',)
    list_filter = ('featured', 'active')

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'price', 'restro_name', 'image_name', 'category_id', 'featured', 'active', 'stock')
    search_fields = ('title', 'restro_name')
    list_filter = ('featured', 'active', 'restro_name')

@admin.register(Restro)
class RestroAdmin(admin.ModelAdmin):
    list_display = ('id', 'restro_name', 'username', 'email', 'mobile_no', 'status', 'user_role')
    search_fields = ('restro_name', 'username', 'email')
    list_filter = ('status', 'user_role')

@admin.register(RestroFoodItem)
class RestroFoodItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'price', 'restro_name', 'cid', 'stock', 'status')
    search_fields = ('title', 'restro_name')
    list_filter = ('status', 'restro_name')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'username', 'user_role')
    search_fields = ('name', 'email', 'username')
    list_filter = ('user_role',)

@admin.register(OrderManager)
class OrderManagerAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'username', 'cus_name', 'cus_email', 'total_amount', 'payment_status', 'order_status', 'order_date')
    search_fields = ('order_id', 'username', 'cus_name', 'transaction_id')
    list_filter = ('payment_status', 'order_status')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'coupon_code', 'status', 'discount')
    search_fields = ('name', 'coupon_code')
    list_filter = ('status',)

@admin.register(FestivalCoupon)
class FestivalCouponAdmin(admin.ModelAdmin):
    list_display = ('id', 'festival_name', 'coupon_code', 'status', 'discount', 'expire')
    search_fields = ('festival_name', 'coupon_code')
    list_filter = ('status', 'expire')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'order_id', 'review_star', 'username', 'created_at')
    search_fields = ('name', 'username')
    list_filter = ('review_star',)

@admin.register(ReviewRestro)
class ReviewRestroAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'restro_name', 'rating_star', 'created_at')
    search_fields = ('customer_name', 'restro_name')
    list_filter = ('rating_star', 'restro_name')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'subject', 'message_status', 'date')
    search_fields = ('name', 'subject')
    list_filter = ('message_status',)

@admin.register(Aamarpay)
class AamarpayAdmin(admin.ModelAdmin):
    list_display = ('id', 'cus_name', 'amount', 'status', 'transaction_id', 'card_type', 'order_id', 'pay_time')
    search_fields = ('cus_name', 'transaction_id', 'order_id')
    list_filter = ('status', 'card_type')
