import os
import random
import datetime
import time
import hashlib
import bcrypt
import re
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.db import connection, transaction
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db.models import Sum, Count, Q
from django.views.decorators.csrf import csrf_exempt

from customer.models import (
    Category, Food, Restro, RestroFoodItem, User,
    OrderManager, Coupon, FestivalCoupon, Review
)
from admin_portal.models import (
    Admin, DeliveryBoy, DeliveryPayment, RestroCategoryNotApproved, EatInPay, ReviewRestro
)
from .decorators import restro_login_required

# React / SPA Helpers
import json
from food_ordering_project.serializers import serialize_value

def is_react_request(request):
    return (
        request.headers.get('X-React-App') == 'true'
        or 'application/json' in request.headers.get('Accept', '')
        or request.GET.get('format') == 'json'
    )

def get_request_data(request):
    if request.content_type == 'application/json':
        try:
            return json.loads(request.body)
        except Exception:
            return {}
    data = {}
    for k, v in request.GET.items():
        data[k] = v
    for k, v in request.POST.items():
        data[k] = v
    return data

# Password validation helpers
def verify_password(password, hashed_password):
    if len(hashed_password) == 32:  # MD5
        return hashlib.md5(password.encode('utf-8')).hexdigest() == hashed_password
    else:  # BCrypt check
        try:
            h = hashed_password
            if h.startswith('$2y$'):
                h = '$2b$' + h[4:]
            return bcrypt.checkpw(password.encode('utf-8'), h.encode('utf-8'))
        except Exception:
            return False

