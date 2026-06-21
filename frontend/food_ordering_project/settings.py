import os
from pathlib import Path
import pymysql
import dj_database_url

from dotenv import load_dotenv

# Build paths inside the project

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env AFTER BASE_DIR exists
load_dotenv(BASE_DIR / ".env", override=True)

# Integrate PyMySQL as MySQLdb
pymysql.install_as_MySQLdb()

# Bypass minimum MariaDB/MySQL version check of Django
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# Disable RETURNING syntax for older MySQL/MariaDB versions
from django.db.backends.mysql.features import DatabaseFeatures
DatabaseFeatures.has_returning_fields = False
DatabaseFeatures.can_return_columns_from_insert = False
DatabaseFeatures.can_return_rows_from_bulk_insert = False




# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = [
    "pasar-kita.onrender.com",
    "*"
]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'customer',
    'admin_portal',
    'restro_portal',
    'delivery_portal',
]

MIDDLEWARE = [
    'food_ordering_project.middleware.CORSMiddleware',
    'food_ordering_project.middleware.ReactSPAMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'food_ordering_project.middleware.JSONResponseMiddleware',
]

ROOT_URLCONF = 'food_ordering_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'food_ordering_project.wsgi.application'

# Database Settings
DATABASE_URL_VAL = os.getenv("DATABASE_URL", "")
DATABASES = {
    "default": dj_database_url.config(
        default=DATABASE_URL_VAL if DATABASE_URL_VAL else f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=False if '127.0.0.1' in DATABASE_URL_VAL or 'localhost' in DATABASE_URL_VAL or not DATABASE_URL_VAL else True,
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = False  # Set to False to keep datetime compatibility with PHP database entries

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files configuration to share the central images directory
MEDIA_URL = '/images/'
MEDIA_ROOT = BASE_DIR.parent / 'images'

# Email / SMTP configuration
EMAIL_BACKEND = os.getenv(
    'EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend'
)
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'utsavsarvaliya27@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'vedmjmfeekiwpdmw')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Pasar-kita <utsavsarvaliya27@gmail.com>')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Google Maps API Key
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', 'AIzaSyDYSBlQ9HF7MqndLVihj3QTJKh6tHbBOUQ')

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
