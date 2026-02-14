# news/utils.py
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

User = get_user_model()

def notify_editors_new_draft(article):
    # Get all staff users (editors)
    editors = User.objects.filter(is_staff=True)
    emails = [editor.email for editor in editors if editor.email]
    
    if not emails:
        return
    
    subject = f"New Draft Submitted: {article.title}"
    message = (
        f"A new article draft has been submitted by {article.author.username}.\n\n"
        f"Title: {article.title}\n"
        f"Category: {article.category}\n"
        f"Preview: {article.excerpt}\n\n"
        f"Please review and publish if approved."
    )
    send_mail(subject, message, None, emails)


def notify_author_article_published(article):
    """
    Notify the author when their draft/article is published.
    """
    if article.author.email:
        subject = f"Your Article Has Been Published: {article.title}"
        message = (
            f"Hi {article.author.username},\n\n"
            f"Your article titled '{article.title}' has been published.\n"
            f"Category: {article.category}\n\n"
            f"You can view it now on the site."
        )
        send_mail(subject, message, None, [article.author.email])
