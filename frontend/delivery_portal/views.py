import os
import math
import random
import datetime
import time
import hashlib
import bcrypt
import json

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.db import connection, transaction
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt

from admin_portal.models import DeliveryBoy, DeliveryPayment
from customer.models import OrderManager, Review
from .decorators import delivery_login_required
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


# ─── Password helpers ──────────────────────────────────────────────────────────

def verify_password(password, hashed_password):
    """Check BCrypt or MD5 hashed passwords (compat with PHP's password_hash / md5)."""
    if len(hashed_password) == 32:          # Legacy MD5
        return hashlib.md5(password.encode('utf-8')).hexdigest() == hashed_password
    try:                                    # BCrypt ($2y$ → $2b$ for Python lib)
        h = hashed_password
        if h.startswith('$2y$'):
            h = '$2b$' + h[4:]
        return bcrypt.checkpw(password.encode('utf-8'), h.encode('utf-8'))
    except Exception:
        return False


def hash_password(password):
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


# ─── Email helper ─────────────────────────────────────────────────────────────

def send_delivery_reset_email(to_email, reset_key):
    from django.core.mail import EmailMultiAlternatives
    from django.utils.html import escape

    subject = 'Pasar-kita Delivery Reset OTP'
    text_content = (
        f"Your Delivery portal reset code is ready\n\n"
        f"Use the OTP below to continue your password reset.\n\n"
        f"Your 6-digit OTP: {reset_key}\n\n"
        f"Ignore this email if you did not request a reset.\n"
    )
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <body style="margin:0;padding:0;background:#edf3fb;font-family:Arial,sans-serif;color:#14213d;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:34px 18px;background:#edf3fb;">
            <tr><td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                    style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
                    <tr><td style="padding:40px;background:#0f224a;color:#ffffff;text-align:center;">
                        <h1 style="margin:0;font-size:28px;">Your Delivery Reset Code</h1>
                        <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);">Secure password recovery code</p>
                    </td></tr>
                    <tr><td style="padding:40px;text-align:center;">
                        <p style="font-size:16px;color:#475569;margin-bottom:30px;">
                            Use the OTP below to continue your password reset.
                        </p>
                        <div style="display:inline-block;padding:15px 30px;background:#f8fbff;border:2px dashed #0f224a;
                             border-radius:10px;font-size:36px;font-weight:bold;letter-spacing:5px;color:#0f224a;">
                            {escape(reset_key)}
                        </div>
                        <p style="font-size:12px;color:#94a3b8;margin-top:30px;">
                            This code will expire in 10 minutes.
                        </p>
                    </td></tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>
    """
    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [to_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


# ─── Notification helper ──────────────────────────────────────────────────────

def get_delivery_notifications(username):
    """Returns sidebar/navbar notification counts for delivery boy pages."""
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) FROM order_manager "
            "WHERE order_status IN ('Pending','Processing','OnTheWay')"
        )
        online_count = cursor.fetchone()[0] or 0

        cursor.execute(
            "SELECT COUNT(*) FROM tbl_eipay "
            "WHERE order_status IN ('Pending','Processing','OnTheWay')"
        )
        ei_count = cursor.fetchone()[0] or 0

    initial = 'D'
    if username:
        trimmed = username.strip()
        if trimmed:
            initial = trimmed[0].upper()

    return {
        'online_order_notif': online_count,
        'ei_order_notif': ei_count,
        'total_notif': online_count + ei_count,
        'delivery_initial': initial,
    }


# ─── Commission helper ────────────────────────────────────────────────────────

def calculate_salary(total_amount):
    """Replicate PHP finish-order.php commission tiers."""
    amount = float(total_amount)
    if amount < 250:
        return 20
    elif amount < 500:
        return 25
    elif amount < 1000:
        return 30
    elif amount < 1500:
        return 40
    elif amount < 2000:
        return 50
    else:
        return 60


# ═══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION VIEWS
# ═══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def login_view(request):
    if is_react_request(request):
        if request.session.get('delivery-boy'):
            return JsonResponse({'status': 'redirect', 'redirect': '/delivery-boy/'})

        if request.method == 'POST':
            data = get_request_data(request)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()

            if not username or not password:
                return JsonResponse({'message': "<div class='error-box'>Please fill in all fields.</div>"}, status=400)

            try:
                boy = DeliveryBoy.objects.get(username=username)
            except DeliveryBoy.DoesNotExist:
                boy = None

            if not boy:
                return JsonResponse({'message': "<div class='error-box'>No account found with this username.</div>"}, status=400)
            elif boy.user_role == 0:
                return JsonResponse({'message': "<div class='error-box'>Your account has been blocked by the admin.</div>"}, status=400)
            elif boy.status != 'verified':
                return JsonResponse({'message': "<div class='error-box'>Your account is not verified by the admin.</div>"}, status=400)
            elif verify_password(password, boy.password):
                request.session.pop('user', None)
                request.session.pop('user-admin', None)
                request.session.pop('restro-name', None)
                request.session['delivery-boy'] = boy.username
                request.session['login_success'] = "<div class='success'>Logged in successfully</div>"
                return JsonResponse({'status': 'redirect', 'redirect': '/delivery-boy/'})
            else:
                return JsonResponse({'message': "<div class='error-box'>Invalid password. Please try again.</div>"}, status=400)
        return JsonResponse({'message': ''})

    if request.session.get('delivery-boy'):
        return redirect('/delivery-boy/')

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
            try:
                boy = DeliveryBoy.objects.get(username=username)
            except DeliveryBoy.DoesNotExist:
                boy = None

            if not boy:
                message = "<div class='error-box'>No account found with this username.</div>"
            elif boy.user_role == 0:
                message = "<div class='error-box'>Your account has been blocked by the admin.</div>"
            elif boy.status != 'verified':
                message = "<div class='error-box'>Your account is not verified by the admin.</div>"
            elif verify_password(password, boy.password):
                request.session.pop('user', None)
                request.session.pop('user-admin', None)
                request.session.pop('restro-name', None)
                request.session['delivery-boy'] = boy.username
                return redirect('/delivery-boy/')
            else:
                message = "<div class='error-box'>Invalid password. Please try again.</div>"

    return render(request, 'delivery/login.html', {'message': message})


def logout_view(request):
    request.session.pop('delivery-boy', None)
    if is_react_request(request):
        return JsonResponse({'status': 'redirect', 'redirect': '/delivery-boy/login'})
    return redirect('/delivery-boy/login')


@csrf_exempt
def signup_view(request):
    if is_react_request(request):
        if request.session.get('delivery-boy'):
            return JsonResponse({'status': 'redirect', 'redirect': '/delivery-boy/'})

        if request.method == 'POST':
            name = request.POST.get('name', '').strip()
            username = request.POST.get('username', '').strip()
            email = request.POST.get('email', '').strip()
            mobile_number = request.POST.get('mobile_number', '').strip()
            address = request.POST.get('address', '').strip()
            password = request.POST.get('password', '')
            confirm_password = request.POST.get('confirm_password', '')
            adhar_image = request.FILES.get('adhar_image')

            if not all([name, username, email, mobile_number, address, password, confirm_password]):
                return JsonResponse({'message': "<div class='error-box'>Please fill in all required fields.</div>"}, status=400)
            elif password != confirm_password:
                return JsonResponse({'message': "<div class='error-box'>Passwords do not match.</div>"}, status=400)
            elif DeliveryBoy.objects.filter(username=username).exists():
                return JsonResponse({'message': "<div class='error-box'>Username already exists.</div>"}, status=400)
            elif DeliveryBoy.objects.filter(email=email).exists():
                return JsonResponse({'message': "<div class='error-box'>Email already registered.</div>"}, status=400)
            elif not adhar_image:
                return JsonResponse({'message': "<div class='error-box'>Please upload Aadhaar image.</div>"}, status=400)
            else:
                adhar_path = ''
                ext = os.path.splitext(adhar_image.name)[1].lower()
                fname = f"delivery_{int(time.time())}_{random.randint(1000, 9999)}{ext}"
                upload_dir = settings.BASE_DIR.parent / 'delivery-boy' / 'uploads'
                os.makedirs(upload_dir, exist_ok=True)
                fs = FileSystemStorage(location=str(upload_dir))
                fs.save(fname, adhar_image)
                adhar_path = f"uploads/{fname}"

                hashed = hash_password(password)
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO tbl_delivery_boy
                        (name, username, email, mobile_number, password, adhar_image, address, user_role, status, reset_key)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, [
                        name, username, email, mobile_number, hashed, adhar_path,
                        address, 1, 'not_verified', 0
                    ])
                return JsonResponse({'status': 'redirect', 'redirect': '/delivery-boy/login'})
        return JsonResponse({'message': ''})

    if request.session.get('delivery-boy'):
        return redirect('/delivery-boy/')

    message = ''
    values = {
        'name': '', 'username': '', 'email': '',
        'mobile_number': '', 'address': ''
    }

    if request.method == 'POST':
        values['name'] = request.POST.get('name', '').strip()
        values['username'] = request.POST.get('username', '').strip()
        values['email'] = request.POST.get('email', '').strip()
        values['mobile_number'] = request.POST.get('mobile_number', '').strip()
        values['address'] = request.POST.get('address', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        adhar_image = request.FILES.get('adhar_image')

        if not all([values['name'], values['username'], values['email'],
                    values['mobile_number'], values['address'], password, confirm_password]):
            message = "<div class='error-box'>Please fill in all required fields.</div>"
        elif password != confirm_password:
            message = "<div class='error-box'>Passwords do not match.</div>"
        elif DeliveryBoy.objects.filter(username=values['username']).exists():
            message = "<div class='error-box'>Username already exists.</div>"
        elif DeliveryBoy.objects.filter(email=values['email']).exists():
            message = "<div class='error-box'>Email already registered.</div>"
        else:
            adhar_path = ''
            if adhar_image:
                ext = os.path.splitext(adhar_image.name)[1].lower()
                fname = f"delivery_{int(time.time())}_{random.randint(1000, 9999)}{ext}"
                upload_dir = settings.BASE_DIR.parent / 'delivery-boy' / 'uploads'
                os.makedirs(upload_dir, exist_ok=True)
                fs = FileSystemStorage(location=str(upload_dir))
                fs.save(fname, adhar_image)
                adhar_path = f"uploads/{fname}"

            hashed = hash_password(password)
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO tbl_delivery_boy
                    (name, username, email, mobile_number, password, adhar_image, address, user_role, status, reset_key)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    values['name'], values['username'], values['email'],
                    values['mobile_number'], hashed, adhar_path,
                    values['address'], 1, 'not_verified', 0
                ])
            return redirect('/delivery-boy/login')

    return render(request, 'delivery/signup.html', {'message': message, 'values': values})


@csrf_exempt
def forget_view(request):
    if is_react_request(request):
        if request.method == 'POST':
            data = get_request_data(request)
            action = data.get('action')

            if action == 'verify_email':
                request.session.pop('d_verified_email', None)
                request.session.pop('d_reset_key', None)
                request.session.pop('d_reset_key_expires_at', None)
                request.session.pop('d_reset_verified', None)

                email = data.get('email', '').strip()
                try:
                    boy = DeliveryBoy.objects.get(email=email)
                except DeliveryBoy.DoesNotExist:
                    boy = None

                if not boy:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Email not found.</div>"}, status=400)
                else:
                    reset_key = str(random.randint(100000, 999999))
                    request.session['d_reset_key'] = reset_key
                    request.session['d_verified_email'] = email
                    request.session['d_reset_key_expires_at'] = int(time.time()) + 600

                    try:
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "UPDATE tbl_delivery_boy SET reset_key = %s WHERE email = %s",
                                [reset_key, email]
                            )
                        send_delivery_reset_email(email, reset_key)
                        return JsonResponse({
                            'success': True,
                            'message': "<div class='alert-box success-box'>Reset key sent to your registered email.</div>",
                            'showResetKeyField': True,
                            'showPasswordField': False
                        })
                    except Exception as e:
                        return JsonResponse({'message': f"<div class='alert-box error-box'>Mail failed: {str(e)}</div>"}, status=500)

            elif action == 'verify_reset_key':
                reset_key = data.get('reset_key', '').strip()
                sess_key = request.session.get('d_reset_key')
                sess_email = request.session.get('d_verified_email')
                sess_expires = request.session.get('d_reset_key_expires_at', 0)

                if not sess_email or not sess_key:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Session expired. Verify email again.</div>"}, status=400)
                elif int(time.time()) > sess_expires:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Reset key expired.</div>"}, status=400)
                elif reset_key != sess_key:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Reset key does not match.</div>"}, status=400)
                else:
                    request.session['d_reset_verified'] = True
                    return JsonResponse({
                        'success': True,
                        'message': "<div class='alert-box success-box'>Reset key verified. Set new password.</div>",
                        'showResetKeyField': False,
                        'showPasswordField': True
                    })

            elif action == 'update_password':
                new_pwd = data.get('new_password', '').strip()
                confirm_pwd = data.get('confirm_password', '').strip()
                sess_email = request.session.get('d_verified_email')

                if not request.session.get('d_reset_verified') or not sess_email:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Session error. Start over.</div>"}, status=400)
                elif not new_pwd:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Please enter a password.</div>"}, status=400)
                elif new_pwd != confirm_pwd:
                    return JsonResponse({'message': "<div class='alert-box error-box'>Passwords do not match.</div>"}, status=400)
                else:
                    hashed = hash_password(new_pwd)
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "UPDATE tbl_delivery_boy SET password = %s, reset_key = %s WHERE email = %s",
                            [hashed, 0, sess_email]
                        )
                    for key in ['d_verified_email', 'd_reset_key', 'd_reset_key_expires_at', 'd_reset_verified']:
                        request.session.pop(key, None)
                    request.session['login_error'] = "<div class='alert-box success-box'>Password reset successful. Please login.</div>"
                    return JsonResponse({
                        'success': True,
                        'status': 'redirect',
                        'redirect': '/delivery-boy/login'
                    })
            return JsonResponse({'message': 'Invalid action'}, status=400)
        return JsonResponse({'message': ''})

    message = ''
    show_reset_key_field = False
    show_password_field = False

    if request.method == 'POST':
        if 'verify_email' in request.POST:
            request.session.pop('d_verified_email', None)
            request.session.pop('d_reset_key', None)
            request.session.pop('d_reset_key_expires_at', None)
            request.session.pop('d_reset_verified', None)

            email = request.POST.get('email', '').strip()
            try:
                boy = DeliveryBoy.objects.get(email=email)
            except DeliveryBoy.DoesNotExist:
                boy = None

            if not boy:
                message = "<div class='alert-box error-box'>Email not found.</div>"
            else:
                reset_key = str(random.randint(100000, 999999))
                request.session['d_reset_key'] = reset_key
                request.session['d_verified_email'] = email
                request.session['d_reset_key_expires_at'] = int(time.time()) + 600

                try:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "UPDATE tbl_delivery_boy SET reset_key = %s WHERE email = %s",
                            [reset_key, email]
                        )
                    send_delivery_reset_email(email, reset_key)
                    message = "<div class='alert-box success-box'>Reset key sent to your registered email.</div>"
                    show_reset_key_field = True
                except Exception as e:
                    message = f"<div class='alert-box error-box'>Mail failed: {str(e)}</div>"

        elif 'verify_reset_key' in request.POST:
            reset_key = request.POST.get('reset_key', '').strip()
            show_reset_key_field = True

            sess_key = request.session.get('d_reset_key')
            sess_email = request.session.get('d_verified_email')
            sess_expires = request.session.get('d_reset_key_expires_at', 0)

            if not sess_email or not sess_key:
                message = "<div class='alert-box error-box'>Session expired. Verify email again.</div>"
                show_reset_key_field = False
            elif int(time.time()) > sess_expires:
                message = "<div class='alert-box error-box'>Reset key expired.</div>"
                show_reset_key_field = False
            elif reset_key != sess_key:
                message = "<div class='alert-box error-box'>Reset key does not match.</div>"
            else:
                request.session['d_reset_verified'] = True
                message = "<div class='alert-box success-box'>Reset key verified. Set new password.</div>"
                show_reset_key_field = False
                show_password_field = True

        elif 'update_password' in request.POST:
            new_pwd = request.POST.get('new_password', '').strip()
            confirm_pwd = request.POST.get('confirm_password', '').strip()
            show_password_field = True

            sess_email = request.session.get('d_verified_email')

            if not request.session.get('d_reset_verified') or not sess_email:
                message = "<div class='alert-box error-box'>Session error. Start over.</div>"
                show_password_field = False
            elif not new_pwd:
                message = "<div class='alert-box error-box'>Please enter a password.</div>"
            elif new_pwd != confirm_pwd:
                message = "<div class='alert-box error-box'>Passwords do not match.</div>"
            else:
                hashed = hash_password(new_pwd)
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE tbl_delivery_boy SET password = %s, reset_key = %s WHERE email = %s",
                        [hashed, 0, sess_email]
                    )
                for key in ['d_verified_email', 'd_reset_key', 'd_reset_key_expires_at', 'd_reset_verified']:
                    request.session.pop(key, None)
                request.session['login_error'] = "<div class='alert-box success-box'>Password reset successful. Please login.</div>"
                return redirect('/delivery-boy/login')

    return render(request, 'delivery/forget.html', {
        'message': message,
        'showResetKeyField': show_reset_key_field,
        'showPasswordField': show_password_field,
    })


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@delivery_login_required
def index(request):
    username = request.session['delivery-boy']
    notifs = get_delivery_notifications(username)

    today = datetime.date.today()
    month_start = today.replace(day=1)

    with connection.cursor() as cursor:
        # Monthly salary earned
        cursor.execute(
            "SELECT COALESCE(SUM(salary), 0) FROM tbl_delivery_payment "
            "WHERE username = %s AND created_at >= %s",
            [username, month_start]
        )
        monthly_salary = float(cursor.fetchone()[0] or 0.0)

        # Total tips from reviews
        cursor.execute(
            "SELECT COALESCE(SUM(tip), 0) FROM tbl_review WHERE name = %s",
            [username]
        )
        total_tips = float(cursor.fetchone()[0] or 0.0)

        # Remaining orders (not delivered/cancelled)
        cursor.execute(
            "SELECT COUNT(*) FROM order_manager "
            "WHERE order_status NOT IN ('Delivered','Cancelled')"
        )
        remaining_orders = cursor.fetchone()[0] or 0

        # Orders delivered by me
        cursor.execute(
            "SELECT COUNT(*) FROM order_manager WHERE delivery_boy_name = %s",
            [username]
        )
        delivered_by_me = cursor.fetchone()[0] or 0

    context = {
        'monthly_salary': monthly_salary,
        'total_tips': total_tips,
        'remaining_orders': remaining_orders,
        'delivered_by_me': delivered_by_me,
    }
    context.update(notifs)
    return render(request, 'delivery/index.html', context)


@delivery_login_required
def dashboard_live_data(request):
    username = request.session['delivery-boy']

    today = datetime.date.today()
    month_start = today.replace(day=1)

    with connection.cursor() as cursor:
        # KPIs
        cursor.execute(
            "SELECT COALESCE(SUM(tip), 0) FROM tbl_review WHERE name = %s",
            [username]
        )
        total_tips = float(cursor.fetchone()[0] or 0.0)

        cursor.execute(
            "SELECT COALESCE(SUM(salary), 0) FROM tbl_delivery_payment "
            "WHERE username = %s AND created_at >= %s",
            [username, month_start]
        )
        monthly_salary = float(cursor.fetchone()[0] or 0.0)

        cursor.execute(
            "SELECT COUNT(*) FROM order_manager "
            "WHERE order_status NOT IN ('Delivered','Cancelled')"
        )
        remaining_orders = cursor.fetchone()[0] or 0

        cursor.execute(
            "SELECT COUNT(*) FROM order_manager WHERE delivery_boy_name = %s",
            [username]
        )
        delivered_by_me = cursor.fetchone()[0] or 0

        # Donut: deliveries by status (for this delivery boy)
        cursor.execute(
            "SELECT order_status, COUNT(*) AS cnt "
            "FROM order_manager WHERE delivery_boy_name = %s "
            "GROUP BY order_status ORDER BY cnt DESC LIMIT 6",
            [username]
        )
        most_sold_items = [
            {'item_name': r[0], 'total_qty': int(r[1])}
            for r in cursor.fetchall()
        ]

        # Sales by day (last 7 days) from tbl_delivery_payment
        day_keys = []
        day_totals = {}
        for i in range(6, -1, -1):
            d = today - datetime.timedelta(days=i)
            label = d.strftime('%d %b')
            key = d.strftime('%Y-%m-%d')
            day_keys.append(key)
            day_totals[key] = {'label': label, 'total': 0.0}

        start_date = today - datetime.timedelta(days=6)
        cursor.execute(
            "SELECT DATE(created_at) AS order_day, COALESCE(SUM(salary), 0) AS total_sales "
            "FROM tbl_delivery_payment WHERE username = %s "
            "AND DATE(created_at) >= %s GROUP BY DATE(created_at)",
            [username, start_date]
        )
        for r in cursor.fetchall():
            dk = str(r[0])
            if dk in day_totals:
                day_totals[dk]['total'] = float(r[1])

        sales_by_hour = [
            {'day': day_totals[k]['label'], 'total_sales': day_totals[k]['total']}
            for k in day_keys
        ]

        # Monthly revenue (last 12 months)
        month_keys = []
        month_totals = {}
        for i in range(11, -1, -1):
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            md = datetime.date(y, m, 1)
            key = md.strftime('%Y-%m')
            label = md.strftime('%b %Y')
            month_keys.append(key)
            month_totals[key] = {'label': label, 'total': 0.0}

        month_start_date = datetime.date(today.year, today.month, 1)
        for _ in range(11):
            m = month_start_date.month - 1
            y = month_start_date.year
            if m == 0:
                m = 12
                y -= 1
            month_start_date = datetime.date(y, m, 1)

        cursor.execute(
            "SELECT DATE_FORMAT(created_at, '%%Y-%%m') AS mk, COALESCE(SUM(salary), 0) AS total "
            "FROM tbl_delivery_payment WHERE username = %s AND created_at >= %s "
            "GROUP BY DATE_FORMAT(created_at, '%%Y-%%m')",
            [username, month_start_date]
        )
        for r in cursor.fetchall():
            mk = r[0]
            if mk in month_totals:
                month_totals[mk]['total'] = float(r[1])

        monthly_revenue = [
            {'month': month_totals[k]['label'], 'total_revenue': month_totals[k]['total']}
            for k in month_keys
        ]

    notifs = get_delivery_notifications(username)
    payload = {
        'success': True,
        'timestamp': datetime.datetime.now().isoformat(),
        'kpis': {
            'categories': total_tips,
            'revenue': monthly_salary,
            'orders_completed': remaining_orders,
            'menu_items': delivered_by_me,
        },
        'most_sold_items': most_sold_items,
        'sales_by_hour': sales_by_hour,
        'monthly_revenue': monthly_revenue,
    }
    payload.update(notifs)
    return JsonResponse(payload)


# ═══════════════════════════════════════════════════════════════════════════════
# ONLINE ORDERS
# ═══════════════════════════════════════════════════════════════════════════════

@delivery_login_required
def manage_online_order(request):
    username = request.session['delivery-boy']
    notifs = get_delivery_notifications(username)

    ALLOWED_STATUSES = ['Pending', 'Processing', 'OnTheWay', 'Delivered', 'Cancelled']
    status_filter = ''
    requested_status = request.GET.get('status', '').strip()
    if requested_status in ALLOWED_STATUSES:
        status_filter = requested_status

    remaining_only = request.GET.get('remaining') == '1'
    mine_only = request.GET.get('mine') == '1'

    page_title = 'Online Orders'
    if remaining_only:
        page_title = 'Delivery Remaining Orders'
    elif status_filter == 'Delivered':
        page_title = 'Completed Orders'

    # Build orders_link for breadcrumb
    params = []
    if status_filter:
        params.append(f'status={status_filter}')
    if remaining_only:
        params.append('remaining=1')
    if mine_only:
        params.append('mine=1')
    orders_link = '/delivery-boy/manage-online-order'
    if params:
        orders_link += '?' + '&'.join(params)

    # Pagination
    orders_per_page = 10
    page = max(1, int(request.GET.get('page', 1)))

    # Build WHERE conditions
    where_clauses = ['1=1']
    where_params = []

    if remaining_only and not status_filter:
        where_clauses.append("order_status IN ('Pending','Processing','OnTheWay')")
    elif status_filter:
        where_clauses.append("order_status = %s")
        where_params.append(status_filter)

    if mine_only:
        where_clauses.append("delivery_boy_name = %s")
        where_params.append(username)

    where_sql = ' AND '.join(where_clauses)

    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT COUNT(*) FROM order_manager WHERE {where_sql}",
            where_params
        )
        total_orders = cursor.fetchone()[0] or 0

    total_pages = max(1, math.ceil(total_orders / orders_per_page))
    if page > total_pages:
        page = total_pages
    offset = (page - 1) * orders_per_page

    if is_react_request(request):
        limit = int(request.GET.get('limit', 100))
        offset_val = (page - 1) * limit
        orders = _fetch_orders(where_sql, where_params, limit, offset_val)
        return JsonResponse({
            'orders': serialize_value(orders),
            'page': page,
            'total_pages': math.ceil(total_orders / limit) if limit > 0 else 1,
            'orders_per_page': limit
        })

    # AJAX pagination: return JSON
    if request.GET.get('ajax') == '1':
        orders = _fetch_orders(where_sql, where_params, orders_per_page, offset)
        rows_html = _render_order_rows(orders, username)
        return JsonResponse({
            'rows_html': rows_html,
            'current_page': page,
            'total_pages': total_pages,
        })

    # Normal page load
    orders = _fetch_orders(where_sql, where_params, orders_per_page, offset)

    # Annotate latitude/longitude for each order
    for order in orders:
        loc = order.get('location', '') or ''
        if ',' in loc:
            parts = loc.split(',', 1)
            try:
                order['latitude'] = float(parts[0].strip())
                order['longitude'] = float(parts[1].strip())
            except ValueError:
                order['latitude'] = None
                order['longitude'] = None
        else:
            order['latitude'] = None
            order['longitude'] = None

    # Flash messages
    message = request.session.pop('success', request.session.pop('error', ''))

    context = {
        'orders': orders,
        'page_title': page_title,
        'orders_link': orders_link,
        'page': page,
        'total_pages': total_pages,
        'orders_per_page': orders_per_page,
        'message': message,
    }
    context.update(notifs)
    return render(request, 'delivery/manage-online-order.html', context)


def _fetch_orders(where_sql, where_params, limit, offset):
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT order_id, cus_name, cus_add1, cus_phone, location, "
            f"payment_status, order_status, total_amount, delivery_boy_name "
            f"FROM order_manager WHERE {where_sql} "
            f"ORDER BY order_id DESC LIMIT %s OFFSET %s",
            where_params + [limit, offset]
        )
        cols = [col[0] for col in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]


def _render_order_rows(orders, current_user):
    """Generate HTML string for order table rows (used in AJAX response)."""
    from django.utils.html import escape
    rows = []
    if not orders:
        rows.append('<tr><td colspan="9">No orders found.</td></tr>')
        return ''.join(rows)

    for o in orders:
        loc = o.get('location', '') or ''
        if ',' in loc:
            parts = loc.split(',', 1)
            try:
                lat = float(parts[0].strip())
                lng = float(parts[1].strip())
                map_cell = (
                    f"<div id='map-{escape(str(o['order_id']))}' class='order-map' "
                    f"data-lat='{lat}' data-lng='{lng}'></div>"
                )
            except ValueError:
                map_cell = "Location not available."
        else:
            map_cell = "Location not available."

        ps = o.get('payment_status', '') or ''
        if ps in ('successful', 'upi'):
            pay_span = f"<span class='status completed'>{escape(ps)}</span>"
        elif ps == 'Refunded':
            pay_span = f"<span class='status pending'>{escape(ps)}</span>"
        elif ps == 'cod':
            pay_span = f"<span class='status process'>{escape(ps)}</span>"
        else:
            pay_span = f"<span class='status pending'>{escape(ps)}</span>"

        os_val = o.get('order_status', '') or ''
        if os_val == 'Pending':
            ord_span = f"<span class='status process'>{escape(os_val)}</span>"
        elif os_val == 'Processing':
            ord_span = f"<span class='status pending'>{escape(os_val)}</span>"
        elif os_val in ('OnTheWay', 'Delivered'):
            ord_span = f"<span class='status completed'>{escape(os_val)}</span>"
        elif os_val == 'Cancelled':
            ord_span = f"<span class='status cancelled'>{escape(os_val)}</span>"
        else:
            ord_span = f"<span class='status pending'>{escape(os_val)}</span>"

        dbn = o.get('delivery_boy_name', '') or ''
        oid = o.get('order_id', '')
        if os_val in ('Cancelled', 'Delivered', 'Pending'):
            action = 'No action'
        elif dbn and dbn != current_user:
            action = f"Delivery is already taken by {escape(dbn)}."
        elif not dbn:
            action = f"<a href='/delivery-boy/take-order?id={escape(str(oid))}' class='button-8'>Take Order</a>"
        elif os_val == 'OnTheWay' and dbn == current_user:
            action = f"<a href='/delivery-boy/finish-order?id={escape(str(oid))}' class='button-8'>Finish Delivery</a>"
        else:
            action = 'No action'

        rows.append(
            f"<tr>"
            f"<td>{escape(str(oid))}</td>"
            f"<td>{escape(str(o.get('cus_name','') or ''))}</td>"
            f"<td>{escape(str(o.get('cus_add1','') or ''))}</td>"
            f"<td>{escape(str(o.get('cus_phone','') or ''))}</td>"
            f"<td>{map_cell}</td>"
            f"<td>{pay_span}</td>"
            f"<td>{ord_span}</td>"
            f"<td>Rs {escape(str(o.get('total_amount','') or ''))}</td>"
            f"<td>{action}</td>"
            f"</tr>"
        )
    return ''.join(rows)


@delivery_login_required
def take_order(request):
    """Assign this delivery boy to an order and set status to OnTheWay."""
    username = request.session['delivery-boy']
    order_id = request.GET.get('id', '').strip()

    if not order_id:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'Invalid request.'}, status=400)
        request.session['error'] = 'Invalid request.'
        return redirect('/delivery-boy/manage-online-order')

    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE order_manager SET delivery_boy_name = %s, order_status = 'OnTheWay' "
            "WHERE order_id = %s",
            [username, order_id]
        )
        if cursor.rowcount > 0:
            if is_react_request(request):
                return JsonResponse({'success': True, 'message': 'Order has been taken successfully!'})
            request.session['success'] = 'Order has been taken successfully!'
        else:
            if is_react_request(request):
                return JsonResponse({'success': False, 'message': 'Failed to take the order. Please try again.'}, status=400)
            request.session['error'] = 'Failed to take the order. Please try again.'

    return redirect('/delivery-boy/manage-online-order')


@delivery_login_required
def finish_order(request):
    """Mark order as Delivered and create a tbl_delivery_payment record."""
    username = request.session['delivery-boy']
    order_id = request.GET.get('id', '').strip()

    if not order_id:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'Invalid request.'}, status=400)
        request.session['error'] = 'Invalid request.'
        return redirect('/delivery-boy/manage-online-order')

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT total_amount FROM order_manager WHERE order_id = %s",
                    [order_id]
                )
                row = cursor.fetchone()
                if not row:
                    raise Exception('Order not found.')

                total_amount = row[0]
                salary = calculate_salary(total_amount)

                cursor.execute(
                    "UPDATE order_manager SET order_status = 'Delivered' WHERE order_id = %s",
                    [order_id]
                )
                cursor.execute(
                    "INSERT INTO tbl_delivery_payment (username, salary, order_id, created_at, payment_status) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    [username, salary, order_id, datetime.datetime.now(), 'unpaid']
                )

        if is_react_request(request):
            return JsonResponse({'success': True, 'message': 'Order has been marked as delivered, and payment has been recorded!'})
        request.session['success'] = (
            'Order has been marked as delivered, and payment has been recorded!'
        )
    except Exception as e:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
        request.session['error'] = str(e)

    return redirect('/delivery-boy/manage-online-order')


# ═══════════════════════════════════════════════════════════════════════════════
# PAYMENT HISTORY
# ═══════════════════════════════════════════════════════════════════════════════

@delivery_login_required
def manage_delivery_payment(request):
    username = request.session['delivery-boy']
    notifs = get_delivery_notifications(username)

    payments = DeliveryPayment.objects.filter(username=username).order_by('-id')

    if is_react_request(request):
        return JsonResponse({
            'payments': serialize_value(list(payments))
        })

    context = {
        'payments': payments,
    }
    context.update(notifs)
    return render(request, 'delivery/manage-delivery-payment.html', context)


# ═══════════════════════════════════════════════════════════════════════════════
# REVIEWS
# ═══════════════════════════════════════════════════════════════════════════════

@delivery_login_required
def manage_review(request):
    username = request.session['delivery-boy']
    notifs = get_delivery_notifications(username)

    reviews = Review.objects.filter(name=username).order_by('-id')

    total_rating = sum((r.review_star or 0) for r in reviews)
    total_reviews = reviews.count()
    average_rating = round(total_rating / total_reviews, 1) if total_reviews > 0 else 0

    if is_react_request(request):
        return JsonResponse({
            'reviews': serialize_value(list(reviews)),
            'average_rating': average_rating
        })

    context = {
        'reviews': reviews,
        'average_rating': average_rating,
    }
    context.update(notifs)
    return render(request, 'delivery/manage-review.html', context)


# ═══════════════════════════════════════════════════════════════════════════════
# MONTHLY REVENUE
# ═══════════════════════════════════════════════════════════════════════════════

@delivery_login_required
def monthly_revenue(request):
    username = request.session['delivery-boy']
    notifs = get_delivery_notifications(username)

    today = datetime.date.today()

    # Build 12-month window
    month_keys = []
    month_totals = {}
    temp = today
    # find start of window: 11 months ago
    y, m = today.year, today.month
    for _ in range(11):
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    month_start_date = datetime.date(y, m, 1)

    y2, m2 = month_start_date.year, month_start_date.month
    for i in range(12):
        md = datetime.date(y2, m2, 1)
        key = md.strftime('%Y-%m')
        label = md.strftime('%b %Y')
        month_keys.append(key)
        month_totals[key] = {'label': label, 'total': 0.0, 'payments': 0}
        m2 += 1
        if m2 > 12:
            m2 = 1
            y2 += 1

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT DATE_FORMAT(created_at, '%%Y-%%m') AS mk, "
            "COALESCE(SUM(salary), 0) AS total_amount, COUNT(*) AS payments "
            "FROM tbl_delivery_payment WHERE username = %s AND created_at >= %s "
            "GROUP BY DATE_FORMAT(created_at, '%%Y-%%m') "
            "ORDER BY DATE_FORMAT(created_at, '%%Y-%%m')",
            [username, month_start_date]
        )
        for r in cursor.fetchall():
            mk = r[0]
            if mk in month_totals:
                month_totals[mk]['total'] = float(r[1])
                month_totals[mk]['payments'] = int(r[2])

    sorted_month_totals = [month_totals[k] for k in month_keys]

    current_month_key = today.strftime('%Y-%m')
    current_month_label = today.strftime('%B %Y')
    current_month_total = month_totals.get(current_month_key, {}).get('total', 0.0)
    current_month_payments = month_totals.get(current_month_key, {}).get('payments', 0)

    last12_total = sum(v['total'] for v in month_totals.values())
    last12_payments = sum(v['payments'] for v in month_totals.values())
    average_monthly = last12_total / 12

    # Build chart JSON
    monthly_chart_data = [['Month', 'Revenue']]
    for k in month_keys:
        monthly_chart_data.append([month_totals[k]['label'], month_totals[k]['total']])
    monthly_chart_json = json.dumps(monthly_chart_data)

    if is_react_request(request):
        return JsonResponse({
            'sorted_month_totals': serialize_value(sorted_month_totals),
            'current_month_label': current_month_label,
            'current_month_total': serialize_value(current_month_total),
            'current_month_payments': current_month_payments,
            'last12_total': serialize_value(last12_total),
            'last12_payments': last12_payments,
            'average_monthly': serialize_value(average_monthly),
            'monthly_chart_json': monthly_chart_json,
        })

    context = {
        'sorted_month_totals': sorted_month_totals,
        'current_month_label': current_month_label,
        'current_month_total': current_month_total,
        'current_month_payments': current_month_payments,
        'last12_total': last12_total,
        'last12_payments': last12_payments,
        'average_monthly': average_monthly,
        'monthly_chart_json': monthly_chart_json,
    }
    context.update(notifs)
    return render(request, 'delivery/monthly-revenue.html', context)


# ═══════════════════════════════════════════════════════════════════════════════
# SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
@delivery_login_required
def settings_view(request):
    username = request.session['delivery-boy']
    notifs = get_delivery_notifications(username)

    success_message = ''
    error_message = ''

    # Fetch current profile
    try:
        boy = DeliveryBoy.objects.get(username=username)
    except DeliveryBoy.DoesNotExist:
        if is_react_request(request):
            return JsonResponse({'success': False, 'message': 'Rider not found.'}, status=404)
        return redirect('/delivery-boy/login')

    current_name = boy.name or username
    current_image = boy.adhar_image or ''

    if request.method == 'POST':
        new_name = request.POST.get('name', '').strip()
        current_image_hidden = request.POST.get('current_image', '').strip()

        if not new_name:
            error_message = 'Name is required.'
        else:
            new_image_path = current_image_hidden
            profile_image = request.FILES.get('profile_image')

            if profile_image:
                allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
                if profile_image.content_type not in allowed_types:
                    error_message = 'Only JPG, JPEG, PNG, and WEBP images are allowed.'
                else:
                    ext = os.path.splitext(profile_image.name)[1].lower()
                    fname = f"delivery_{int(time.time())}_{random.randint(1000, 9999)}{ext}"
                    upload_dir = settings.BASE_DIR.parent / 'delivery-boy' / 'uploads'
                    os.makedirs(upload_dir, exist_ok=True)
                    fs = FileSystemStorage(location=str(upload_dir))
                    try:
                        fs.save(fname, profile_image)
                        new_image_path = f"uploads/{fname}"
                    except Exception:
                        error_message = 'Image upload failed. Please try again.'

            if not error_message:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE tbl_delivery_boy SET name = %s, adhar_image = %s WHERE username = %s",
                        [new_name, new_image_path, username]
                    )
                success_message = 'Settings updated successfully.'
                current_name = new_name
                current_image = new_image_path

        if is_react_request(request):
            if error_message:
                return JsonResponse({'success': False, 'message': error_message}, status=400)
            return JsonResponse({
                'success': True,
                'message': success_message,
                'current_name': current_name,
                'current_image': current_image
            })

    if is_react_request(request):
        return JsonResponse({
            'current_name': current_name,
            'current_image': current_image
        })

    context = {
        'current_name': current_name,
        'current_image': current_image,
        'success_message': success_message,
        'error_message': error_message,
    }
    context.update(notifs)
    return render(request, 'delivery/settings.html', context)


# ═══════════════════════════════════════════════════════════════════════════════
# UPDATE PASSWORD
# ═══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
@delivery_login_required
def update_password_view(request):
    username = request.session['delivery-boy']
    notifs = get_delivery_notifications(username)

    current_password_err = ''
    new_password_err = ''
    confirm_password_err = ''
    success_message = ''

    if request.method == 'POST':
        data = get_request_data(request)
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')

        # Fallback to POST if form data is used
        if not current_password:
            current_password = request.POST.get('current_password', '')
        if not new_password:
            new_password = request.POST.get('new_password', '')
        if not confirm_password:
            confirm_password = request.POST.get('confirm_password', '')

        if not current_password:
            current_password_err = 'Current password is required.'
        if not new_password:
            new_password_err = 'New password is required.'
        elif not (
            any(c.isupper() for c in new_password) and
            any(c.islower() for c in new_password) and
            any(c.isdigit() for c in new_password) and
            any(not c.isalnum() for c in new_password) and
            len(new_password) >= 8
        ):
            new_password_err = (
                'Password must be at least 8 characters and contain uppercase, '
                'lowercase, number, and special character.'
            )
        if not confirm_password:
            confirm_password_err = 'Please confirm your new password.'
        elif new_password != confirm_password:
            confirm_password_err = 'Passwords do not match.'

        if not current_password_err and not new_password_err and not confirm_password_err:
            try:
                boy = DeliveryBoy.objects.get(username=username)
            except DeliveryBoy.DoesNotExist:
                boy = None

            if not boy:
                current_password_err = 'User not found.'
            elif not verify_password(current_password, boy.password):
                current_password_err = 'Incorrect current password.'
            else:
                new_hashed = hash_password(new_password)
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE tbl_delivery_boy SET password = %s WHERE username = %s",
                        [new_hashed, username]
                    )
                success_message = 'Password changed successfully!'

        if is_react_request(request):
            if current_password_err or new_password_err or confirm_password_err:
                err = current_password_err or new_password_err or confirm_password_err
                return JsonResponse({'success': False, 'message': err}, status=400)
            return JsonResponse({'success': True, 'success_message': success_message})

    context = {
        'current_password_err': current_password_err,
        'new_password_err': new_password_err,
        'confirm_password_err': confirm_password_err,
        'success_message': success_message,
    }
    context.update(notifs)
    return render(request, 'delivery/update-password.html', context)
