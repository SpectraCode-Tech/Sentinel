import os
import resend
import logging
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get("RESEND_API_KEY")


def send_email(subject, message, recipient_list):
    """
    Primary: Resend API
    Fallback: Django SMTP
    """

    try:
        # --- RESEND (Primary) ---
        params = {
            "from": "The Sentinel <onboarding@resend.dev>",  # change later
            "to": recipient_list,
            "subject": subject,
            "html": f"""
            <div style="font-family: Arial; padding:20px;">
            <h2 style="color:#111;">The Sentinel</h2>
            <p>{message}</p>
            <hr/>
            <small style="color:gray;">Trusted News. Unfiltered Truth.</small>
            </div>
            """,
        }

        resend.Emails.send(params)
        return True

    except Exception as e:
        logger.error(f"Resend failed: {e}")

        # --- FALLBACK (SMTP) ---
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=None,
                recipient_list=recipient_list,
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"SMTP fallback failed: {e}")
            return False