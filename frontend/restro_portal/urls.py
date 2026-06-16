from django.urls import path
from . import views

urlpatterns = [
    # Dashboard & Auth
    path('', views.index, name='restro_index'),
    path('index', views.index),
    path('index.php', views.index),
    path('dashboard-live-data', views.dashboard_live_data),
    path('dashboard-live-data.php', views.dashboard_live_data),
    path('login', views.login_view, name='restro_login'),
    path('login.php', views.login_view),
    path('logout', views.logout_view, name='restro_logout'),
    path('logout.php', views.logout_view),
    path('signup', views.signup_view, name='restro_signup'),
    path('signup.php', views.signup_view),
    path('forget', views.forget_view, name='restro_forget'),
    path('forget.php', views.forget_view),

    # Category Management
    path('manage-category', views.manage_category, name='restro_manage_category'),
    path('manage-category.php', views.manage_category),
    path('add-category', views.add_category, name='restro_add_category'),
    path('add-category.php', views.add_category),
    path('update-category', views.update_category, name='restro_update_category'),
    path('update-category.php', views.update_category),
    path('delete-category', views.delete_category, name='restro_delete_category'),
    path('delete-category.php', views.delete_category),

    # Food Management
    path('manage-food', views.manage_food, name='restro_manage_food'),
    path('manage-food.php', views.manage_food),
    path('add-food', views.add_food, name='restro_add_food'),
    path('add-food.php', views.add_food),
    path('update-food', views.update_food, name='restro_update_food'),
    path('update-food.php', views.update_food),
    path('delete-food', views.delete_food, name='restro_delete_food'),
    path('delete-food.php', views.delete_food),

    # Inventory
    path('inventory', views.inventory, name='restro_inventory'),
    path('inventory.php', views.inventory),
    path('update-inventory', views.update_inventory, name='restro_update_inventory'),
    path('update-inventory.php', views.update_inventory),

    # Online Orders
    path('manage-online-order', views.manage_online_order, name='restro_manage_online_order'),
    path('manage-online-order.php', views.manage_online_order),
    path('update-online-order', views.update_online_order, name='restro_update_online_order'),
    path('update-online-order.php', views.update_online_order),
    path('manage-repeat-rate', views.manage_repeat_rate, name='restro_manage_repeat_rate'),
    path('manage-repeat-rate.php', views.manage_repeat_rate),

    # Reviews & Settings & Revenue
    path('manage-review', views.manage_review, name='restro_manage_review'),
    path('manage-review.php', views.manage_review),
    path('settings', views.settings_view, name='restro_settings'),
    path('settings.php', views.settings_view),
    path('update-password', views.update_password_view, name='restro_update_password'),
    path('update-password.php', views.update_password_view),
    path('monthly-revenue', views.monthly_revenue, name='restro_monthly_revenue'),
    path('monthly-revenue.php', views.monthly_revenue),
]
