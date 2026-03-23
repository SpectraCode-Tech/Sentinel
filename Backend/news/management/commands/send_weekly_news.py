from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from news.models import Article
from utils.email import send_email_async

User = get_user_model()


class Command(BaseCommand):
    help = "Send weekly trending news"

    def handle(self, *args, **kwargs):
        last_week = timezone.now() - timedelta(days=7)

        articles = Article.objects.filter(
            status="published",
            publish_at__gte=last_week
        ).order_by('-view_count')[:5]

        if not articles:
            self.stdout.write("No trending articles found")
            return

        content = "\n".join([f"- {a.title}" for a in articles])

        users = User.objects.exclude(email="")

        emails = [user.email for user in users]

        if emails:
            send_email_async(
                subject="📰 Weekly Trending News",
                message=f"Top stories this week:\n\n{content}",
                recipient_list=emails
            )

        self.stdout.write(self.style.SUCCESS("Weekly emails sent"))