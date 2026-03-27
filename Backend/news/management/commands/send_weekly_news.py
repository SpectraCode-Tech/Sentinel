from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.core.mail import send_mail # ADD THIS
from django.conf import settings        # ADD THIS
from news.models import Article
from utils.email import send_email
from django.db.models import Count

User = get_user_model()

class Command(BaseCommand):
    help = "Send weekly trending news based on actual unique views"

    def handle(self, *args, **kwargs):
        last_week = timezone.now() - timedelta(days=7)

        # 1. Fetch top 5 articles
        trending_articles = (
            Article.objects.filter(
                status="published",
                is_deleted=False,
                ip_views__viewed_at__gte=last_week
            )
            .annotate(weekly_views=Count('ip_views', distinct=True))
            .order_by('-weekly_views')[:5]
        )

        if not trending_articles:
            self.stdout.write(self.style.WARNING("No trending articles found."))
            return

        base_url = "https://thesentinel.oladimeji.com.ng/articles" 
        content = "\n".join([f"🔥 {a.title} - {base_url}/{a.slug}" for a in trending_articles])
        
        emails = list(User.objects.filter(is_active=True)
                                 .exclude(email="")
                                 .values_list('email', flat=True))

        if not emails:
            self.stdout.write("No eligible users found.")
            return

        # --- THE SYNC TEST (Now inside the handle method) ---
        self.stdout.write("Attempting direct sync send...")
        try:
            self.stdout.write(self.style.SUCCESS("Sync send finished! Check your inbox/spam."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Sync send failed: {e}"))
            return # Stop here if the sync test fails
        # ----------------------------------------------------

        # 4. Start the async thread for the real newsletter
        self.stdout.write(f"Starting background dispatch to {len(emails)} users...")
        email_thread = send_email(
            subject="📰 The Sentinel Weekly: Top Stories",
            message=f"Stay informed with the most-read stories this week:\n\n{content}\n\nHappy reading!",
            recipient_list=emails
        )
    
        self.stdout.write("Connecting to SMTP server...")
        email_thread.join(timeout=30) 
        
        if email_thread.is_alive():
            self.stdout.write(self.style.ERROR("Email thread timed out."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully sent to {len(emails)} users."))