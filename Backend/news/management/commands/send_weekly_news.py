from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from news.models import Article, ArticleView # Import ArticleView
from utils.email import send_email_async
from django.db.models import Count

User = get_user_model()

class Command(BaseCommand):
    help = "Send weekly trending news based on actual views"

    def handle(self, *args, **kwargs):
        last_week = timezone.now() - timedelta(days=7)

        # Better Logic: Top 5 articles based on VIEWS in the last 7 days
        # regardless of when they were originally published
        trending_articles = (
            Article.objects.filter(
                status="published",
                is_deleted=False,
                ip_views__viewed_at__gte=last_week # Filter views by time
            )
            .annotate(weekly_views=Count('ip_views'))
            .order_by('-weekly_views')[:5]
        )

        if not trending_articles:
            self.stdout.write(self.style.WARNING("No trending articles found for the last 7 days."))
            return

        # Formatting content
        content = "\n".join([f"🔥 {a.title} - https://sentinel.com/api/articles/{a.slug}" for a in trending_articles])
        
        # Use .values_list for better memory performance
        emails = list(User.objects.filter(is_active=True).exclude(email="").values_list('email', flat=True))

        if emails:
            # Tip: If your send_email_async doesn't handle BCC or Chunking, 
            # consider looping or sending a single BCC email.
            send_email_async(
                subject="📰 The Sentinel Weekly: Top Stories",
                message=f"Stay informed with the most-read stories this week:\n\n{content}\n\nHappy reading!",
                recipient_list=emails
            )
            self.stdout.write(self.style.SUCCESS(f"Newsletter dispatched to {len(emails)} users."))
        else:
            self.stdout.write("No eligible users found.")