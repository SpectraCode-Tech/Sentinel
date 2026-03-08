from django.core.management.base import BaseCommand
from django.utils.text import slugify
from news.models import Category, Tag


class Command(BaseCommand):
    help = "Seeds the database with a comprehensive set of news categories and tags"

    def handle(self, *args, **kwargs):

        categories = [
            # Hard News
            "Politics", "World", "National", "Local", "Investigative", "Legal",

            # Business
            "Economy", "Markets", "Tech", "Real Estate", "Personal Finance", "Energy",

            # Life & Culture
            "Health", "Science", "Environment", "Education", "Culture", "Arts",
            "Style", "Food", "Travel", "Wellness", "Books", "Music", "Television",

            # Sports
            "Sports", "Soccer", "Basketball", "Motorsports", "Tennis",

            # Opinion
            "Opinion", "Editorial", "Letters", "Obituaries", "Weather", "Video"
        ]

        tags = [
            # Politics
            "Elections", "White House", "Parliament", "Diplomacy",
            "Civil Rights", "Lobbying", "Public Policy", "Geopolitics",
            "Defense", "NATO",

            # Economy
            "Inflation", "Interest Rates", "Unemployment",
            "Cryptocurrency", "Stock Market", "Startups",
            "Venture Capital", "Trade War", "Logistics",

            # Technology
            "Artificial Intelligence", "Cybersecurity",
            "Social Media", "SaaS", "Robotics",
            "Quantum Computing", "Privacy", "Big Tech", "Hardware",

            # Science & Environment
            "Climate Change", "Renewable Energy", "SpaceX",
            "NASA", "Astronomy", "Genetics",
            "Sustainability", "Conservation", "Electric Vehicles",

            # Society
            "Mental Health", "Nutrition", "Pandemic",
            "Medical Research", "Parenting",
            "Aging", "Education Reform",
            "Immigration", "Urban Planning",

            # Culture
            "Streaming", "Gaming", "Fashion Week",
            "Fine Dining", "Recipes", "Luxury",
            "Hospitality", "Architecture",
            "Photography", "Podcasts",

            # Meta
            "Breaking News", "Exclusive", "Fact Check",
            "Special Report", "Long Read",
            "Analysis", "Developing Story", "Press Release"
        ]

        self.stdout.write(self.style.MIGRATE_HEADING("\n--- Seeding Categories ---"))

        created_categories = 0
        for name in categories:
            obj, created = Category.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name},
            )
            if created:
                created_categories += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {name}"))

        self.stdout.write(self.style.MIGRATE_HEADING("\n--- Seeding Tags ---"))

        created_tags = 0
        for name in tags:
            obj, created = Tag.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name},
            )
            if created:
                created_tags += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {name}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✔ Done: {created_categories} categories and {created_tags} tags created."
            )
        )