def hash_password(password):
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Custom reset email helper
def send_password_reset_email(to_email, reset_key, account_label='Restaurant'):
    from django.core.mail import EmailMultiAlternatives
    from django.utils.html import escape
    
    subject = f'Pasar-kita {account_label} Reset OTP'
    text_content = f"Your {account_label} reset code is ready\n\nUse the OTP below to continue your password reset. Your password will not change until this code is verified.\n\nYour 6-digit OTP: {reset_key}\n\nEnter the code exactly as shown within 60 seconds. Never share it with anyone.\n\nIgnore this email and your password will stay unchanged.\n"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <body style="margin:0;padding:0;background:#edf3fb;font-family:Arial,sans-serif;color:#14213d;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:34px 18px;background:#edf3fb;">
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
                        <tr>
                            <td style="padding:40px;background:#0f224a;color:#ffffff;text-align:center;">
                                <h1 style="margin:0;font-size:28px;">Your {escape(account_label)} Reset Code</h1>
                                <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);">Secure password recovery code</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:40px;text-align:center;">
                                <p style="font-size:16px;color:#475569;margin-bottom:30px;">Use the OTP below to continue your password reset. Your password will not change until this code is verified.</p>
                                <div style="display:inline-block;padding:15px 30px;background:#f8fbff;border:2px dashed #0f224a;border-radius:10px;font-size:36px;font-weight:bold;letter-spacing:5px;color:#0f224a;">
                                    {escape(reset_key)}
                                </div>
                                <p style="font-size:12px;color:#94a3b8;margin-top:30px;">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [to_email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

# File upload helpers
def handle_restro_file_upload(file, folder_name, prefix=''):
    if not file:
        return ''
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{prefix}{random.randint(1000, 99999)}{ext}"
    upload_dir = settings.BASE_DIR.parent / 'restro' / 'uploads' / folder_name
    os.makedirs(upload_dir, exist_ok=True)
    fs = FileSystemStorage(location=str(upload_dir))
    fs.save(filename, file)
    return filename

def handle_restro_profile_upload(file, type_name):
    if not file:
        return ''
    ext = os.path.splitext(file.name)[1].lower()
    if type_name == 'restro-img':
        prefix = 'restro_'
        folder = 'restro-img'
    else:
        prefix = 'licence_'
        folder = 'licence'
    filename = f"{prefix}{int(time.time())}_{random.randint(1000, 9999)}{ext}"
    upload_dir = settings.BASE_DIR.parent / 'restro' / 'uploads' / folder
    os.makedirs(upload_dir, exist_ok=True)
    fs = FileSystemStorage(location=str(upload_dir))
    fs.save(filename, file)
    return f"uploads/{folder}/{filename}"

# Global notifications helper for templates
def get_global_notifications(restroname):
    ei_count = EatInPay.objects.filter(Q(order_status='Pending') | Q(order_status='Processing') | Q(order_status='OnTheWay')).count()
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(DISTINCT om.order_id)
            FROM order_manager om
            JOIN online_orders_new oon ON om.order_id = oon.order_id
            WHERE (om.order_status='Pending' OR om.order_status='Processing' OR om.order_status='OnTheWay')
              AND oon.restro_name = %s
        """, [restroname])
        online_count = cursor.fetchone()[0] or 0
        
    stock_count = RestroFoodItem.objects.filter(stock__lte=3, restro_name=restroname).count()
    
    initial = 'R'
    if restroname:
        trimmed = restroname.strip()
        if trimmed:
            initial = trimmed[0].upper()

    return {
        'ei_order_notif': ei_count,
        'online_order_notif': online_count,
        'stock_notif': stock_count,
        'total_notif': ei_count + online_count + stock_count,
        'restro_initial': initial
    }

# ================= AUTHENTICATION VIEWS =================

@csrf_exempt
def login_view(request):
    if is_react_request(request):
        if request.session.get('restro-name'):
            return JsonResponse({'status': 'redirect', 'redirect': '/restro/'})
        if request.method == 'POST':
            data = get_request_data(request)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            
            if not username or not password:
                return JsonResponse({'message': "<div class='error-box'>Please fill in all fields.</div>"}, status=400)
            
            restro = Restro.objects.filter(username=username).first()
            if not restro:
                return JsonResponse({'message': "<div class='error-box'>No account found with this username.</div>"}, status=400)
            elif restro.user_role == 0:
                return JsonResponse({'message': "<div class='error-box'>Your account has been blocked by the admin.</div>"}, status=400)
            elif restro.status == 'not_approved':
                return JsonResponse({'message': "<div class='error-box'>Your restro has not been approved.</div>"}, status=400)
            elif restro.status != 'approved':
                return JsonResponse({'message': "<div class='error-box'>Your account is not verified by the admin.</div>"}, status=400)
            elif verify_password(password, restro.password):
                request.session.pop('user', None)
                request.session.pop('user-admin', None)
                request.session.pop('delivery-boy', None)
                request.session['restro-name'] = restro.restro_name
                request.session['login_success'] = "<div class='success'>Logged in successfully</div>"
                return JsonResponse({'status': 'redirect', 'redirect': '/restro/'})
            else:
                return JsonResponse({'message': "<div class='error-box'>Invalid password. Please try again.</div>"}, status=400)
        return JsonResponse({'message': ''})

    if request.session.get('restro-name'):
        return redirect('/restro/')
        
    message = request.session.pop('login_error', '')
    no_login_msg = request.session.pop('no-login-message', '')
    if no_login_msg:
        message = no_login_msg
        
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        
        if not username or not password:
            message = "<div class='error-box'>Please fill in all fields.</div>"
        else:
            restro = Restro.objects.filter(username=username).first()
            if not restro:
                message = "<div class='error-box'>No account found with this username.</div>"
            elif restro.user_role == 0:
                message = "<div class='error-box'>Your account has been blocked by the admin.</div>"
            elif restro.status == 'not_approved':
                message = "<div class='error-box'>Your restro has not been approved.</div>"
            elif restro.status != 'approved':
                message = "<div class='error-box'>Your account is not verified by the admin.</div>"
            elif verify_password(password, restro.password):
                request.session.pop('user', None)
                request.session.pop('user-admin', None)
                request.session.pop('delivery-boy', None)
                request.session['restro-name'] = restro.restro_name
                request.session['login_success'] = "<div class='success'>Logged in successfully</div>"
                return redirect('/restro/')
            else:
                message = "<div class='error-box'>Invalid password. Please try again.</div>"
                
    return render(request, 'restro/login.html', {'message': message})

def logout_view(request):
    request.session.pop('restro-name', None)
    return redirect('/restro/login')

@csrf_exempt
def signup_view(request):
    if request.session.get('restro-name'):
        return redirect('/restro/')
        
    message = ''
    values = {
        'name': '',
        'username': '',
        'email': '',
        'mobile_number': '',
        'address': ''
    }
    
    if request.method == 'POST':
        values['name'] = request.POST.get('name', '').strip()
        values['username'] = request.POST.get('username', '').strip()
        values['email'] = request.POST.get('email', '').strip()
        values['mobile_number'] = request.POST.get('mobile_number', '').strip()
        values['address'] = request.POST.get('address', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        restro_image = request.FILES.get('restro_image')
        licence_image = request.FILES.get('licence_image')
        
        if not all([values['name'], values['username'], values['email'], values['mobile_number'], values['address'], password, confirm_password]):
            message = "<div class='error-box'>Please fill in all fields.</div>"
        elif password != confirm_password:
            message = "<div class='error-box'>Password and confirm password do not match.</div>"
        elif not restro_image:
            message = "<div class='error-box'>Please upload restaurant image.</div>"
        elif not licence_image:
            message = "<div class='error-box'>Please upload license image.</div>"
        else:
            existing = Restro.objects.filter(Q(username=values['username']) | Q(email=values['email'])).exists()
            if existing:
                message = "<div class='error-box'>Username or Email already exists.</div>"
            else:
                restro_file = handle_restro_profile_upload(restro_image, 'restro-img')
                licence_file = handle_restro_profile_upload(licence_image, 'licence')
                
                if not restro_file:
                    message = "<div class='error-box'>Failed to upload restaurant image.</div>"
                elif not licence_file:
                    message = "<div class='error-box'>Failed to upload license image.</div>"
                else:
                    hashed = hash_password(password)
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO tbl_restro (restro_name, username, email, password, mobile_no, restro_address, restro_image, food_licence_image, user_role, status, reset_key)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, [
                            values['name'], values['username'], values['email'], hashed,
                            values['mobile_number'], values['address'], restro_file, licence_file,
                            1, 'not_approved', ''
                        ])
                    return redirect('/restro/login')
                    
    return render(request, 'restro/signup.html', {'message': message, 'values': values})

@csrf_exempt
def forget_view(request):
    message = ''
    showResetKeyField = False
    showPasswordField = False
    
    if request.method == 'POST':
        if 'verify_email' in request.POST:
            request.session.pop('verified_email', None)
            request.session.pop('reset_key', None)
            request.session.pop('reset_key_expires_at', None)
            request.session.pop('reset_verified', None)
            
            email = request.POST.get('email', '').strip()
            restro = Restro.objects.filter(email=email).first()
            
            if not restro:
                message = "<div class='alert-box error-box'>Email not found.</div>"
            else:
                reset_key = str(random.randint(100000, 999999))
                request.session['reset_key'] = reset_key
                request.session['verified_email'] = email
                request.session['reset_key_expires_at'] = int(time.time()) + 600
                
                try:
                    # Update tbl_restro reset_key
                    with connection.cursor() as cursor:
                        cursor.execute("UPDATE tbl_restro SET reset_key = %s WHERE email = %s", [reset_key, email])
                    send_password_reset_email(email, reset_key, 'Restaurant')
                    message = "<div class='alert-box success-box'>Reset key sent to your registered email.</div>"
                    showResetKeyField = True
                except Exception as e:
                    message = f"<div class='alert-box error-box'>Mail failed: {str(e)}</div>"
                    
        elif 'verify_reset_key' in request.POST:
            reset_key = request.POST.get('reset_key', '').strip()
            showResetKeyField = True
            
            sess_key = request.session.get('reset_key')
            sess_email = request.session.get('verified_email')
            sess_expires = request.session.get('reset_key_expires_at', 0)
            
            if not sess_email or not sess_key:
                message = "<div class='alert-box error-box'>Session expired. Verify email again.</div>"
                showResetKeyField = False
            elif int(time.time()) > sess_expires:
                message = "<div class='alert-box error-box'>Reset key expired.</div>"
                showResetKeyField = False
            elif reset_key != sess_key:
                message = "<div class='alert-box error-box'>Reset key does not match.</div>"
            else:
                request.session['reset_verified'] = True
                message = "<div class='alert-box success-box'>Reset key verified. Set new password.</div>"
                showResetKeyField = False
                showPasswordField = True
                
        elif 'update_password' in request.POST:
            new_pwd = request.POST.get('new_password', '').strip()
            confirm_pwd = request.POST.get('confirm_password', '').strip()
            showPasswordField = True
            
            sess_email = request.session.get('verified_email')
            
            if not request.session.get('reset_verified') or not sess_email:
                message = "<div class='alert-box error-box'>Session error. Recover again.</div>"
                showPasswordField = False
            elif not new_pwd:
                message = "<div class='alert-box error-box'>Please enter a password.</div>"
            elif new_pwd != confirm_pwd:
                message = "<div class='alert-box error-box'>Passwords do not match.</div>"
            else:
                hashed = hash_password(new_pwd)
                with connection.cursor() as cursor:
                    cursor.execute("UPDATE tbl_restro SET password = %s, reset_key = %s WHERE email = %s", [hashed, '', sess_email])
                
                request.session.pop('verified_email', None)
                request.session.pop('reset_key', None)
                request.session.pop('reset_key_expires_at', None)
                request.session.pop('reset_verified', None)
                
                request.session['login_error'] = "<div class='alert-box success-box'>Password reset successful. Please login.</div>"
                return redirect('/restro/login')
                
    return render(request, 'restro/forget.html', {
        'message': message,
        'showResetKeyField': showResetKeyField,
        'showPasswordField': showPasswordField
    })

# ================= DASHBOARD & CHARTS =================

@restro_login_required
def index(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    # Revenue
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT SUM(o.total_amount)
            FROM online_orders_new o
            JOIN order_manager om ON o.order_id = om.order_id
            WHERE o.restro_name = %s
              AND om.order_status = 'Delivered'
        """, [restroname])
        total_revenue = cursor.fetchone()[0] or 0.0
        
        # Delivered orders count (excluding cancelled)
        cursor.execute("""
            SELECT COUNT(DISTINCT om.order_id)
            FROM online_orders_new o
            JOIN order_manager om ON o.order_id = om.order_id
            WHERE o.restro_name = %s
              AND om.order_status != 'Cancelled'
        """, [restroname])
        orders_delivered = cursor.fetchone()[0] or 0
        
    categories_count = RestroCategoryNotApproved.objects.filter(restro_name=restroname).count()
    food_count = RestroFoodItem.objects.filter(restro_name=restroname).count()
    
    context = {
        'total_revenue': total_revenue,
        'orders_delivered': orders_delivered,
        'categories_count': categories_count,
        'food_count': food_count,
    }
    context.update(notifs)
    return render(request, 'restro/index.html', context)

