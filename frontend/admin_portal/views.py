import os
import random
import datetime
import time
import hashlib
import bcrypt
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.db import connection, transaction
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db.models import Sum, Count, Q
from django.views.decorators.csrf import csrf_exempt

from customer.models import (
    Category, Food, Restro, RestroFoodItem, User,
    OrderManager, Coupon, FestivalCoupon, Review, ContactMessage
)
from .models import (
    Admin, DeliveryBoy, DeliveryPayment, RestroCategoryNotApproved, EatInPay, ReviewRestro
)
from .decorators import admin_login_required

# React / SPA Helpers
import json

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

# Custom send reset email helper
def send_password_reset_email(to_email, reset_key, account_label='Admin'):
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

# Image helper
def handle_image_upload(file, prefix='Food-Name-', default=''):
    if not file:
        return default
    ext = os.path.splitext(file.name)[1]
    filename = f"{prefix}{random.randint(1000, 99999)}{ext}"
    fs = FileSystemStorage(location=settings.MEDIA_ROOT)
    fs.save(filename, file)
    return filename

# Global notifications helper
def get_global_notifications():
    ei_count = EatInPay.objects.filter(Q(order_status='Pending') | Q(order_status='Processing') | Q(order_status='OnTheWay')).count()
    
    # Online orders from Pasar Kita
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(DISTINCT om.order_id)
            FROM order_manager om
            JOIN online_orders_new oon ON om.order_id = oon.order_id
            WHERE (om.order_status='Pending' OR om.order_status='Processing' OR om.order_status='OnTheWay')
            AND oon.restro_name='Pasar Kita'
        """)
        online_count = cursor.fetchone()[0]
        
    stock_count = Food.objects.filter(stock__lte=3).count()
    unread_msg = ContactMessage.objects.filter(message_status='unread').count()
    
    return {
        'ei_order_notif': ei_count,
        'online_order_notif': online_count,
        'stock_notif': stock_count,
        'message_notif': unread_msg,
        'total_notif': ei_count + online_count + stock_count
    }

# ================= AUTHENTICATION VIEWS =================

@csrf_exempt
def login_view(request):
    if is_react_request(request):
        if request.session.get('user-admin'):
            return JsonResponse({'status': 'redirect', 'redirect': '/admin/'})
        if request.method == 'POST':
            data = get_request_data(request)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            
            admin = Admin.objects.filter(username=username).first()
            if admin and verify_password(password, admin.password):
                request.session['user-admin'] = username
                request.session['login_success'] = "<div class='success'>Logged in successfully</div>"
                return JsonResponse({'status': 'redirect', 'redirect': '/admin/'})
            else:
                return JsonResponse({'message': "<div class='error-box'>Username or password is incorrect.</div>"}, status=400)
        return JsonResponse({'message': ''})

    if request.session.get('user-admin'):
        return redirect('/admin/')
        
    message = request.session.pop('login_error', '')
    no_login_msg = request.session.pop('no-login-message', '')
    if no_login_msg:
        message = no_login_msg
        
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        
        admin = Admin.objects.filter(username=username).first()
        if admin and verify_password(password, admin.password):
            request.session['user-admin'] = username
            request.session['login_success'] = "<div class='success'>Logged in successfully</div>"
            return redirect('/admin/')
        else:
            message = "<div class='error-box'>Username or password is incorrect.</div>"
            
    return render(request, 'admin/login.html', {'message': message})

def login_check(request):
    if not request.session.get('user-admin'):
        if is_react_request(request):
            return JsonResponse({'status': 'redirect', 'redirect': '/admin/login'}, status=401)
        return redirect('/admin/login')
    if is_react_request(request):
        return JsonResponse({'status': 'redirect', 'redirect': '/admin/'})
    return redirect('/admin/')

def logout_view(request):
    request.session.flush()
    if is_react_request(request):
        return JsonResponse({'status': 'redirect', 'redirect': '/admin/login'})
    return redirect('/admin/login')

@csrf_exempt
def signup_view(request):
    if is_react_request(request):
        if request.session.get('user-admin'):
            return JsonResponse({'status': 'redirect', 'redirect': '/admin/'})
        if request.method == 'POST':
            data = get_request_data(request)
            full_name = data.get('full_name', '').strip()
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            confirm_password = data.get('confirm_password', '')
            
            if not all([full_name, username, email, password, confirm_password]):
                return JsonResponse({'message': "<div class='error-box'>Please fill in all fields.</div>"}, status=400)
            elif password != confirm_password:
                return JsonResponse({'message': "<div class='error-box'>Password and confirm password do not match.</div>"}, status=400)
            else:
                existing = Admin.objects.filter(Q(username=username) | Q(email=email)).exists()
                if existing:
                    return JsonResponse({'message': "<div class='error-box'>Username or Email already exists.</div>"}, status=400)
                else:
                    hashed = hash_password(password)
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "INSERT INTO tbl_admin (full_name, email, username, password) VALUES (%s, %s, %s, %s)",
                            [full_name, email, username, hashed]
                        )
                    return JsonResponse({'status': 'redirect', 'redirect': '/admin/login'})
        return JsonResponse({'message': ''})

    if request.session.get('user-admin'):
        return redirect('/admin/')
        
    message = ''
    values = {'full_name': '', 'username': '', 'email': ''}
    
    if request.method == 'POST':
        values['full_name'] = request.POST.get('full_name', '').strip()
        values['username'] = request.POST.get('username', '').strip()
        values['email'] = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        if not all([values['full_name'], values['username'], values['email'], password, confirm_password]):
            message = "<div class='error-box'>Please fill in all fields.</div>"
        elif password != confirm_password:
            message = "<div class='error-box'>Password and confirm password do not match.</div>"
        else:
            existing = Admin.objects.filter(Q(username=values['username']) | Q(email=values['email'])).exists()
            if existing:
                message = "<div class='error-box'>Username or Email already exists.</div>"
            else:
                hashed = hash_password(password)
                with connection.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO tbl_admin (full_name, email, username, password) VALUES (%s, %s, %s, %s)",
                        [values['full_name'], values['email'], values['username'], hashed]
                    )
                return redirect('/admin/login')
                
    return render(request, 'admin/signup.html', {'message': message, 'values': values})

@csrf_exempt
def forget_view(request):
    if is_react_request(request):
        data = get_request_data(request)
        if request.method == 'POST':
            if 'verify_email' in data:
                request.session.pop('verified_email', None)
                request.session.pop('reset_key', None)
                request.session.pop('reset_key_expires_at', None)
                request.session.pop('reset_verified', None)
                
                email = data.get('email', '').strip()
                admin = Admin.objects.filter(email=email).first()
                
                if not admin:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Email not found.</div>"}, status=400)
                else:
                    reset_key = str(random.randint(100000, 999999))
                    request.session['reset_key'] = reset_key
                    request.session['verified_email'] = email
                    request.session['reset_key_expires_at'] = int(time.time()) + 600
                    
                    try:
                        send_password_reset_email(email, reset_key, 'Admin')
                        return JsonResponse({
                            'message': "<div class='alert-box success-box'>Reset key sent to your registered email.</div>",
                            'showResetKeyField': True
                        })
                    except Exception as e:
                        return JsonResponse({'message': f"<div class='alert-box error-box'>Mail failed: {str(e)}</div>"}, status=500)
                        
            elif 'verify_reset_key' in data:
                reset_key = data.get('reset_key', '').strip()
                sess_key = request.session.get('reset_key')
                sess_email = request.session.get('verified_email')
                sess_expires = request.session.get('reset_key_expires_at', 0)
                
                if not sess_email or not sess_key:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Session expired. Verify email again.</div>"}, status=400)
                elif int(time.time()) > sess_expires:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Reset key expired.</div>"}, status=400)
                elif reset_key != sess_key:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Reset key does not match.</div>"}, status=400)
                else:
                    request.session['reset_verified'] = True
                    return JsonResponse({
                        'message': "<div class='alert-box success-box'>Reset key verified. Set new password.</div>",
                        'showPasswordField': True
                    })
                    
            elif 'update_password' in data:
                new_pwd = data.get('new_password', '').strip()
                confirm_pwd = data.get('confirm_password', '').strip()
                
                sess_email = request.session.get('verified_email')
                sess_verified = request.session.get('reset_verified')
                sess_expires = request.session.get('reset_key_expires_at', 0)
                
                if not sess_email or not sess_verified:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Session error. Start again.</div>"}, status=400)
                elif int(time.time()) > sess_expires:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Session expired.</div>"}, status=400)
                elif new_pwd != confirm_pwd:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Passwords do not match.</div>"}, status=400)
                else:
                    hashed = hash_password(new_pwd)
                    with connection.cursor() as cursor:
                        cursor.execute("UPDATE tbl_admin SET password = %s WHERE email = %s", [hashed, sess_email])
                    request.session.pop('verified_email', None)
                    request.session.pop('reset_key', None)
                    request.session.pop('reset_key_expires_at', None)
                    request.session.pop('reset_verified', None)
                    return JsonResponse({
                        'status': 'redirect',
                        'redirect': '/admin/login',
                        'message': "<div class='alert-box success-box'>Password updated successfully.</div>"
                    })
        return JsonResponse({'message': ''})

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
            admin = Admin.objects.filter(email=email).first()
            
            if not admin:
                message = "<div class='alert-box error-box'>Email not found.</div>"
            else:
                reset_key = str(random.randint(100000, 999999))
                request.session['reset_key'] = reset_key
                request.session['verified_email'] = email
                request.session['reset_key_expires_at'] = int(time.time()) + 600
                
                try:
                    send_password_reset_email(email, reset_key, 'Admin')
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
            sess_verified = request.session.get('reset_verified')
            sess_expires = request.session.get('reset_key_expires_at', 0)
            
            if not sess_email or not sess_verified:
                message = "<div class='alert-box error-box'>Session error. Start again.</div>"
                showPasswordField = False
            elif int(time.time()) > sess_expires:
                message = "<div class='alert-box error-box'>Session expired.</div>"
                showPasswordField = False
            elif new_pwd != confirm_pwd:
                message = "<div class='alert-box error-box'>Passwords do not match.</div>"
            else:
                hashed = hash_password(new_pwd)
                with connection.cursor() as cursor:
                    cursor.execute("UPDATE tbl_admin SET password = %s WHERE email = %s", [hashed, sess_email])
                message = "<div class='alert-box success-box'>Password updated successfully. <a href='login.php'>Log in</a>.</div>"
                request.session.pop('verified_email', None)
                request.session.pop('reset_key', None)
                request.session.pop('reset_key_expires_at', None)
                request.session.pop('reset_verified', None)
                showPasswordField = False
                
    return render(request, 'admin/forget.html', {
        'message': message,
        'showResetKeyField': showResetKeyField,
        'showPasswordField': showPasswordField
    })

# ================= DASHBOARD & CHARTS =================

import time

@admin_login_required
def index(request):
    notifs = get_global_notifications()
    
    # Total revenue
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT SUM(o.total_amount) AS total_amount 
            FROM online_orders_new o
            JOIN order_manager om ON o.order_id = om.order_id
            WHERE o.restro_name = 'Pasar Kita'
            AND om.order_status = 'Delivered'
        """)
        revenue_row = cursor.fetchone()
        total_revenue = float(revenue_row[0] or 0)
        
        # Delivered count
        cursor.execute("""
            SELECT COUNT(*) 
            FROM online_orders_new o
            JOIN order_manager om ON o.order_id = om.order_id
            WHERE o.restro_name = 'Pasar Kita' 
            AND om.order_status != 'Cancelled'
        """)
        delivered_count = cursor.fetchone()[0]

    categories_count = Category.objects.count()
    items_count = Food.objects.count()
    
    admin_name = request.session.get('user-admin', 'Admin')
    admin_initial = admin_name[0].upper() if admin_name else 'A'
    
    context = {
        **notifs,
        'row_cat': categories_count,
        'row_item': items_count,
        'total_revenue': total_revenue,
        'total_orders_delivered': delivered_count,
        'admin_name': admin_name,
        'admin_initial': admin_initial,
        'login_success': request.session.pop('login_success', ''),
    }
    return render(request, 'admin/index.html', context)

