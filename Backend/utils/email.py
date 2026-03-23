import threading
from django.core.mail import send_mail
from django.conf import settings


def send_email_async(subject, message, recipient_list):
    def task():
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            recipient_list,
            fail_silently=True,
        )

    threading.Thread(target=task).start()