@restro_login_required
def dashboard_live_data(request):
    restroname = request.session['restro-name']
    
    categories = RestroCategoryNotApproved.objects.filter(restro_name=restroname).count()
    menu_items = RestroFoodItem.objects.filter(restro_name=restroname).count()
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(DISTINCT om.order_id)
            FROM order_manager om
            INNER JOIN online_orders_new oo ON oo.order_id = om.order_id
            WHERE oo.restro_name = %s AND om.order_status != 'Cancelled'
        """, [restroname])
        orders_completed = cursor.fetchone()[0] or 0
        
        cursor.execute("""
            SELECT COALESCE(SUM(oo.total_amount), 0)
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = %s AND om.order_status = 'Delivered'
        """, [restroname])
        revenue = float(cursor.fetchone()[0] or 0.0)
        
        cursor.execute("""
            SELECT Item_Name, SUM(Quantity) AS total_qty
            FROM online_orders_new
            WHERE restro_name = %s
            GROUP BY Item_Name
            ORDER BY total_qty DESC
            LIMIT 6
        """, [restroname])
        most_sold_rows = cursor.fetchall()
        most_sold_items = [{'item_name': r[0], 'total_qty': int(r[1])} for r in most_sold_rows]
        
        cursor.execute("""
            SELECT DATE(om.order_date) AS order_day, SUM(oo.total_amount) AS total_sales
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = %s
              AND om.order_status != 'Cancelled'
              AND om.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
              AND om.order_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
            GROUP BY DATE(om.order_date)
            ORDER BY DATE(om.order_date)
        """, [restroname])
        sales_by_day_rows = {str(r[0]): float(r[1]) for r in cursor.fetchall()}
        
        cursor.execute("""
            SELECT DATE_FORMAT(om.order_date, '%%Y-%%m') AS month_key,
                   COALESCE(SUM(oo.total_amount), 0) AS total_sales
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = %s
              AND om.order_status = 'Delivered'
              AND om.order_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%%Y-%%m-01')
            GROUP BY DATE_FORMAT(om.order_date, '%%Y-%%m')
            ORDER BY DATE_FORMAT(om.order_date, '%%Y-%%m')
        """, [restroname])
        monthly_revenue_rows = {r[0]: float(r[1]) for r in cursor.fetchall()}
        
        cursor.execute("""
            SELECT DATE_FORMAT(om.order_date, '%%Y-%%m') AS month_key,
                   DATE_FORMAT(om.order_date, '%%b %%Y') AS month_label,
                   COALESCE(SUM(oo.total_amount), 0) AS total_sales
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = %s
              AND om.order_status = 'Delivered'
              AND om.order_date IS NOT NULL
            GROUP BY DATE_FORMAT(om.order_date, '%%Y-%%m')
            ORDER BY DATE_FORMAT(om.order_date, '%%Y-%%m')
        """, [restroname])
        all_time_rows = [{'month': r[1] or r[0] or '-', 'total_revenue': float(r[2])} for r in cursor.fetchall()]

    sales_by_hour = []
    today = datetime.date.today()
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_key = day.strftime('%Y-%m-%d')
        day_label = day.strftime('%d %b')
        sales_by_hour.append({
            'day': day_label,
            'total_sales': sales_by_day_rows.get(day_key, 0.0)
        })
        
    monthly_revenue = []
    current_year = today.year
    current_month = today.month
    for i in range(11, -1, -1):
        m = current_month - i
        y = current_year
        while m <= 0:
            m += 12
            y -= 1
        month_date = datetime.date(y, m, 1)
        month_key = month_date.strftime('%Y-%m')
        month_label = month_date.strftime('%b %Y')
        monthly_revenue.append({
            'month': month_label,
            'total_revenue': monthly_revenue_rows.get(month_key, 0.0)
        })

    notifs = get_global_notifications(restroname)
    res_data = {
        'success': True,
        'timestamp': datetime.datetime.now().isoformat(),
        'kpis': {
            'categories': categories,
            'revenue': revenue,
            'orders_completed': orders_completed,
            'menu_items': menu_items
        },
        'most_sold_items': most_sold_items,
        'sales_by_hour': sales_by_hour,
        'monthly_revenue': monthly_revenue,
        'all_time_monthly_revenue': all_time_rows
    }
    res_data.update(notifs)
    return JsonResponse(res_data)

# ================= CATEGORY MANAGEMENT =================

@restro_login_required
def manage_category(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    categories = RestroCategoryNotApproved.objects.filter(restro_name=restroname).order_by('cid')
    
    if is_react_request(request):
        return JsonResponse({'categories': serialize_value(list(categories))})
        
    # Session messages
    add_msg = request.session.pop('add', '')
    upload_msg = request.session.pop('upload', '')
    update_msg = request.session.pop('update', '')
    no_cat_msg = request.session.pop('no-category-found', '')
    delete_msg = request.session.pop('delete', '')
    
    context = {
        'categories': categories,
        'add_message': add_msg,
        'upload_message': upload_msg,
        'update_message': update_msg,
        'no_category_message': no_cat_msg,
        'delete_message': delete_msg,
    }
    context.update(notifs)
    return render(request, 'restro/manage-category.html', context)

@csrf_exempt
@restro_login_required
def add_category(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    if is_react_request(request):
        if request.method == 'POST':
            title = request.POST.get('title', '').strip()
            featured = request.POST.get('featured', 'No')
            active = request.POST.get('active', 'No')
            image = request.FILES.get('image')
            
            if not title:
                return JsonResponse({'success': False, 'message': 'Title is required'}, status=400)
                
            image_name = ""
            if image:
                image_name = handle_restro_file_upload(image, 'category', 'Food_Category_')
                if not image_name:
                    return JsonResponse({'success': False, 'message': 'Failed to Upload Image'}, status=400)
                    
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO tbl_rcategory_notapproved (title, image_name, featured, active, status, restro_name)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, [title, image_name, featured, active, 'not_approved', restroname])
                
            return JsonResponse({'success': True, 'message': 'Category Added Successfully'})
        return JsonResponse({'success': True})

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        featured = request.POST.get('featured', 'No')
        active = request.POST.get('active', 'No')
        image = request.FILES.get('image')
        
        if not title:
            request.session['add'] = "<div class='error text-center'>Title is required</div>"
            return redirect('/restro/add-category')
            
        image_name = ""
        if image:
            image_name = handle_restro_file_upload(image, 'category', 'Food_Category_')
            if not image_name:
                request.session['upload'] = "<div class='error text-center'>Failed to Upload Image</div>"
                return redirect('/restro/add-category')
                
        # Insert
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO tbl_rcategory_notapproved (title, image_name, featured, active, status, restro_name)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, [title, image_name, featured, active, 'not_approved', restroname])
            
        request.session['add'] = "<div class='success text-center'>Category Added Successfully</div>"
        return redirect('/restro/manage-category')
        
    context = {}
    context.update(notifs)
    return render(request, 'restro/add-category.html', context)

@csrf_exempt
@restro_login_required
def update_category(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    id_val = request.GET.get('id') or request.POST.get('id')
    if not id_val:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'ID is required'}, status=400)
        return redirect('/restro/manage-category')
        
    category = get_object_or_404(RestroCategoryNotApproved, cid=id_val, restro_name=restroname)
    
    if is_react_request(request):
        if request.method == 'POST':
            title = request.POST.get('title', '').strip()
            featured = request.POST.get('featured', 'No')
            active = request.POST.get('active', 'No')
            image = request.FILES.get('image')
            
            if not title:
                return JsonResponse({'success': False, 'message': 'Title is required'}, status=400)
                
            image_name = category.image_name
            if image:
                new_image = handle_restro_file_upload(image, 'category', 'Food_Category_')
                if not new_image:
                    return JsonResponse({'success': False, 'message': 'Failed to Upload Image'}, status=400)
                
                if category.image_name:
                    old_path = settings.BASE_DIR.parent / 'restro' / 'uploads' / 'category' / category.image_name
                    if os.path.exists(old_path):
                        try:
                            os.remove(old_path)
                        except OSError:
                            pass
                image_name = new_image
                
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE tbl_rcategory_notapproved 
                    SET title=%s, image_name=%s, featured=%s, active=%s, status='not_approved'
                    WHERE cid=%s AND restro_name=%s
                """, [title, image_name, featured, active, id_val, restroname])
                
            return JsonResponse({'success': True, 'message': 'Category Updated Successfully. Awaiting Approval.'})
        return JsonResponse({'success': True, 'category': serialize_value(category)})

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        featured = request.POST.get('featured', 'No')
        active = request.POST.get('active', 'No')
        image = request.FILES.get('image')
        
        if not title:
            request.session['update'] = "<div class='error text-center'>Title is required</div>"
            return redirect(f'/restro/update-category?id={id_val}')
            
        image_name = category.image_name
        if image:
            # Upload new image
            new_image = handle_restro_file_upload(image, 'category', 'Food_Category_')
            if not new_image:
                request.session['upload'] = "<div class='error text-center'>Failed to Upload Image</div>"
                return redirect('/restro/manage-category')
            
            # Remove old image
            if category.image_name:
                old_path = settings.BASE_DIR.parent / 'restro' / 'uploads' / 'category' / category.image_name
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except OSError:
                        pass
            image_name = new_image
            
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE tbl_rcategory_notapproved 
                SET title=%s, image_name=%s, featured=%s, active=%s, status='not_approved'
                WHERE cid=%s AND restro_name=%s
            """, [title, image_name, featured, active, id_val, restroname])
            
        request.session['update'] = "<div class='success'>Category Updated Successfully. Awaiting Approval.</div>"
        return redirect('/restro/manage-category')
        
    context = {
        'category': category,
        'title_val': category.title,
        'current_image': category.image_name,
        'featured_val': category.featured,
        'active_val': category.active,
        'id_val': id_val
    }
    context.update(notifs)
    return render(request, 'restro/update-category.html', context)

@restro_login_required
def delete_category(request):
    restroname = request.session['restro-name']
    id_val = request.GET.get('id')
    if is_react_request(request):
        if id_val:
            category = RestroCategoryNotApproved.objects.filter(cid=id_val, restro_name=restroname).first()
            if category:
                if category.image_name:
                    old_path = settings.BASE_DIR.parent / 'restro' / 'uploads' / 'category' / category.image_name
                    if os.path.exists(old_path):
                        try:
                            os.remove(old_path)
                        except OSError:
                            pass
                category.delete()
                return JsonResponse({'success': True, 'message': 'Category Deleted Successfully.'})
            else:
                return JsonResponse({'success': False, 'message': 'Category not found.'}, status=404)
        return JsonResponse({'success': False, 'message': 'ID is required.'}, status=400)

    if id_val:
        category = RestroCategoryNotApproved.objects.filter(cid=id_val, restro_name=restroname).first()
        if category:
            if category.image_name:
                old_path = settings.BASE_DIR.parent / 'restro' / 'uploads' / 'category' / category.image_name
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except OSError:
                        pass
            category.delete()
            request.session['delete'] = "<div class='success'>Category Deleted Successfully.</div>"
        else:
            request.session['no-category-found'] = "<div class='error'>Category not found.</div>"
    return redirect('/restro/manage-category')

@restro_login_required
def manage_food(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    foods = RestroFoodItem.objects.filter(restro_name=restroname).order_by('id')
    
    if is_react_request(request):
        return JsonResponse({'foods': serialize_value(list(foods))})
        
    add_msg = request.session.pop('add', '')
    upload_msg = request.session.pop('upload', '')
    update_msg = request.session.pop('update', '')
    delete_msg = request.session.pop('delete', '')
    unauth_msg = request.session.pop('unauthorized', '')
    
    context = {
        'foods': foods,
        'add_message': add_msg,
        'upload_message': upload_msg,
        'update_message': update_msg,
        'delete_message': delete_msg,
        'unauthorized_message': unauth_msg,
    }
    context.update(notifs)
    return render(request, 'restro/manage-food.html', context)

@csrf_exempt
@restro_login_required
def add_food(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    # Active approved categories for this restro
    categories = RestroCategoryNotApproved.objects.filter(
        active='Yes',
        status__in=['approved', 'not_approved'],
        restro_name__iexact=restroname.strip()
    ).order_by('title')
    
    if is_react_request(request):
        if request.method == 'POST':
            title = request.POST.get('title', '').strip()
            description = request.POST.get('description', '').strip()
            price = request.POST.get('price', '0.0')
            category_id = request.POST.get('category')
            featured = request.POST.get('featured', 'No')
            active = request.POST.get('active', 'No')
            stock = request.POST.get('stock', '0')
            image = request.FILES.get('image')
            
            if not title or not category_id:
                return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)
                
            image_name = ""
            if image:
                image_name = handle_restro_file_upload(image, 'food', 'Food-')
                if not image_name:
                    return JsonResponse({'success': False, 'message': 'Failed to Upload Image'}, status=400)
                    
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO tbl_restro_food_item (title, description, price, image_name, cid, featured, active, stock, restro_name, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [title, description, float(price), image_name, int(category_id), featured, active, int(stock), restroname, 'not_approved'])
                
            return JsonResponse({'success': True, 'message': 'Food Added Successfully'})
        return JsonResponse({'success': True})

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        price = request.POST.get('price', '0.0')
        category_id = request.POST.get('category')
        featured = request.POST.get('featured', 'No')
        active = request.POST.get('active', 'No')
        stock = request.POST.get('stock', '0')
        image = request.FILES.get('image')
        
        if not title or not category_id:
            request.session['add'] = "<div class='error text-center'>Missing required fields</div>"
            return redirect('/restro/add-food')
            
        image_name = ""
        if image:
            image_name = handle_restro_file_upload(image, 'food', 'Food-')
            if not image_name:
                request.session['upload'] = "<div class='error text-center'>Failed to Upload Image</div>"
                return redirect('/restro/add-food')
                
        # Insert raw to avoid Meta managed issues
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO tbl_restro_food_item (title, description, price, image_name, cid, featured, active, stock, restro_name, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, [title, description, float(price), image_name, int(category_id), featured, active, int(stock), restroname, 'not_approved'])
            
        request.session['add'] = "<div class='success text-center'>Food Added Successfully</div>"
        return redirect('/restro/manage-food')
        
    context = {
        'categories': categories
    }
    context.update(notifs)
    return render(request, 'restro/add-food.html', context)

@csrf_exempt
@restro_login_required
def update_food(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    id_val = request.GET.get('id') or request.POST.get('id')
    if not id_val:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'ID is required'}, status=400)
        return redirect('/restro/manage-food')
        
    food = get_object_or_404(RestroFoodItem, id=id_val, restro_name=restroname)
    
    # Active approved categories for this restro
    categories = RestroCategoryNotApproved.objects.filter(
        active='Yes',
        status__in=['approved', 'not_approved'],
        restro_name__iexact=restroname.strip()
    ).order_by('title')
    
    if is_react_request(request):
        if request.method == 'POST':
            title = request.POST.get('title', '').strip()
            description = request.POST.get('description', '').strip()
            price = request.POST.get('price', '0.0')
            category_id = request.POST.get('category')
            featured = request.POST.get('featured', 'No')
            active = request.POST.get('active', 'No')
            stock = request.POST.get('stock', '0')
            image = request.FILES.get('image')
            
            if not title or not category_id:
                return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)
                
            image_name = food.image_name
            if image:
                new_image = handle_restro_file_upload(image, 'food', 'Food-')
                if not new_image:
                    return JsonResponse({'success': False, 'message': 'Failed to Upload Image'}, status=400)
                    
                if food.image_name:
                    paths = [
                        settings.BASE_DIR.parent / 'restro' / 'uploads' / 'food' / food.image_name,
                        settings.BASE_DIR.parent / 'images' / 'food' / food.image_name
                    ]
                    for old_path in paths:
                        if os.path.exists(old_path):
                            try:
                                os.remove(old_path)
                            except OSError:
                                pass
                image_name = new_image
                
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE tbl_restro_food_item 
                    SET title=%s, description=%s, price=%s, image_name=%s, cid=%s, featured=%s, active=%s, stock=%s, status='not_approved'
                    WHERE id=%s AND restro_name=%s
                """, [title, description, float(price), image_name, int(category_id), featured, active, int(stock), id_val, restroname])
                
            return JsonResponse({'success': True, 'message': 'Food Item Updated Successfully. Awaiting Approval.'})
        return JsonResponse({'success': True, 'food': serialize_value(food), 'categories': serialize_value(list(categories))})

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        price = request.POST.get('price', '0.0')
        category_id = request.POST.get('category')
        featured = request.POST.get('featured', 'No')
        active = request.POST.get('active', 'No')
        stock = request.POST.get('stock', '0')
        image = request.FILES.get('image')
        
        if not title or not category_id:
            request.session['update'] = "<div class='error text-center'>Missing required fields</div>"
            return redirect(f'/restro/update-food?id={id_val}')
            
        image_name = food.image_name
        if image:
            # Upload new image
            new_image = handle_restro_file_upload(image, 'food', 'Food-')
            if not new_image:
                request.session['upload'] = "<div class='error text-center'>Failed to Upload Image</div>"
                return redirect('/restro/manage-food')
                
            # Remove old image from both possible places
            if food.image_name:
                paths = [
                    settings.BASE_DIR.parent / 'restro' / 'uploads' / 'food' / food.image_name,
                    settings.BASE_DIR.parent / 'images' / 'food' / food.image_name
                ]
                for old_path in paths:
                    if os.path.exists(old_path):
                        try:
                            os.remove(old_path)
                        except OSError:
                            pass
            image_name = new_image
            
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE tbl_restro_food_item 
                SET title=%s, description=%s, price=%s, image_name=%s, cid=%s, featured=%s, active=%s, stock=%s, status='not_approved'
                WHERE id=%s AND restro_name=%s
            """, [title, description, float(price), image_name, int(category_id), featured, active, int(stock), id_val, restroname])
            
        request.session['update'] = "<div class='success'>Food Item Updated Successfully. Awaiting Approval.</div>"
        return redirect('/restro/manage-food')
        
    context = {
        'food': food,
        'categories': categories,
        'id_val': id_val
    }
    context.update(notifs)
    return render(request, 'restro/update-food.html', context)

@restro_login_required
def delete_food(request):
    restroname = request.session['restro-name']
    id_val = request.GET.get('id')
    if is_react_request(request):
        if not id_val:
            return JsonResponse({'success': False, 'message': 'ID is required'}, status=400)
        food = RestroFoodItem.objects.filter(id=id_val, restro_name=restroname).first()
        if food:
            if food.image_name:
                paths = [
                    settings.BASE_DIR.parent / 'restro' / 'uploads' / 'food' / food.image_name,
                    settings.BASE_DIR.parent / 'images' / 'food' / food.image_name
                ]
                for image_path in paths:
                    if os.path.exists(image_path):
                        try:
                            os.remove(image_path)
                        except OSError:
                            pass
            food.delete()
            return JsonResponse({'success': True, 'message': 'Food Item Deleted Successfully.'})
        return JsonResponse({'success': False, 'message': 'Food item not found or unauthorized.'}, status=404)

    if not id_val:
        request.session['unauthorized'] = "<div class='error'>Unauthorized Access.</div>"
        return redirect('/restro/manage-food')
        
    food = RestroFoodItem.objects.filter(id=id_val, restro_name=restroname).first()
    if food:
        if food.image_name:
            paths = [
                settings.BASE_DIR.parent / 'restro' / 'uploads' / 'food' / food.image_name,
                settings.BASE_DIR.parent / 'images' / 'food' / food.image_name
            ]
            for image_path in paths:
                if os.path.exists(image_path):
                    try:
                        os.remove(image_path)
                    except OSError:
                        pass
        food.delete()
        request.session['delete'] = "<div class='success'>Food Item Deleted Successfully.</div>"
    else:
        request.session['unauthorized'] = "<div class='error'>Food item not found or unauthorized.</div>"
        
    return redirect('/restro/manage-food')

# ================= INVENTORY =================

@restro_login_required
def inventory(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    low_only = request.GET.get('low') == '1'
    page_title = 'Low Stock Items' if low_only else 'Inventory'
    
    foods = RestroFoodItem.objects.filter(restro_name=restroname)
    if low_only:
        foods = foods.filter(stock__lte=3)
        
    foods = foods.order_by('id')
    
    if is_react_request(request):
        return JsonResponse({'foods': serialize_value(list(foods))})
        
    unauth_msg = request.session.pop('unauthorized', '')
    update_msg = request.session.pop('update', '')
    
    context = {
        'foods': foods,
        'page_title': page_title,
        'low_only': low_only,
        'unauthorized_message': unauth_msg,
        'update_message': update_msg,
    }
    context.update(notifs)
    return render(request, 'restro/inventory.html', context)

@csrf_exempt
@restro_login_required
def update_inventory(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    id_val = request.GET.get('id') or request.POST.get('id')
    if not id_val:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'ID is required'}, status=400)
        return redirect('/restro/inventory')
        
    food = get_object_or_404(RestroFoodItem, id=id_val, restro_name=restroname)
    
    if is_react_request(request):
        if request.method == 'POST':
            item_name = request.POST.get('title', '').strip()
            stock = request.POST.get('stock', '0')
            if not item_name or int(stock) < 0:
                return JsonResponse({'success': False, 'message': 'Invalid values supplied.'}, status=400)
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE tbl_restro_food_item SET title = %s, stock = %s WHERE id = %s AND restro_name = %s
                """, [item_name, int(stock), id_val, restroname])
            return JsonResponse({'success': True, 'message': 'Inventory Updated Successfully'})
        return JsonResponse({'success': True, 'food': serialize_value(food)})

    if request.method == 'POST':
        item_name = request.POST.get('title', '').strip()
        stock = request.POST.get('stock', '0')
        
        if not item_name or int(stock) < 0:
            request.session['unauthorized'] = "<div class='error'>Invalid values supplied.</div>"
            return redirect(f'/restro/update-inventory?id={id_val}')
            
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE tbl_restro_food_item SET title = %s, stock = %s WHERE id = %s AND restro_name = %s
            """, [item_name, int(stock), id_val, restroname])
            
        request.session['update'] = "<div class='success'>Inventory Updated Successfully</div>"
        return redirect('/restro/inventory')
        
    context = {
        'food': food,
        'id_val': id_val
    }
    context.update(notifs)
    return render(request, 'restro/update-inventory.html', context)

# ================= ONLINE ORDERS =================

@restro_login_required
def manage_online_order(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    allowed_statuses = ['Pending', 'Processing', 'OnTheWay', 'Delivered', 'Cancelled']
    status_filter = ''
    remaining_only = request.GET.get('remaining') == '1'
    
    req_status = request.GET.get('status', '').strip()
    if req_status in allowed_statuses:
        status_filter = req_status
        
    page_title = 'Online Orders'
    status_sql = ''
    if remaining_only:
        status_sql = " AND om.order_status IN ('Pending','Processing','OnTheWay')"
        page_title = 'New Online Orders'
    elif status_filter:
        status_sql = f" AND om.order_status='{status_filter}'"
        page_title = 'Completed Orders' if status_filter == 'Delivered' else 'Online Orders'
        
    # Query distinct order ids for this restaurant
    orders = []
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT DISTINCT oo.order_id
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = %s {status_sql}
            ORDER BY oo.order_id DESC
        """, [restroname])
        order_ids = [r[0] for r in cursor.fetchall()]
        
        for oid in order_ids:
            # Fetch order details
            cursor.execute("SELECT * FROM order_manager WHERE order_id = %s", [oid])
            desc = cursor.description
            row = cursor.fetchone()
            if not row:
                continue
            order_data = dict(zip([col[0] for col in desc], row))
            
            # Fetch subtotal total_amount for this restro items
            cursor.execute("""
                SELECT SUM(total_amount) 
                FROM online_orders_new 
                WHERE order_id = %s AND restro_name = %s
            """, [oid, restroname])
            subtotal = cursor.fetchone()[0] or 0
            order_data['restro_subtotal'] = subtotal
            
            # Fetch order items for this restro
            cursor.execute("""
                SELECT * 
                FROM online_orders_new 
                WHERE order_id = %s AND restro_name = %s 
                ORDER BY order_id DESC
            """, [oid, restroname])
            items_desc = cursor.description
            items_rows = cursor.fetchall()
            order_data['items'] = [dict(zip([col[0] for col in items_desc], r)) for r in items_rows]
            
            # Latitude & Longitude splitting
            lat, lon = '', ''
            if order_data.get('location'):
                parts = order_data['location'].split(',')
                if len(parts) == 2:
                    lat, lon = parts[0].strip(), parts[1].strip()
            order_data['latitude'] = lat
            order_data['longitude'] = lon
            
            orders.append(order_data)
            
    if is_react_request(request):
        return JsonResponse({'orders': serialize_value(orders)})

    update_msg = request.session.pop('update', '')
    
    context = {
        'orders': orders,
        'page_title': page_title,
        'remaining_only': remaining_only,
        'status_filter': status_filter,
        'update_message': update_msg,
    }
    context.update(notifs)
    return render(request, 'restro/manage-online-order.html', context)

