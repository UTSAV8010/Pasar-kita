import os
import sys
import django
import traceback
from django.test import RequestFactory

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_ordering_project.settings')
django.setup()

from customer.views import signup_view

def test_signup():
    print("--- Running Backend Signup Debug Test ---")
    factory = RequestFactory()
    
    # Mock signup POST data
    post_data = {
        'send_signup_otp': '1',
        'name': 'Debug User',
        'username': 'debuguser123',
        'email': 'debuguser123@gmail.com',
        'phone': '9999999999',
        'city': 'Surat',
        'address': '123 Debug Street',
        'password': 'Password123!',
        'confirm_password': 'Password123!'
    }
    
    request = factory.post('/signup/', post_data)
    # Enable session middleware mock
    from django.contrib.sessions.middleware import SessionMiddleware
    middleware = SessionMiddleware(lambda r: None)
    middleware.process_request(request)
    request.session.save()
    
    try:
        response = signup_view(request)
        print("Response Status Code:", response.status_code)
        print("Response Content:", response.content.decode('utf-8')[:1000])
    except Exception as e:
        print("\n!!! SIGNUP VIEW FAILED WITH EXCEPTION !!!")
        print("Exception:", e)
        traceback.print_exc()

if __name__ == '__main__':
    test_signup()