@admin_login_required
def dashboard_live_data(request):
    # Returns KPI and Chart data JSON
    # Category, Menu Items, Delivered count, Revenue
    categories = Category.objects.count()
    menu_items = Food.objects.count()
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(DISTINCT om.order_id)
            FROM order_manager om
            INNER JOIN online_orders_new oo ON oo.order_id = om.order_id
            WHERE oo.restro_name = 'Pasar Kita' AND om.order_status != 'Cancelled'
        """)
        orders_completed = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT SUM(oo.total_amount)
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = 'Pasar Kita' AND om.order_status = 'Delivered'
        """)
        revenue = float(cursor.fetchone()[0] or 0)
        
        # Most sold
        cursor.execute("""
            SELECT Item_Name, SUM(Quantity) AS total_qty
            FROM online_orders_new
            WHERE restro_name = 'Pasar Kita'
            GROUP BY Item_Name
            ORDER BY total_qty DESC
            LIMIT 6
        """)
        most_sold_rows = cursor.fetchall()
        most_sold = [{'item_name': r[0], 'total_qty': int(r[1])} for r in most_sold_rows]
        
        # Sales last 7 days
        sales_by_hour = []
        today = datetime.date.today()
        for i in range(6, -1, -1):
            day = today - datetime.timedelta(days=i)
            cursor.execute("""
                SELECT SUM(oo.total_amount)
                FROM online_orders_new oo
                INNER JOIN order_manager om ON oo.order_id = om.order_id
                WHERE oo.restro_name = 'Pasar Kita'
                  AND om.order_status != 'Cancelled'
                  AND DATE(om.order_date) = %s
            """, [day.strftime('%Y-%m-%d')])
            day_sales = float(cursor.fetchone()[0] or 0)
            sales_by_hour.append({
                'day': day.strftime('%d %b'),
                'total_sales': day_sales
            })
            
        # Monthly Revenue (last 12 months)
        monthly_revenue = []
        for i in range(11, -1, -1):
            # calculate year and month
            m_date = today - datetime.timedelta(days=i*30) # approx
            first_day = m_date.replace(day=1)
            cursor.execute("""
                SELECT SUM(oo.total_amount)
                FROM online_orders_new oo
                INNER JOIN order_manager om ON oo.order_id = om.order_id
                WHERE oo.restro_name = 'Pasar Kita'
                  AND om.order_status = 'Delivered'
                  AND om.order_date >= %s AND om.order_date < DATE_ADD(%s, INTERVAL 1 MONTH)
            """, [first_day.strftime('%Y-%m-01'), first_day.strftime('%Y-%m-01')])
            m_sales = float(cursor.fetchone()[0] or 0)
            monthly_revenue.append({
                'month': first_day.strftime('%b %Y'),
                'total_revenue': m_sales
            })
            
        # All time monthly revenue
        cursor.execute("""
            SELECT DATE_FORMAT(om.order_date, '%b %Y') AS label,
                   SUM(oo.total_amount) AS total
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = 'Pasar Kita'
              AND om.order_status = 'Delivered'
            GROUP BY DATE_FORMAT(om.order_date, '%Y-%m')
            ORDER BY DATE_FORMAT(om.order_date, '%Y-%m')
        """)
        all_time_rows = cursor.fetchall()
        all_time = [{'month': r[0] or '-', 'total_revenue': float(r[1] or 0)} for r in all_time_rows]

    return JsonResponse({
        'success': True,
        'timestamp': datetime.datetime.now().isoformat(),
        'kpis': {
            'categories': categories,
            'revenue': revenue,
            'orders_completed': orders_completed,
            'menu_items': menu_items
        },
        'most_sold_items': most_sold,
        'sales_by_hour': sales_by_hour,
        'monthly_revenue': monthly_revenue,
        'all_time_monthly_revenue': all_time,
        'notifications': get_global_notifications()
    })

