import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# 1. Load Environment Variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

# 2. Basic Configuration
ROOT_URLCONF = "Backend.urls"
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-fallback-key-change-this")
DEBUG = os.getenv("DEBUG", "True") == "True"

# 3. Hosts Configuration
# Always allow local for development
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
]

# Add production domains from Environment
BACKEND_DOMAIN = os.getenv("BACKEND_DOMAIN")
RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')

if BACKEND_DOMAIN:
    ALLOWED_HOSTS.append(BACKEND_DOMAIN)
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# 4. CORS & CSRF (Frontend Links)
FRONTEND_URL = os.getenv("FRONTEND_URL")
STAFF_URL = os.getenv("STAFF_URL")

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    STAFF_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
]

CSRF_TRUSTED_ORIGINS = [
    FRONTEND_URL,
    STAFF_URL,
    f"https://{BACKEND_DOMAIN}" if BACKEND_DOMAIN else None,
]

CORS_ALLOW_CREDENTIALS = True

# 5. HTTPS & Security Settings (Fixed for Mixed Content)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # Force absolute HTTPS for media to avoid browser blocks
    MEDIA_URL = f"https://{BACKEND_DOMAIN}/media/"
else:
    SECURE_SSL_REDIRECT = False
    MEDIA_URL = "/media/"

# 6. Application Definition
INSTALLED_APPS = [
    "daphne", # Must be at the top for ASGI
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "channels",
    "accounts",
    "news",
    "analytics",
    "ads",
    "comments",
]

# 7. Channel Layers (WebSockets/Redis)
REDIS_URL = os.getenv('REDIS_URL')
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
        },
    }
}

ASGI_APPLICATION = "Backend.asgi.application"
AUTH_USER_MODEL = "accounts.User"

# 8. Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 9. Middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware", # Handles static files on Render
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# 10. Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# 11. REST Framework & JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# 12. Static & Media Files
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# 13. Internationalization
TIME_ZONE = "UTC"
USE_TZ = True