@csrf_exempt
@restro_login_required
def update_online_order(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    id_val = request.GET.get('id') or request.POST.get('id')
    if not id_val:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'ID is required'}, status=400)
        return redirect('/restro/manage-online-order')
        
    # Verify order contains items from this restaurant
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM online_orders_new WHERE order_id = %s AND restro_name = %s", [id_val, restroname])
        exists = cursor.fetchone()[0] > 0
        
    if not exists:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'Order not found or unauthorized'}, status=404)
        return redirect('/restro/manage-online-order')
        
    # Get order manager details
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM order_manager WHERE order_id = %s", [id_val])
        desc = cursor.description
        row = cursor.fetchone()
        order = dict(zip([col[0] for col in desc], row)) if row else None
        
    if not order:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'Order not found'}, status=404)
        return redirect('/restro/manage-online-order')
        
    if is_react_request(request):
        if request.method == 'POST':
            data = get_request_data(request)
            order_status = data.get('order_status')
            if order_status in ['Pending', 'Processing', 'Cancelled', 'OnTheWay', 'Delivered']:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE order_manager SET order_status = %s WHERE order_id = %s
                    """, [order_status, id_val])
                return JsonResponse({'success': True, 'message': 'Order Updated Successfully'})
            else:
                return JsonResponse({'success': False, 'message': 'Invalid status'}, status=400)
        return JsonResponse({'success': True, 'order': serialize_value(order)})

    if request.method == 'POST':
        order_status = request.POST.get('order_status')
        if order_status in ['Pending', 'Processing', 'Cancelled']:
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE order_manager SET order_status = %s WHERE order_id = %s
                """, [order_status, id_val])
            request.session['update'] = "<div class='success'>Order Updated Successfully</div>"
        else:
            request.session['update'] = "<div class='error'>Failed to Update Order. Invalid status.</div>"
            
        return redirect('/restro/manage-online-order')
        
    context = {
        'order': order,
        'id_val': id_val
    }
    context.update(notifs)
    return render(request, 'restro/update-online-order.html', context)