# ================= ADMINS MANAGEMENT =================

@admin_login_required
def manage_admin(request):
    notifs = get_global_notifications()
    admins = Admin.objects.all().order_by('id')
    
    add_msg = request.session.pop('add', '')
    del_msg = request.session.pop('delete', '')
    up_msg = request.session.pop('update', '')
    pwd_msg = request.session.pop('user-not-found', '')
    
    context = {
        **notifs,
        'admins': admins,
        'add_msg': add_msg,
        'del_msg': del_msg,
        'up_msg': up_msg,
        'pwd_msg': pwd_msg
    }
    return render(request, 'admin/manage-admin.html', context)

@csrf_exempt
@admin_login_required
def add_admin(request):
    if request.method == 'POST':
        data = get_request_data(request)
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if Admin.objects.filter(username=username).exists():
            if is_react_request(request):
                return JsonResponse({'success': False, 'message': 'Username already exists'}, status=400)
            return HttpResponse("exists")
            
        hashed = hash_password(password)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_admin (full_name, email, username, password) VALUES (%s, %s, %s, %s)",
                [full_name, email, username, hashed]
            )
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Admin Added Successfully'})
        request.session['add'] = "<div class='success'>Admin Added Successfully</div>"
        return HttpResponse("success")
        
    if is_react_request(request):
        return JsonResponse({'success': True})
    notifs = get_global_notifications()
    return render(request, 'admin/add-admin.html', {**notifs})

@csrf_exempt
def add_admin_handler(request):
    if request.method == 'POST':
        data = get_request_data(request)
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if Admin.objects.filter(username=username).exists():
            return HttpResponse("exists")
            
        hashed = hash_password(password)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_admin (full_name, email, username, password) VALUES (%s, %s, %s, %s)",
                [full_name, email, username, hashed]
            )
        request.session['add'] = "<div class='success'>Admin Added Successfully</div>"
        return HttpResponse("success")
        
    return HttpResponse("error")

@csrf_exempt
@admin_login_required
def update_admin(request):
    admin_id = request.POST.get('id') or request.GET.get('id')
    admin = get_object_or_404(Admin, id=admin_id)
    
    if request.method == 'POST':
        data = get_request_data(request)
        admin.full_name = data.get('full_name', admin.full_name).strip()
        admin.email = data.get('email', admin.email).strip()
        admin.username = data.get('username', admin.username).strip()
        admin.save()
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Admin Updated Successfully'})
        request.session['update'] = "<div class='success'>Admin Updated Successfully</div>"
        return redirect('/admin/manage-admin')
        
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'admin': serialize_value(admin)})
    notifs = get_global_notifications()
    return render(request, 'admin/update-admin.html', {**notifs, 'admin': admin})

@csrf_exempt
@admin_login_required
def update_password(request):
    admin_id = request.POST.get('id') or request.GET.get('id')
    admin = get_object_or_404(Admin, id=admin_id)
    message = ''
    
    if request.method == 'POST':
        data = get_request_data(request)
        current_pwd = data.get('current_password', '')
        new_pwd = data.get('new_password', '')
        confirm_pwd = data.get('confirm_password', '')
        
        if not verify_password(current_pwd, admin.password):
            err = "Current Password is incorrect"
            if is_react_request(request):
                return JsonResponse({'success': False, 'message': err}, status=400)
            message = f"<div class='error'>{err}</div>"
        elif new_pwd != confirm_pwd:
            err = "New Password and Confirm Password do not match"
            if is_react_request(request):
                return JsonResponse({'success': False, 'message': err}, status=400)
            message = f"<div class='error'>{err}</div>"
        else:
            admin.password = hash_password(new_pwd)
            admin.save()
            if is_react_request(request):
                return JsonResponse({'success': True, 'message': 'Password Changed Successfully'})
            request.session['update'] = "<div class='success'>Password Changed Successfully</div>"
            return redirect('/admin/manage-admin')
            
    if is_react_request(request):
        return JsonResponse({'success': True})
    notifs = get_global_notifications()
    return render(request, 'admin/update-password.html', {**notifs, 'admin': admin, 'message': message})

@csrf_exempt
@admin_login_required
def delete_admin(request):
    admin_id = request.POST.get('id') or request.GET.get('id')
    admin = get_object_or_404(Admin, id=admin_id)
    admin.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'Admin Deleted Successfully'})
    request.session['delete'] = "<div class='success'>Admin Deleted Successfully</div>"
    return redirect('/admin/manage-admin')

