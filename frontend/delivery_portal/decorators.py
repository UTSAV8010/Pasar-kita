from django.shortcuts import redirect
from functools import wraps
from django.db import connection

def delivery_login_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        username = request.session.get('delivery-boy')
        if not username:
            request.session['no-login-message'] = "<div class='error'>Please login to access Delivery Panel</div>"
            return redirect('/delivery-boy/login')
            
        # Check if banned (user_role = 0)
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_role FROM tbl_delivery_boy WHERE username = %s", [username])
            row = cursor.fetchone()
            if row and row[0] == 0:
                request.session.flush()
                request.session['login_error'] = "<div class='error-box'>Your account has been blocked by the admin.</div>"
                return redirect('/delivery-boy/login')
                
        return view_func(request, *args, **kwargs)
    return _wrapped_view
