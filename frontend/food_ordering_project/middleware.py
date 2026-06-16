from django.http import JsonResponse, HttpResponseRedirect, HttpResponsePermanentRedirect, HttpResponse
from django.conf import settings
from django.contrib import messages
import os

class CORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle preflight options requests
        if request.method == 'OPTIONS':
            response = HttpResponse()
        else:
            response = self.get_response(request)
            
        origin = request.headers.get('Origin')
        if origin in ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, Accept, X-React-App, X-Requested-With, Authorization'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            
        return response


class JSONResponseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        accept_header = request.headers.get('Accept', '')
        wants_json = 'application/json' in accept_header or request.GET.get('format') == 'json' or request.headers.get('X-React-App') == 'true'
        
        path = request.path
        is_ignored = (
            path.startswith('/static/') or 
            path.startswith('/images/') or 
            path.startswith('/django-admin/') or
            path.startswith('/uploads/') or
            path.startswith('/restro/uploads/') or
            path.startswith('/delivery-boy/uploads/')
        )
        
        response = self.get_response(request)
        
        if wants_json and not is_ignored:
            # Check if it was a redirect response
            if isinstance(response, (HttpResponseRedirect, HttpResponsePermanentRedirect)):
                redirect_url = response['Location']
                
                # Fetch pending django messages if any
                msg_list = []
                storage = messages.get_messages(request)
                for msg in storage:
                    msg_list.append({'message': msg.message, 'tags': msg.tags})
                    
                return JsonResponse({
                    'status': 'redirect',
                    'redirect': redirect_url,
                    'messages': msg_list
                }, status=200) # Use 200 so AJAX clients receive the JSON payload instead of browser automatically redirection
                
        return response


class ReactSPAMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        
        # Check if the path should be ignored (e.g. Django admin, static, media, dynamic uploads)
        is_ignored = (
            path.startswith('/static/') or 
            path.startswith('/images/') or 
            path.startswith('/django-admin/') or
            path.startswith('/uploads/') or
            path.startswith('/restro/uploads/') or
            path.startswith('/delivery-boy/uploads/')
        )
        
        accept_header = request.headers.get('Accept', '')
        wants_json = 'application/json' in accept_header or request.GET.get('format') == 'json' or request.headers.get('X-React-App') == 'true'
        
        # If it doesn't want JSON, is not ignored, and accepts HTML (standard page visit)
        if not wants_json and not is_ignored and 'text/html' in accept_header:
            # Serve the React built index.html from frontend/react-app/dist/index.html
            index_path = os.path.join(settings.BASE_DIR, 'react-app', 'dist', 'index.html')
            if os.path.exists(index_path):
                with open(index_path, 'r', encoding='utf-8') as f:
                    return HttpResponse(f.read(), content_type='text/html')
            else:
                # If not built yet, return a simple elegant dev loading screen so browser page loads don't error out
                return HttpResponse(
                    """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Pasar-kita API Backend</title>
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                            .card { background: #1e293b; padding: 2.5rem; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); max-width: 500px; }
                            h1 { color: #f59e0b; margin-top: 0; }
                            p { line-height: 1.6; color: #94a3b8; }
                            code { background: #0f172a; padding: 0.2rem 0.5rem; border-radius: 6px; color: #38bdf8; font-family: monospace; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h1>React SPA Dev Mode Active</h1>
                            <p>Django is running as the API Backend. The React production build <code>react-app/dist/index.html</code> was not found.</p>
                            <p>For development, start the Vite server:</p>
                            <p><code>cd react-app && npm run dev</code></p>
                            <p>And open your browser at <code>http://localhost:3000</code>.</p>
                        </div>
                    </body>
                    </html>
                    """,
                    status=200
                )
                
        return self.get_response(request)