# ================= CATEGORIES =================

@admin_login_required
def manage_category(request):
    notifs = get_global_notifications()
    categories = Category.objects.all().order_by('id')
    
    add_msg = request.session.pop('add', '')
    del_msg = request.session.pop('delete', '')
    up_msg = request.session.pop('update', '')
    
    context = {
        **notifs,
        'categories': categories,
        'add_msg': add_msg,
        'del_msg': del_msg,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-category.html', context)

@csrf_exempt
@admin_login_required
def add_category(request):
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        featured = request.POST.get('featured', 'No')
        active = request.POST.get('active', 'No')
        image = request.FILES.get('image')
        
        image_name = handle_image_upload(image, prefix='Food_Category_')
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_category (title, image_name, featured, active) VALUES (%s, %s, %s, %s)",
                [title, image_name, featured, active]
            )
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Category Added Successfully'})
        request.session['add'] = "<div class='success'>Category Added Successfully.</div>"
        return redirect('/admin/manage-category')
        
    if is_react_request(request):
        return JsonResponse({'success': True})
    notifs = get_global_notifications()
    return render(request, 'admin/add-category.html', {**notifs, 'message': ''})

@csrf_exempt
@admin_login_required
def update_category(request):
    cat_id = request.POST.get('id') or request.GET.get('id')
    category = get_object_or_404(Category, id=cat_id)
    
    if request.method == 'POST':
        category.title = request.POST.get('title', category.title).strip()
        category.featured = request.POST.get('featured', category.featured)
        category.active = request.POST.get('active', category.active)
        
        image = request.FILES.get('image')
        if image:
            category.image_name = handle_image_upload(image, prefix='Food_Category_')
            
        category.save()
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Category Updated Successfully'})
        request.session['update'] = "<div class='success'>Category Updated Successfully.</div>"
        return redirect('/admin/manage-category')
        
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'category': serialize_value(category)})
    notifs = get_global_notifications()
    return render(request, 'admin/update-category.html', {**notifs, 'category': category})

@csrf_exempt
@admin_login_required
def delete_category(request):
    cat_id = request.POST.get('id') or request.GET.get('id')
    category = get_object_or_404(Category, id=cat_id)
    category.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'Category Deleted Successfully'})
    request.session['delete'] = "<div class='success'>Category Deleted Successfully</div>"
    return redirect('/admin/manage-category')

# ================= FOODS =================

@admin_login_required
def manage_food(request):
    notifs = get_global_notifications()
    foods = Food.objects.all().order_by('id')
    
    add_msg = request.session.pop('add', '')
    del_msg = request.session.pop('delete', '')
    up_msg = request.session.pop('update', '')
    
    context = {
        **notifs,
        'foods': foods,
        'add_msg': add_msg,
        'del_msg': del_msg,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-food.html', context)

@csrf_exempt
@admin_login_required
def add_food(request):
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        price = request.POST.get('price', 0.0)
        category_id = request.POST.get('category', 0)
        featured = request.POST.get('featured', 'No')
        active = request.POST.get('active', 'No')
        stock = request.POST.get('stock', 0)
        image = request.FILES.get('image')
        
        image_name = handle_image_upload(image, prefix='Food-Name-')
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_food (title, description, price, restro_name, image_name, category_id, featured, active, stock) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                [title, description, price, 'Pasar Kita', image_name, category_id, featured, active, stock]
            )
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Food Added Successfully'})
        request.session['add'] = "<div class='success'>Food Added Successfully</div>"
        return redirect('/admin/manage-food')
        
    categories = Category.objects.filter(active='Yes')
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'categories': serialize_value(list(categories))})
    notifs = get_global_notifications()
    return render(request, 'admin/add-food.html', {**notifs, 'categories': categories, 'message': ''})

@csrf_exempt
@admin_login_required
def update_food(request):
    food_id = request.POST.get('id') or request.GET.get('id')
    food = get_object_or_404(Food, id=food_id)
    
    if request.method == 'POST':
        food.title = request.POST.get('title', food.title).strip()
        food.description = request.POST.get('description', food.description).strip()
        food.price = request.POST.get('price', food.price)
        food.category_id = request.POST.get('category', food.category_id)
        food.featured = request.POST.get('featured', food.featured)
        food.active = request.POST.get('active', food.active)
        food.stock = request.POST.get('stock', food.stock)
        
        image = request.FILES.get('image')
        if image:
            food.image_name = handle_image_upload(image, prefix='Food-Name-')
            
        food.save()
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Food Updated Successfully'})
        request.session['update'] = "<div class='success'>Food Updated Successfully</div>"
        return redirect('/admin/manage-food')
        
    categories = Category.objects.filter(active='Yes')
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'food': serialize_value(food), 'categories': serialize_value(list(categories))})
    notifs = get_global_notifications()
    return render(request, 'admin/update-food.html', {**notifs, 'food': food, 'categories': categories})

@csrf_exempt
@admin_login_required
def delete_food(request):
    food_id = request.POST.get('id') or request.GET.get('id')
    food = get_object_or_404(Food, id=food_id)
    food.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'Food Deleted Successfully'})
    request.session['delete'] = "<div class='success'>Food Deleted Successfully</div>"
    return redirect('/admin/manage-food')

# ================= INVENTORY =================

@admin_login_required
def inventory(request):
    notifs = get_global_notifications()
    low_param = request.GET.get('low')
    if low_param == '1':
        foods = Food.objects.filter(stock__lte=3).order_by('id')
    else:
        foods = Food.objects.all().order_by('id')
        
    up_msg = request.session.pop('update', '')
    
    context = {
        **notifs,
        'foods': foods,
        'up_msg': up_msg
    }
    return render(request, 'admin/inventory.html', context)

@csrf_exempt
@admin_login_required
def update_inventory(request):
    food_id = request.POST.get('id') or request.GET.get('id')
    food = get_object_or_404(Food, id=food_id)
    
    if request.method == 'POST':
        data = get_request_data(request)
        food.stock = data.get('stock', food.stock)
        food.save()
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Inventory Updated Successfully'})
        request.session['update'] = "<div class='success'>Inventory Updated Successfully</div>"
        return redirect('/admin/inventory')
        
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'food': serialize_value(food)})
    notifs = get_global_notifications()
    return render(request, 'admin/update-inventory.html', {**notifs, 'food': food})

# ================= ONLINE ORDERS =================

