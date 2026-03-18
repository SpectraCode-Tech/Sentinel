import os
from pathlib import Path
from datetime import timedelta

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')
BASE_DIR = Path(__file__).resolve().parent.parent
# Add this line to your settings.py
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
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",

    "rest_framework",
    "rest_framework_simplejwt",
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    "channels",

    "accounts",
    "news",
    "analytics",
    "ads",
    "comments",
]

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

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
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

TIME_ZONE = "UTC"
USE_TZ = True