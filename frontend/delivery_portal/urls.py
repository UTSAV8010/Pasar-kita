from django.urls import path
from . import views

urlpatterns = [
    # Dashboard & Auth
    path('', views.index, name='delivery_index'),
    path('index', views.index),
    path('index.php', views.index),
    path('dashboard-live-data', views.dashboard_live_data),
    path('dashboard-live-data.php', views.dashboard_live_data),
    path('login', views.login_view, name='delivery_login'),
    path('login.php', views.login_view),
    path('logout', views.logout_view, name='delivery_logout'),
    path('logout.php', views.logout_view),
    path('signup', views.signup_view, name='delivery_signup'),
    path('signup.php', views.signup_view),
    path('forget', views.forget_view, name='delivery_forget'),
    path('forget.php', views.forget_view),

    # Order processing
    path('manage-online-order', views.manage_online_order, name='delivery_manage_online_order'),
    path('manage-online-order.php', views.manage_online_order),
    path('take-order', views.take_order, name='delivery_take_order'),
    path('take-order.php', views.take_order),
    path('finish-order', views.finish_order, name='delivery_finish_order'),
    path('finish-order.php', views.finish_order),

    # Reviews, payments & revenue
    path('manage-delivery-payment', views.manage_delivery_payment, name='delivery_manage_payment'),
    path('manage-delivery-payment.php', views.manage_delivery_payment),
    path('manage-review', views.manage_review, name='delivery_manage_review'),
    path('manage-review.php', views.manage_review),
    path('monthly-revenue', views.monthly_revenue, name='delivery_monthly_revenue'),
    path('monthly-revenue.php', views.monthly_revenue),

    # Settings
    path('settings', views.settings_view, name='delivery_settings'),
    path('settings.php', views.settings_view),
    path('update-password', views.update_password_view, name='delivery_update_password'),
    path('update-password.php', views.update_password_view),
]