@admin_login_required
def manage_online_order(request):
    notifs = get_global_notifications()
    
    status_filter = request.GET.get('status')
    rem_filter = request.GET.get('remaining')
    
    # Query distinct orders from order_manager joined with online_orders_new where restro_name='Pasar Kita'
    query = """
        SELECT DISTINCT om.order_id, om.cus_name, om.cus_phone, om.cus_add1, 
                        om.payment_status, om.order_date, om.total_amount, 
                        om.transaction_id, om.order_status, om.delivery_boy_name
        FROM order_manager om
        JOIN online_orders_new oon ON om.order_id = oon.order_id
        WHERE oon.restro_name = 'Pasar Kita'
    """
    params = []
    
    if status_filter:
        query += " AND om.order_status = %s"
        params.append(status_filter)
    elif rem_filter == '1':
        query += " AND (om.order_status='Pending' OR om.order_status='Processing' OR om.order_status='OnTheWay')"
        
    query += " ORDER BY om.order_date DESC"
    
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
    orders = []
    for r in rows:
        order_id = r[0]
        # Fetch items for this order
        with connection.cursor() as cursor:
            cursor.execute("SELECT Item_Name, Price, Quantity FROM online_orders_new WHERE order_id = %s", [order_id])
            item_rows = cursor.fetchall()
        items = [{'name': ir[0], 'price': float(ir[1]), 'qty': int(ir[2])} for ir in item_rows]
        
        orders.append({
            'order_id': order_id,
            'cus_name': r[1],
            'cus_phone': r[2],
            'cus_add1': r[3],
            'payment_status': r[4],
            'order_date': r[5],
            'total_amount': float(r[6]),
            'transaction_id': r[7],
            'order_status': r[8],
            'delivery_boy_name': r[9],
            'items': items
        })
        
    up_msg = request.session.pop('update', '')
    
    if is_react_request(request):
        # Convert date to string to avoid JSON serialization errors
        for o in orders:
            if o['order_date'] and hasattr(o['order_date'], 'isoformat'):
                o['order_date'] = o['order_date'].isoformat()
            elif o['order_date']:
                o['order_date'] = str(o['order_date'])
        return JsonResponse({'success': True, 'orders': orders})
        
    context = {
        **notifs,
        'orders': orders,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-online-order.html', context)

@csrf_exempt
@admin_login_required
def update_online_order(request):
    order_id = request.POST.get('id') or request.GET.get('id')
    order = get_object_or_404(OrderManager, order_id=order_id)
    
    # Fetch items
    with connection.cursor() as cursor:
        cursor.execute("SELECT Item_Name, Price, Quantity FROM online_orders_new WHERE order_id = %s", [order_id])
        item_rows = cursor.fetchall()
    items = [{'name': ir[0], 'price': float(ir[1]), 'qty': int(ir[2])} for ir in item_rows]
    
    delivery_boys = DeliveryBoy.objects.filter(status='verified', user_role=1)
    
    if request.method == 'POST':
        data = get_request_data(request)
        order.payment_status = data.get('payment_status', order.payment_status)
        order.order_status = data.get('order_status', order.order_status)
        
        old_driver = order.delivery_boy_name
        new_driver = data.get('delivery_boy_name')
        if new_driver:
            order.delivery_boy_name = new_driver
            
        order.save()
        
        # If order status becomes Delivered, add payment entry for delivery boy (salary = 30 based on rate)
        if order.order_status == 'Delivered' and new_driver and old_driver != new_driver:
            exists = DeliveryPayment.objects.filter(order_id=order.order_id).exists()
            if not exists:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO tbl_delivery_payment (username, salary, payment_status, order_id, created_at) VALUES (%s, %s, %s, %s, %s)",
                        [new_driver, 30.00, 'unpaid', order.order_id, datetime.datetime.now()]
                    )
                    
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Order Updated Successfully'})
        request.session['update'] = "<div class='success'>Order Updated Successfully</div>"
        return redirect('/admin/manage-online-order')
        
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({
            'success': True,
            'order': serialize_value(order),
            'items': items,
            'delivery_boys': serialize_value(list(delivery_boys))
        })
    notifs = get_global_notifications()
    return render(request, 'admin/update-online-order.html', {
        **notifs,
        'order': order,
        'items': items,
        'delivery_boys': delivery_boys
    })

