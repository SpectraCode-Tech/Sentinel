from django.core.mail import EmailMessage
import threading
from django.conf import settings

def send_email_async(subject, message, recipient_list):
    def task():
        # Using EmailMessage instead of send_mail for BCC support
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.EMAIL_HOST_USER,
            to=[settings.EMAIL_HOST_USER], # Send "To" yourself
            bcc=recipient_list,            # Everyone else is hidden in BCC
        )
        email.send(fail_silently=True)

    thread = threading.Thread(target=task)
    thread.start()
    return thread # Return the thread so the caller can wait if needed