# ================= REPEAT RATE =================

@restro_login_required
def manage_repeat_rate(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    customer_orders = {}
    total_orders = 0
    
    # Raw SQL query to group by customer username and count orders for this restro
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT om.username, COUNT(om.username) AS order_count
            FROM order_manager om 
            JOIN online_orders_new o ON om.order_id = o.order_id 
            WHERE o.restro_name = %s 
              AND om.order_status = 'Delivered'
            GROUP BY om.username
        """, [restroname])
        rows = cursor.fetchall()
        
    for username, count in rows:
        customer_orders[username] = count
        total_orders += count
        
    repeat_rates = []
    total_repeat_rate = 0.0
    total_customers = len(customer_orders)
    
    for username, count in customer_orders.items():
        rate = (count / total_orders * 100.0) if total_orders > 0 else 0.0
        repeat_rates.append({
            'username': username,
            'count': count,
            'rate': round(rate, 2)
        })
        total_repeat_rate += rate
        
    overall_repeat_rate = round(total_repeat_rate / total_customers, 2) if total_customers > 0 else 0.0
    
    if is_react_request(request):
        return JsonResponse({
            'repeat_rates': repeat_rates,
            'overall_repeat_rate': overall_repeat_rate
        })

    context = {
        'repeat_rates': repeat_rates,
        'overall_repeat_rate': overall_repeat_rate
    }
    context.update(notifs)
    return render(request, 'restro/manage-repeat-rate.html', context)

# ================= CUSTOMER REVIEWS =================

@restro_login_required
def manage_review(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    reviews = ReviewRestro.objects.filter(restro_name=restroname).order_by('-id')
    
    # Rating stats
    ratings = [0, 0, 0, 0, 0]
    total_rating = 0
    total_reviews = 0
    
    for review in reviews:
        if review.rating_star and 1 <= review.rating_star <= 5:
            ratings[review.rating_star - 1] += 1
            total_rating += review.rating_star
            total_reviews += 1
            
    # Quick stars generator helper for templates
    for r in reviews:
        r.stars_html = '★' * (r.rating_star or 0) + '☆' * (5 - (r.rating_star or 0))
        
    if is_react_request(request):
        return JsonResponse({'reviews': serialize_value(list(reviews))})

    context = {
        'reviews': reviews,
    }
    context.update(notifs)
    return render(request, 'restro/manage-review.html', context)

# ================= SETTINGS & PROFILE =================

@csrf_exempt
@restro_login_required
def settings_view(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    profile = Restro.objects.filter(restro_name=restroname).first()
    if not profile:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'Profile not found'}, status=404)
        return redirect('/restro/')
        
    if is_react_request(request) and request.method == 'GET':
        return JsonResponse({
            'current_name': profile.restro_name if profile else restroname,
            'current_image': profile.restro_image if profile else '',
            'current_licence_image': profile.food_licence_image if profile else ''
        })

    success_message = ''
    error_message = ''
    
    if request.method == 'POST':
        new_name = request.POST.get('restro_name', '').strip()
        current_image = request.POST.get('current_image', '').strip()
        current_licence_image = request.POST.get('current_licence_image', '').strip()
        
        new_image_path = current_image
        new_licence_image_path = current_licence_image
        
        if not new_name:
            error_message = 'Restaurant name is required.'
            if is_react_request(request):
                return JsonResponse({'success': False, 'message': error_message}, status=400)
        else:
            restro_image = request.FILES.get('restro_image')
            food_licence_image = request.FILES.get('food_licence_image')
            
            # Check validation
            allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if restro_image and restro_image.content_type not in allowed:
                error_message = 'Only JPG, JPEG, PNG, and WEBP images are allowed for Restaurant Logo.'
                if is_react_request(request):
                    return JsonResponse({'success': False, 'message': error_message}, status=400)
            elif food_licence_image and food_licence_image.content_type not in allowed:
                error_message = 'Only JPG, JPEG, PNG, and WEBP images are allowed for Food Licence.'
                if is_react_request(request):
                    return JsonResponse({'success': False, 'message': error_message}, status=400)
            else:
                if restro_image:
                    new_img = handle_restro_profile_upload(restro_image, 'restro-img')
                    if new_img:
                        new_image_path = new_img
                if food_licence_image:
                    new_lic = handle_restro_profile_upload(food_licence_image, 'licence')
                    if new_lic:
                        new_licence_image_path = new_lic
                        
                # Database update transaction
                try:
                    with transaction.atomic():
                        # Update tbl_restro
                        with connection.cursor() as cursor:
                            cursor.execute("""
                                UPDATE tbl_restro SET restro_name=%s, restro_image=%s, food_licence_image=%s WHERE restro_name=%s
                            """, [new_name, new_image_path, new_licence_image_path, restroname])
                            
                            # Update food items
                            cursor.execute("UPDATE tbl_restro_food_item SET restro_name=%s WHERE restro_name=%s", [new_name, restroname])
                            # Update categories
                            cursor.execute("UPDATE tbl_rcategory_notapproved SET restro_name=%s WHERE restro_name=%s", [new_name, restroname])
                            # Update orders
                            cursor.execute("UPDATE online_orders_new SET restro_name=%s WHERE restro_name=%s", [new_name, restroname])
                            
                    request.session['restro-name'] = new_name
                    restroname = new_name
                    success_message = 'Settings updated successfully.'
                    if is_react_request(request):
                        return JsonResponse({'success': True, 'message': success_message})
                    profile = Restro.objects.filter(restro_name=restroname).first()
                except Exception:
                    error_message = 'Unable to update settings. Please try again.'
                    if is_react_request(request):
                        return JsonResponse({'success': False, 'message': error_message}, status=400)
                    
    context = {
        'profile': profile,
        'current_name': profile.restro_name if profile else restroname,
        'current_image': profile.restro_image if profile else '',
        'current_licence_image': profile.food_licence_image if profile else '',
        'success_message': success_message,
        'error_message': error_message,
    }
    context.update(notifs)
    return render(request, 'restro/settings.html', context)

@csrf_exempt
@restro_login_required
def update_password_view(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    success_message = ''
    error_message = ''
    
    if request.method == 'POST':
        # Support both standard form POST and json/multipart REST API POST
        data = get_request_data(request)
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')
        
        restro = Restro.objects.filter(restro_name=restroname).first()
        
        if not current_password or not new_password or not confirm_password:
            error_message = 'All fields are required.'
        elif not restro or not verify_password(current_password, restro.password):
            error_message = 'Current password is incorrect.'
        elif new_password != confirm_password:
            error_message = 'New password and confirm password do not match.'
        elif not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$', new_password):
            error_message = 'Password must be 8+ chars with uppercase, lowercase, number and special character.'
        else:
            hashed = hash_password(new_password)
            with connection.cursor() as cursor:
                cursor.execute("UPDATE tbl_restro SET password=%s WHERE restro_name=%s", [hashed, restroname])
            success_message = 'Password changed successfully.'
            if is_react_request(request):
                return JsonResponse({'success_message': success_message})
            
        if is_react_request(request) and error_message:
            return JsonResponse({'error_message': error_message, 'message': error_message}, status=400)
            
    context = {
        'success_message': success_message,
        'error_message': error_message
    }
    context.update(notifs)
    return render(request, 'restro/update-password.html', context)

# ================= MONTHLY REVENUE =================

@restro_login_required
def monthly_revenue(request):
    restroname = request.session['restro-name']
    notifs = get_global_notifications(restroname)
    
    import datetime
    today = datetime.date.today()
    
    # Calculate month start date (11 months ago, first day of that month)
    # in python:
    current_year = today.year
    current_month = today.month
    
    # Get the date 11 months ago
    m = current_month - 11
    y = current_year
    while m <= 0:
        m += 12
        y -= 1
    month_start_date = datetime.date(y, m, 1).strftime('%Y-%m-%d')
    
    # Initialize dictionary for 12 months totals
    month_totals = {}
    for i in range(11, -1, -1):
        m = current_month - i
        y = current_year
        while m <= 0:
            m += 12
            y -= 1
        month_date = datetime.date(y, m, 1)
        key = month_date.strftime('%Y-%m')
        month_totals[key] = {
            'label': month_date.strftime('%b %Y'),
            'total': 0.0,
            'orders': 0
        }
        
    # Query monthly revenue for last 12 months
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT DATE_FORMAT(om.order_date, '%%Y-%%m') AS month_key,
                   COALESCE(SUM(oo.total_amount), 0) AS total_amount,
                   COUNT(DISTINCT om.order_id) AS orders
             FROM online_orders_new oo
             INNER JOIN order_manager om ON oo.order_id = om.order_id
             WHERE oo.restro_name = %s
               AND om.order_status = 'Delivered'
               AND om.order_date >= %s
             GROUP BY DATE_FORMAT(om.order_date, '%%Y-%%m')
             ORDER BY DATE_FORMAT(om.order_date, '%%Y-%%m')
        """, [restroname, month_start_date])
        rows = cursor.fetchall()
        
    for key, total, orders in rows:
        if key in month_totals:
            month_totals[key]['total'] = float(total)
            month_totals[key]['orders'] = int(orders)
            
    # Query all-time monthly revenue
    all_time_rows = []
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT DATE_FORMAT(om.order_date, '%%Y-%%m') AS month_key,
                   DATE_FORMAT(om.order_date, '%%b %%Y') AS month_label,
                   COALESCE(SUM(oo.total_amount), 0) AS total_amount,
                   COUNT(DISTINCT om.order_id) AS orders
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = %s
              AND om.order_status = 'Delivered'
              AND om.order_date IS NOT NULL
            GROUP BY DATE_FORMAT(om.order_date, '%%Y-%%m')
            ORDER BY DATE_FORMAT(om.order_date, '%%Y-%%m')
        """, [restroname])
        all_rows = cursor.fetchall()
        
    for key, label, total, orders in all_rows:
        all_time_rows.append({
            'label': label or key or '-',
            'total': float(total),
            'orders': int(orders)
        })
        
    # Computations
    current_month_key = today.strftime('%Y-%m')
    current_month_total = month_totals.get(current_month_key, {}).get('total', 0.0)
    current_month_orders = month_totals.get(current_month_key, {}).get('orders', 0)
    
    last12_total = 0.0
    last12_orders = 0
    for row in month_totals.values():
        last12_total += row['total']
        last12_orders += row['orders']
    average_monthly = last12_total / 12.0
    
    all_time_total = sum(r['total'] for r in all_time_rows)
    all_time_orders = sum(r['orders'] for r in all_time_rows)
    
    # Sort month_totals keys descending for list/table rendering
    sorted_month_totals = [month_totals[k] for k in sorted(month_totals.keys(), reverse=True)]
    
    if is_react_request(request):
        return JsonResponse({
            'sorted_month_totals': sorted_month_totals,
            'all_time_rows': all_time_rows,
            'all_time_total': all_time_total,
            'all_time_orders': all_time_orders,
            'last12_total': last12_total,
            'last12_orders': last12_orders,
            'current_month_total': current_month_total,
            'current_month_orders': current_month_orders,
            'average_monthly': average_monthly,
            'current_month_label': today.strftime('%B %Y')
        })

    # Format charts JSON
    import json
    monthly_chart_rows = [['Month', 'Revenue']]
    for row in month_totals.values():
        monthly_chart_rows.append([row['label'], row['total']])
    monthly_chart_json = json.dumps(monthly_chart_rows)
    
    all_time_chart_rows = [['Month', 'Revenue']]
    for row in all_time_rows:
        all_time_chart_rows.append([row['label'], row['total']])
    all_time_chart_json = json.dumps(all_time_chart_rows)
    
    context = {
        'all_time_total': all_time_total,
        'all_time_orders': all_time_orders,
        'last12_total': last12_total,
        'last12_orders': last12_orders,
        'current_month_total': current_month_total,
        'current_month_orders': current_month_orders,
        'average_monthly': average_monthly,
        'monthly_chart_json': monthly_chart_json,
        'all_time_chart_json': all_time_chart_json,
        'month_totals': sorted_month_totals,
        'current_month_label': today.strftime('%B %Y')
    }
    context.update(notifs)
    return render(request, 'restro/monthly-revenue.html', context)