@admin_login_required
def manage_repeat_rate(request):
    notifs = get_global_notifications()
    
    customer_orders = {}
    total_orders = 0
    
    # Query delivered orders count per customer
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT om.username, COUNT(om.username) AS order_count 
            FROM order_manager om 
            JOIN online_orders_new o ON om.order_id = o.order_id 
            WHERE o.restro_name = 'Pasar Kita' 
            AND om.order_status = 'Delivered'
            GROUP BY om.username
        """)
        rows = cursor.fetchall()
        
    for r in rows:
        username = r[0]
        count = int(r[1])
        customer_orders[username] = count
        total_orders += count
        
    repeat_rates = {}
    total_repeat_rate = 0.0
    total_customers = len(customer_orders)
    
    for username, count in customer_orders.items():
        rate = (count / total_orders) * 100 if total_orders > 0 else 0
        repeat_rates[username] = round(rate, 2)
        total_repeat_rate += rate
        
    total_repeat_rate = round(total_repeat_rate / total_customers, 2) if total_customers > 0 else 0.0
    
    if is_react_request(request):
        rates_list = []
        for username, count in customer_orders.items():
            rates_list.append({
                'username': username,
                'count': count,
                'rate': repeat_rates.get(username, 0.0)
            })
        return JsonResponse({
            'success': True,
            'customer_orders': rates_list,
            'total_repeat_rate': total_repeat_rate
        })
        
    context = {
        **notifs,
        'customer_orders': customer_orders,
        'repeat_rates': repeat_rates,
        'total_repeat_rate': total_repeat_rate
    }
    return render(request, 'admin/manage-repeat-rate.html', context)

# ================= EAT-IN / USERS =================

@admin_login_required
def manage_ei_order(request):
    notifs = get_global_notifications()
    
    users = User.objects.all().order_by('id')
    del_msg = request.session.pop('delete', '')
    up_msg = request.session.pop('update', '')
    
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'users': serialize_value(list(users))})
        
    context = {
        **notifs,
        'users': users,
        'del_msg': del_msg,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-ei-order.html', context)

@admin_login_required
def update_ei_order(request):
    notifs = get_global_notifications()
    order_id = request.GET.get('id')
    ei_order = get_object_or_404(EatInPay, id=order_id)
    
    if request.method == 'POST':
        ei_order.table_id = request.POST.get('table_id', ei_order.table_id).strip()
        ei_order.amount = request.POST.get('amount', ei_order.amount)
        ei_order.tran_id = request.POST.get('tran_id', ei_order.tran_id).strip()
        ei_order.payment_status = request.POST.get('payment_status', ei_order.payment_status).strip()
        ei_order.order_status = request.POST.get('order_status', ei_order.order_status).strip()
        ei_order.save()
        
        request.session['update'] = "<div class='success'>Order Updated Successfully</div>"
        return redirect('/admin/manage-ei-order')
        
    return render(request, 'admin/update-ei-order.html', {
        **notifs,
        'table_id': ei_order.table_id,
        'amount': ei_order.amount,
        'tran_id': ei_order.tran_id,
        'order_date': ei_order.order_date,
        'payment_status': ei_order.payment_status,
        'order_status': ei_order.order_status,
        'id': ei_order.id
    })

@csrf_exempt
@admin_login_required
def delete_ei_order(request):
    # Actually deletes a customer/user from tbl_users!
    user_id = request.POST.get('id') or request.GET.get('id')
    user = get_object_or_404(User, id=user_id)
    user.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'User Deleted Successfully'})
    request.session['delete'] = "<div class='success'>User Deleted Successfully</div>"
    return redirect('/admin/manage-ei-order')

@csrf_exempt
def process_payment(request):
    # Mock payment processing endpoint
    return JsonResponse({'status': 'success', 'message': 'Payment processed successfully'})

# ================= RESTAURANT VENDORS =================

@admin_login_required
def manage_restro(request):
    notifs = get_global_notifications()
    restaurants = Restro.objects.all().order_by('-id')
    
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'restros': serialize_value(list(restaurants))})
        
    up_msg = request.session.pop('update', '')
    
    context = {
        **notifs,
        'restaurants': restaurants,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-restro.html', context)

@csrf_exempt
@admin_login_required
def update_restro_status(request):
    restro_id = request.POST.get('id') or request.GET.get('id')
    status = request.POST.get('status') or request.GET.get('status')
    
    restro = get_object_or_404(Restro, id=restro_id)
    restro.status = status
    restro.save()
    
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': f'Restaurant Status Updated to {status}'})
    request.session['update'] = f"<div class='success'>Restaurant Status Updated to {status}</div>"
    return redirect('/admin/manage-restro')

@admin_login_required
def manage_restro_category(request):
    notifs = get_global_notifications()
    categories = RestroCategoryNotApproved.objects.all().order_by('-cid')
    
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'categories': serialize_value(list(categories))})
        
    up_msg = request.session.pop('update', '')
    
    context = {
        **notifs,
        'categories': categories,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-restro-category.html', context)

@csrf_exempt
@admin_login_required
def update_restro_category(request):
    cid = request.POST.get('cid') or request.GET.get('cid')
    status = request.POST.get('status') or request.GET.get('status')
    
    not_approved_cat = get_object_or_404(RestroCategoryNotApproved, cid=cid)
    not_approved_cat.status = status
    not_approved_cat.save()
    
    if status == 'approved':
        exists = Category.objects.filter(title=not_approved_cat.title).exists()
        if not exists:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO tbl_category (title, image_name, featured, active) VALUES (%s, %s, %s, %s)",
                    [not_approved_cat.title, not_approved_cat.image_name or '', not_approved_cat.featured, not_approved_cat.active]
                )
                
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': f'Category Approval Status Updated to {status}'})
    request.session['update'] = f"<div class='success'>Category Approval Status Updated to {status}</div>"
    return redirect('/admin/manage-restro-category')

@admin_login_required
def manage_restro_food(request):
    notifs = get_global_notifications()
    foods = RestroFoodItem.objects.all().order_by('-id')
    
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'foods': serialize_value(list(foods))})
        
    up_msg = request.session.pop('update', '')
    
    context = {
        **notifs,
        'foods': foods,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-restro-food.html', context)

@csrf_exempt
@admin_login_required
def update_restro_food(request):
    food_id = request.POST.get('id') or request.GET.get('id')
    status = request.POST.get('status') or request.GET.get('status')
    
    vendor_food = get_object_or_404(RestroFoodItem, id=food_id)
    vendor_food.status = status
    vendor_food.save()
    
    if status == 'approved':
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_food (title, description, price, restro_name, image_name, category_id, featured, active, stock) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                [vendor_food.title, vendor_food.description, vendor_food.price, vendor_food.restro_name, vendor_food.image_name or '', vendor_food.cid, vendor_food.featured, vendor_food.active, vendor_food.stock]
            )
            
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': f'Food Item Status Updated to {status}'})
    request.session['update'] = f"<div class='success'>Food Item Status Updated to {status}</div>"
    return redirect('/admin/manage-restro-food')

@admin_login_required
def manage_restro_review(request):
    reviews = ReviewRestro.objects.all().order_by('-id')
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'reviews': serialize_value(list(reviews))})
        
    notifs = get_global_notifications()
    return render(request, 'admin/manage-restro-review.html', {**notifs, 'reviews': reviews})

# ================= DELIVERY BOY =================

@admin_login_required
def manage_delivery_boy(request):
    notifs = get_global_notifications()
    delivery_boys = DeliveryBoy.objects.all().order_by('-id')
    
    up_msg = request.session.pop('update', '')
    del_msg = request.session.pop('delete', '')
    
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'riders': serialize_value(list(delivery_boys))})
        
    context = {
        **notifs,
        'delivery_boys': delivery_boys,
        'up_msg': up_msg,
        'del_msg': del_msg
    }
    return render(request, 'admin/manage-delivery-boy.html', context)

@csrf_exempt
@admin_login_required
def verify_delivery_boy(request):
    db_id = request.POST.get('id') or request.GET.get('id')
    status = request.POST.get('status') or request.GET.get('status', 'verified')
    
    dboy = get_object_or_404(DeliveryBoy, id=db_id)
    dboy.status = status
    dboy.save()
    
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': f'Delivery Boy Status Updated to {status}'})
    request.session['update'] = f"<div class='success'>Delivery Boy Status Updated to {status}</div>"
    return redirect('/admin/manage-delivery-boy')

@csrf_exempt
@admin_login_required
def delete_delivery_boy(request):
    db_id = request.POST.get('id') or request.GET.get('id')
    dboy = get_object_or_404(DeliveryBoy, id=db_id)
    dboy.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'Delivery Boy Deleted Successfully'})
    request.session['delete'] = "<div class='success'>Delivery Boy Deleted Successfully</div>"
    return redirect('/admin/manage-delivery-boy')

@csrf_exempt
@admin_login_required
def update_delivery_boy_status(request):
    db_id = request.POST.get('id') or request.GET.get('id')
    role = request.POST.get('role') or request.GET.get('role')
    status = request.POST.get('status') or request.GET.get('status')
    
    dboy = get_object_or_404(DeliveryBoy, id=db_id)
    
    action = 'Updated'
    if status is not None:
        dboy.status = status
        action = f'Status set to {status}'
    if role is not None:
        dboy.user_role = int(role)
        action = 'Activated' if int(role) == 1 else 'Blocked'
        
    dboy.save()
    
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': f'Delivery Boy {action} Successfully'})
    request.session['update'] = f"<div class='success'>Delivery Boy {action} Successfully</div>"
    return redirect('/admin/manage-delivery-boy')

# ================= COUPONS =================

@admin_login_required
def manage_coupons(request):
    notifs = get_global_notifications()
    coupons = Coupon.objects.all().order_by('-id')
    
    add_msg = request.session.pop('add', '')
    del_msg = request.session.pop('delete', '')
    up_msg = request.session.pop('update', '')
    
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'coupons': serialize_value(list(coupons))})
        
    context = {
        **notifs,
        'coupons': coupons,
        'add_msg': add_msg,
        'del_msg': del_msg,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-coupons.html', context)

@csrf_exempt
@admin_login_required
def add_coupon(request):
    if request.method == 'POST':
        data = get_request_data(request)
        coupon_code = data.get('coupon_code', '').strip()
        discount = data.get('discount_percentage') or data.get('discount', 0.0)
        active = data.get('active', 'Yes')
        
        status = 'active' if active == 'Yes' else 'expired'
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_coupon (name, coupon_code, created_date, status, discount) VALUES (%s, %s, %s, %s, %s)",
                [coupon_code, coupon_code, datetime.datetime.now(), status, discount]
            )
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Coupon Added Successfully'})
        request.session['add'] = "<div class='success'>Coupon Added Successfully</div>"
        return redirect('/admin/manage-coupons')
        
    if is_react_request(request):
        return JsonResponse({'success': True})
    notifs = get_global_notifications()
    return render(request, 'admin/add-coupon.html', {**notifs, 'message': ''})

@csrf_exempt
@admin_login_required
def update_coupon(request):
    coupon_id = request.POST.get('id') or request.GET.get('id')
    coupon = get_object_or_404(Coupon, id=coupon_id)
    
    if request.method == 'POST':
        data = get_request_data(request)
        coupon.name = data.get('coupon_code') or data.get('name', coupon.name)
        coupon.coupon_code = data.get('coupon_code', coupon.coupon_code)
        coupon.discount = data.get('discount_percentage') or data.get('discount', coupon.discount)
        
        active = data.get('active')
        if active is not None:
            coupon.status = 'active' if active == 'Yes' else 'expired'
        else:
            coupon.status = data.get('status', coupon.status)
            
        coupon.save()
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Coupon Updated Successfully'})
        request.session['update'] = "<div class='success'>Coupon Updated Successfully</div>"
        return redirect('/admin/manage-coupons')
        
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'coupon': serialize_value(coupon)})
    notifs = get_global_notifications()
    return render(request, 'admin/update-coupon.html', {**notifs, 'coupon': coupon})

@csrf_exempt
@admin_login_required
def delete_coupon(request):
    coupon_id = request.POST.get('id') or request.GET.get('id')
    coupon = get_object_or_404(Coupon, id=coupon_id)
    coupon.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'Coupon Deleted Successfully'})
    request.session['delete'] = "<div class='success'>Coupon Deleted Successfully</div>"
    return redirect('/admin/manage-coupons')

@admin_login_required
def manage_fest_coupon(request):
    notifs = get_global_notifications()
    coupons = FestivalCoupon.objects.all().order_by('-id')
    
    add_msg = request.session.pop('add', '')
    del_msg = request.session.pop('delete', '')
    up_msg = request.session.pop('update', '')
    
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'coupons': serialize_value(list(coupons))})
        
    context = {
        **notifs,
        'coupons': coupons,
        'add_msg': add_msg,
        'del_msg': del_msg,
        'up_msg': up_msg
    }
    return render(request, 'admin/manage-fest-coupon.html', context)

@csrf_exempt
@admin_login_required
def add_fest_coupon(request):
    if request.method == 'POST':
        data = get_request_data(request)
        festival_name = data.get('festival_name', '').strip()
        coupon_code = data.get('coupon_code', '').strip()
        discount = data.get('discount', 0.0)
        duration = data.get('duration', 7)
        status = data.get('status', 'active')
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_fest_coupon (festival_name, coupon_code, created_date, duration, expire, status, discount) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                [festival_name, coupon_code, datetime.datetime.now(), duration, 'active', status, discount]
            )
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Festival Coupon Added Successfully'})
        request.session['add'] = "<div class='success'>Festival Coupon Added Successfully</div>"
        return redirect('/admin/manage-fest-coupon')
        
    if is_react_request(request):
        return JsonResponse({'success': True})
    notifs = get_global_notifications()
    return render(request, 'admin/add-fest-coupon.html', {**notifs, 'message': ''})

@csrf_exempt
@admin_login_required
def update_fest_coupon(request):
    coupon_id = request.POST.get('id') or request.GET.get('id')
    coupon = get_object_or_404(FestivalCoupon, id=coupon_id)
    
    if request.method == 'POST':
        data = get_request_data(request)
        coupon.festival_name = data.get('festival_name', coupon.festival_name).strip()
        coupon.coupon_code = data.get('coupon_code', coupon.coupon_code).strip()
        coupon.discount = data.get('discount', coupon.discount)
        coupon.duration = data.get('duration', coupon.duration)
        coupon.status = data.get('status', coupon.status)
        coupon.expire = data.get('expire', coupon.expire)
        coupon.save()
        
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Festival Coupon Updated Successfully'})
        request.session['update'] = "<div class='success'>Festival Coupon Updated Successfully</div>"
        return redirect('/admin/manage-fest-coupon')
        
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'coupon': serialize_value(coupon)})
    notifs = get_global_notifications()
    return render(request, 'admin/update-fest-coupon.html', {**notifs, 'coupon': coupon})

@csrf_exempt
@admin_login_required
def delete_fest_coupon(request):
    coupon_id = request.POST.get('id') or request.GET.get('id')
    coupon = get_object_or_404(FestivalCoupon, id=coupon_id)
    coupon.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'Festival Coupon Deleted Successfully'})
    request.session['delete'] = "<div class='success'>Festival Coupon Deleted Successfully</div>"
    return redirect('/admin/manage-fest-coupon')

# ================= HISTORY & MESSAGES =================

@csrf_exempt
@admin_login_required
def manage_delivery_payment(request):
    notifs = get_global_notifications()
    
    if request.method == 'POST':
        data = get_request_data(request)
        pay_id = data.get('id') or request.POST.get('id')
        payment = get_object_or_404(DeliveryPayment, id=pay_id)
        payment.payment_status = 'paid'
        payment.save()
        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Payment status updated to paid'})
        request.session['update'] = "<div class='success'>Payment status updated to paid</div>"
        return redirect('/admin/manage-delivery-payment')
        
    payments = DeliveryPayment.objects.all().order_by('-id')
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({
            'success': True,
            'payments': serialize_value(list(payments))
        })
        
    context = {
        **notifs,
        'payments': payments,
        'up_msg': request.session.pop('update', '')
    }
    return render(request, 'admin/manage-delivery-payment.html', context)

@admin_login_required
def manage_review(request):
    reviews = Review.objects.all().order_by('-id')
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'reviews': serialize_value(list(reviews))})
    notifs = get_global_notifications()
    return render(request, 'admin/manage-review.html', {**notifs, 'reviews': reviews})

@admin_login_required
def messages(request):
    msgs = ContactMessage.objects.all().order_by('-id')
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'messages': serialize_value(list(msgs))})
        
    notifs = get_global_notifications()
    del_msg = request.session.pop('delete', '')
    
    context = {
        **notifs,
        'messages': msgs,
        'del_msg': del_msg
    }
    return render(request, 'admin/messages.html', context)

@admin_login_required
def read_message(request):
    msg_id = request.GET.get('id')
    msg = get_object_or_404(ContactMessage, id=msg_id)
    
    # Mark message as read
    if msg.message_status == 'unread':
        msg.message_status = 'read'
        msg.save()
        
    if is_react_request(request):
        from food_ordering_project.serializers import serialize_value
        return JsonResponse({'success': True, 'message': serialize_value(msg)})
        
    notifs = get_global_notifications()
    return render(request, 'admin/read-message.html', {**notifs, 'message': msg})

@csrf_exempt
@admin_login_required
def delete_message(request):
    msg_id = request.POST.get('id') or request.GET.get('id')
    msg = get_object_or_404(ContactMessage, id=msg_id)
    msg.delete()
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': 'Message Deleted Successfully'})
    request.session['delete'] = "<div class='success'>Message Deleted Successfully</div>"
    return redirect('/admin/messages')

@csrf_exempt
@admin_login_required
def update_user_role(request):
    user_id = request.POST.get('user_id') or request.POST.get('id') or request.GET.get('id')
    role = request.POST.get('role') or request.GET.get('role', 1)
    
    user = get_object_or_404(User, id=user_id)
    user.user_role = int(role)
    user.save()
    
    action = 'Activated' if int(role) == 1 else 'Blocked'
    if is_react_request(request):
        return JsonResponse({'success': True, 'message': f'User {action} Successfully'})
    request.session['update'] = f"<div class='success'>User {action} Successfully</div>"
    return redirect('/admin/manage-ei-order')

@admin_login_required
def monthly_revenue(request):
    import json
    notifs = get_global_notifications()
    
    # Get current date
    today = datetime.date.today()
    month_totals = {}
    month_keys = []
    for i in range(11, -1, -1):
        y = today.year
        m = today.month - i
        while m <= 0:
            m += 12
            y -= 1
        dt = datetime.date(y, m, 1)
        key = dt.strftime('%Y-%m')
        label = dt.strftime('%b %Y')
        month_keys.append(key)
        month_totals[key] = {
            'label': label,
            'total': 0.0,
            'orders': 0
        }
        
    month_start_date = f"{month_keys[0]}-01"
    
    with connection.cursor() as cursor:
        # 1. Last 12 months query
        cursor.execute("""
            SELECT DATE_FORMAT(om.order_date, '%%Y-%%m') AS month_key,
                   COALESCE(SUM(oo.total_amount), 0) AS total_amount,
                   COUNT(DISTINCT om.order_id) AS orders
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = 'Pasar Kita'
              AND om.order_status = 'Delivered'
              AND om.order_date >= %s
            GROUP BY DATE_FORMAT(om.order_date, '%%Y-%%m')
            ORDER BY DATE_FORMAT(om.order_date, '%%Y-%%m')
        """, [month_start_date])
        
        for row in cursor.fetchall():
            m_key = row[0]
            if m_key in month_totals:
                month_totals[m_key]['total'] = float(row[1])
                month_totals[m_key]['orders'] = int(row[2])
                
        # 2. All time query
        cursor.execute("""
            SELECT DATE_FORMAT(om.order_date, '%%Y-%%m') AS month_key,
                   DATE_FORMAT(om.order_date, '%%b %%Y') AS month_label,
                   COALESCE(SUM(oo.total_amount), 0) AS total_amount,
                   COUNT(DISTINCT om.order_id) AS orders
            FROM online_orders_new oo
            INNER JOIN order_manager om ON oo.order_id = om.order_id
            WHERE oo.restro_name = 'Pasar Kita'
              AND om.order_status = 'Delivered'
              AND om.order_date IS NOT NULL
            GROUP BY DATE_FORMAT(om.order_date, '%%Y-%%m')
            ORDER BY DATE_FORMAT(om.order_date, '%%Y-%%m')
        """)
        
        all_time_rows = []
        all_time_total = 0.0
        all_time_orders = 0
        
        for row in cursor.fetchall():
            m_key = row[0]
            m_label = row[1] or m_key or '-'
            tot = float(row[2])
            ord_cnt = int(row[3])
            all_time_rows.append({
                'label': m_label,
                'total': tot,
                'orders': ord_cnt
            })
            all_time_total += tot
            all_time_orders += ord_cnt

    current_month_key = today.strftime('%Y-%m')
    current_month_label = today.strftime('%B %Y')
    
    current_month_total = month_totals.get(current_month_key, {}).get('total', 0.0)
    current_month_orders = month_totals.get(current_month_key, {}).get('orders', 0)
    
    last12_total = 0.0
    last12_orders = 0
    for key in month_keys:
        last12_total += month_totals[key]['total']
        last12_orders += month_totals[key]['orders']
        
    average_monthly = last12_total / 12.0
    
    # Generate JSON charts
    monthly_chart_rows = [['Month', 'Revenue']]
    for key in month_keys:
        monthly_chart_rows.append([month_totals[key]['label'], month_totals[key]['total']])
    monthly_chart_json = json.dumps(monthly_chart_rows)
    
    all_time_chart_rows = [['Month', 'Revenue']]
    for row in all_time_rows:
        all_time_chart_rows.append([row['label'], row['total']])
    all_time_chart_json = json.dumps(all_time_chart_rows)
    
    month_totals_list = [month_totals[key] for key in month_keys]
    
    if is_react_request(request):
        return JsonResponse({
            'success': True,
            'sorted_month_totals': month_totals_list,
            'all_time_total': all_time_total,
            'all_time_orders': all_time_orders,
            'last12_total': last12_total,
            'last12_orders': last12_orders,
            'average_monthly': average_monthly,
        })
        
    admin_name = request.session.get('user-admin', 'Admin')
    admin_initial = admin_name[0].upper() if admin_name else 'A'
    
    context = {
        **notifs,
        'month_totals': month_totals_list,
        'all_time_total': all_time_total,
        'all_time_orders': all_time_orders,
        'last12_total': last12_total,
        'last12_orders': last12_orders,
        'current_month_label': current_month_label,
        'current_month_total': current_month_total,
        'current_month_orders': current_month_orders,
        'average_monthly': average_monthly,
        'monthly_chart_json': monthly_chart_json,
        'all_time_chart_json': all_time_chart_json,
        'admin_name': admin_name,
        'admin_initial': admin_initial,
    }
    return render(request, 'admin/monthly-revenue.html', context)

