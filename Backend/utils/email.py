import os
import resend
import logging
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get("RESEND_API_KEY")

if not resend.api_key:
    raise ValueError("RESEND_API_KEY is not set")


def send_email(subject, message, recipient_list):
    """
    Primary: Resend API
    Fallback: Django SMTP
    """

    try:
        response = resend.Emails.send({
            "from": "The Sentinel <news@thesentinel.oladimeji.com.ng>",
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
            "text": message,
        })

        logger.info(f"Resend success: {response}")
        return True

    except Exception as e:
        logger.error(f"Resend failed: {e}")

        # --- FALLBACK (SMTP) ---
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email="The Sentinel <news@thesentinel.oladimeji.com.ng>",
                recipient_list=recipient_list,
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"SMTP fallback failed: {e}")
            return False