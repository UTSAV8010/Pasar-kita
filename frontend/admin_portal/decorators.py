from django.shortcuts import redirect
from django.http import JsonResponse
from functools import wraps

def admin_login_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get('user-admin'):
            wants_json = (
                request.headers.get('X-React-App') == 'true'
                or 'application/json' in request.headers.get('Accept', '')
                or request.GET.get('format') == 'json'
            )
            if wants_json:
                return JsonResponse({'status': 'redirect', 'redirect': '/admin/login'}, status=401)
            request.session['no-login-message'] = "<div class='error'>Please login to access Admin Panel</div>"
            return redirect('/admin/login')
        return view_func(request, *args, **kwargs)
    return _wrapped_view
