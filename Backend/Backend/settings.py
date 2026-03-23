import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
import cloudinary

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')
BASE_DIR = Path(__file__).resolve().parent.parent

ROOT_URLCONF = "Backend.urls"

SECRET_KEY = "Z3vi7gVR4c8mDjhZEcSRylwoLVHw7m-0TK-NtsyZfC8"

DEBUG = True

ALLOWED_HOSTS = [    
    "sentinel-ou6m.onrender.com",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    ]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sentinel-pi-one.vercel.app",
    "https://sentinel-staff.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "https://sentinel-pi-one.vercel.app",
    "https://sentinel-staff.vercel.app",
    "https://sentinel-ou6m.onrender.com",
]

CORS_ALLOW_CREDENTIALS = True

INSTALLED_APPS = [
    "daphne",
    'cloudinary_storage',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "corsheaders",

    "rest_framework",
    "rest_framework_simplejwt",
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    "channels",
    'cloudinary',
    'django.contrib.staticfiles',
    

    "accounts",
    "news",
    "analytics",
    "ads",
    "comments",
    "utils",
]

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(REDIS_URL)],
        },

    }
}

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUD_NAME'),
    'API_KEY': os.environ.get('API_KEY'),
    'API_SECRET': os.environ.get('API_SECRET')
}


cloudinary.config(
    cloud_name=CLOUDINARY_STORAGE['CLOUD_NAME'],
    api_key=CLOUDINARY_STORAGE['API_KEY'],
    api_secret=CLOUDINARY_STORAGE['API_SECRET'],
    secure=True
)

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

ASGI_APPLICATION = "Backend.asgi.application"

AUTH_USER_MODEL = "accounts.User"

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        ssl_require=True
    )
}


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

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

STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com' # Or your provider
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True

TIME_ZONE = "UTC"
USE_TZ = True