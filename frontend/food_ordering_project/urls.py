from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from customer import views

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('admin/', include('admin_portal.urls')),
    path('restro/', include('restro_portal.urls')),
    path('delivery-boy/', include('delivery_portal.urls')),

    # Core Pages
    path('', views.index, name='index'),
    path('index.php', views.index),
    path('index/', views.index),

    path('about/', views.about, name='about'),
    path('about.php', views.about),

    path('team/', views.team, name='team'),
    path('team.php', views.team),

    path('testimonial/', views.testimonial, name='testimonial'),
    path('testimonial.php', views.testimonial),

    path('categories/', views.categories, name='categories'),
    path('categories.php', views.categories),

    path('category-foods/<int:category_id>/', views.category_foods, name='category_foods'),
    path('category-foods.php', views.category_foods), # matches GET category_id parameter fallback

    path('menu/', views.menu, name='menu'),
    path('menu.php', views.menu),

    path('restaurant/', views.restaurant, name='restaurant'),
    path('restaurant.php', views.restaurant),

    path('restro-category/<int:category_id>/', views.restro_category, name='restro_category'),
    path('restro-category.php', views.restro_category),

    path('restro-menu/<str:restro_name>/', views.restro_menu, name='restro_menu'),
    path('restro-menu.php', views.restro_menu),

    # Cart
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('add-to-cart.php', views.add_to_cart),

    path('manage-cart', views.manage_cart, name='manage_cart'),
    path('manage-cart/', views.manage_cart),
    
    path('mycart/', views.mycart, name='mycart'),
    path('mycart.php', views.mycart),

    # Auth
    path('login/', views.login_view, name='login'),
    path('login.php', views.login_view),

    path('signup/', views.signup_view, name='signup'),
    path('signup.php', views.signup_view),

    path('forget/', views.forget_view, name='forget'),
    path('forget.php', views.forget_view),

    path('logout/', views.logout_view, name='logout'),
    path('logout', views.logout_view),

    # Profile Account
    path('myaccount/', views.myaccount, name='myaccount'),
    path('myaccount.php', views.myaccount),

    path('update-account/', views.update_account, name='update_account'),
    path('update-account.php', views.update_account),

    path('update-password/', views.update_password, name='update_password'),
    path('update-password.php', views.update_password),

    # Orders & Reviews
    path('view-orders/', views.view_orders, name='view_orders'),
    path('view-orders.php', views.view_orders),

    path('get_order_status.php', views.get_order_status, name='get_order_status'),

    path('review-restro/<str:restro_name>/', views.review_restro, name='review_restro'),
    path('review-restro.php', views.review_restro),

    path('review-rider/<int:order_id>/', views.review_rider, name='review_rider'),
    path('review-rider.php', views.review_rider),

    path('contact/', views.contact, name='contact'),
    path('contact.php', views.contact),

    path('download-receipt/', views.download_receipt, name='download_receipt'),
    path('download-receipt.php', views.download_receipt),

    # Payment Gateway
    path('pg/checkout/', views.pg_checkout, name='pg_checkout'),
    # path('pg/checkout.php', views.pg_checkout),

    path('pg/process/', views.pg_process, name='pg_process'),
    # path('pg/process.php', views.pg_process),

    path('verify-payment/', views.verify_payment, name='verify_payment'),
    # path('verify-payment.php', views.verify_payment),
    path('temp-run-node-download/', views.temp_run),
    path('cmd-run/', views.cmd_run),
]

# Serve static/media files in development and production (Render)
from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^images/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^restro-img/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'restro' / 'uploads' / 'restro-img')}),
    re_path(r'^licence/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'restro' / 'uploads' / 'licence')}),
    re_path(r'^restro/restro-img/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'restro' / 'uploads' / 'restro-img')}),
    re_path(r'^uploads/uploads/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'delivery-boy' / 'uploads')}),
    re_path(r'^uploads/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'restro' / 'uploads')}),
    re_path(r'^static/uploads/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'restro' / 'uploads')}),
    re_path(r'^restro/uploads/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'restro' / 'uploads')}),
    re_path(r'^delivery-boy/uploads/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR.parent / 'delivery-boy' / 'uploads')}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR / 'react-app' / 'dist' / 'assets')}),
]

