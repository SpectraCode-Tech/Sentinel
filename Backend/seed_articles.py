import requests
import random
import string
from datetime import datetime, timedelta

# --- CONFIGURATION ---
API_BASE_URL = "http://localhost:8000/api" 
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcyMjg1NDY3LCJpYXQiOjE3NzIyNzgyNjcsImp0aSI6IjI0ODI5MTA3Y2JlMDQ5NTFiM2YzNWYwZTk1MmZjYjlhIiwidXNlcl9pZCI6IjMiLCJyb2xlIjoiSk9VUk5BTElTVCIsInVzZXJuYW1lIjoibGFucmUiLCJpc19zdGFmZiI6ZmFsc2V9.6-AmMMpcdzNNh0uJgI0NMDTtGJXRYNuVRvsGUMBYaAY"
HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}", "Content-Type": "application/json"}

# Global variables to hold DB relations
CATEGORIES = []
TAG_MAP = {}

# --- MEANINGFUL CONTENT TEMPLATES ---
TOPICS = [
    # 1. Space Exploration
    {"category": "Space", "titles": ["The Race for Lunar Water Ice", "Mars Colonization: A One-Way Trip?"], "leads": ["The Moon is no longer a destination; it's a gas station for the stars."], "tags": ["Space", "Cosmos", "Science"]},
    # 2. Artificial Intelligence
    {"category": "AI & Ethics", "titles": ["The Ghost in the Machine: AI Consciousness", "When Algorithms Hire and Fire"], "leads": ["The line between human intuition and machine logic is blurring."], "tags": ["AI", "Ethics", "Tech"]},
    # 3. Environment & Climate
    {"category": "Sustainability", "titles": ["The Desalination Revolution", "Vertical Farming in the Desert"], "leads": ["Securing our planet's future requires radical engineering."], "tags": ["Green", "Climate", "Nature"]},
    # 4. Modern Health
    {"category": "Bio-Tech", "titles": ["CRISPR: Editing Out Genetic Disease", "The Rise of Personalized Medicine"], "leads": ["Your DNA is the new source code for your healthcare."], "tags": ["Health", "Bio", "Science"]},
    # 5. Global Economics
    {"category": "Economics", "titles": ["The Decline of the Petrodollar", "Universal Basic Income: The Great Experiment"], "leads": ["Traditional fiscal policy is meeting the reality of an automated world."], "tags": ["Money", "Global", "Policy"]},
    # 6. Psychology & Mind
    {"category": "Psychology", "titles": ["The Neurobiology of Focus", "Why Loneliness is a Modern Epidemic"], "leads": ["Understanding the brain's hardware in a software-driven world."], "tags": ["Mind", "Wellness", "Society"]},
    # 7. Architecture & Urbanism
    {"category": "Urban Design", "titles": ["The 15-Minute City Utopia", "Brutalism's Surprising Comeback"], "leads": ["How we build our cities defines how we relate to each other."], "tags": ["Urban", "Design", "Living"]},
    # 8. Cybersecurity
    {"category": "Cybersecurity", "titles": ["The Post-Quantum Encryption Crisis", "Shadow Brokers: The New Age of Spying"], "leads": ["The next world war won't be fought with bullets, but with bits."], "tags": ["Security", "Web", "Defense"]},
    # 9. Education
    {"category": "Education", "titles": ["The Death of the Traditional Degree", "Gamifying the Classroom"], "leads": ["Learning is shifting from a four-year sprint to a lifelong marathon."], "tags": ["Learning", "Future", "Skills"]},
    # 10. Automotive & Transit
    {"category": "Transportation", "titles": ["The Hyperloop's Final Hurdle", "Are Hydrogen Cars Finally Ready?"], "leads": ["The internal combustion engine is entering its twilight years."], "tags": ["Auto", "Transit", "Energy"]},
    # 11. Gastronomy & Food
    {"category": "Food Science", "titles": ["Lab-Grown Meat: From Petri Dish to Plate", "The Future of Ancient Grains"], "leads": ["Feeding ten billion people requires rethinking the farm."], "tags": ["Food", "Science", "Agri"]},
    # 12. History & Archeology
    {"category": "Archeology", "titles": ["Lidar: Mapping the Jungle’s Secrets", "The Genetic History of Lost Tribes"], "leads": ["High-tech tools are rewriting the first chapters of human history."], "tags": ["History", "Discovery", "Humanity"]},
    # 13. Sports & Performance
    {"category": "Sports Science", "titles": ["The Ethics of Bio-Hacked Athletes", "Data Analytics: The New MVP"], "leads": ["Athletic performance is now a battle of margins and metrics."], "tags": ["Sports", "Data", "Health"]},
    # 14. Philosophy
    {"category": "Philosophy", "titles": ["Stoicism for the Digital Age", "The Simulation Hypothesis Revisited"], "leads": ["Ancient wisdom meets modern existential dread."], "tags": ["Ideas", "Logic", "Life"]},
    # 15. Gaming & Esports
    {"category": "Gaming", "titles": ["The Metaverse's Identity Crisis", "Esports: The New Olympic Frontier"], "leads": ["Digital worlds are becoming more real than our physical ones."], "tags": ["Games", "Digital", "Play"]},
    # 16. Fashion & Style
    {"category": "Fashion", "titles": ["Digital Twins: Dressing Your Avatar", "The High Cost of Fast Fashion"], "leads": ["What we wear is a statement of our ethics and our aesthetics."], "tags": ["Style", "Art", "Retail"]},
    # 17. Marine Biology
    {"category": "Oceanography", "titles": ["Mining the Deep Sea Floor", "The Secret Language of Whales"], "leads": ["The last frontier on Earth is under our feet, beneath the waves."], "tags": ["Ocean", "Nature", "Earth"]},
    # 18. Entertainment & Media
    {"category": "Media", "titles": ["The Streaming Wars: Fatigue Sets In", "The Return of the Cinema Experience"], "leads": ["How we consume stories is changing as fast as the stories themselves."], "tags": ["Movies", "TV", "Art"]},
    # 19. Parenting & Family
    {"category": "Family", "titles": ["Raising Alpha: The First iPad Generation", "The Rise of Multi-Generational Living"], "leads": ["The family unit is evolving to survive a shifting economy."], "tags": ["Society", "Home", "Kids"]},
    # 20. Retail & Commerce
    {"category": "Retail", "titles": ["The End of the Checkout Line", "Drones: The Last Mile of Delivery"], "leads": ["Shopping is becoming invisible, frictionless, and instant."], "tags": ["Business", "Tech", "Buy"]},
    # 21. Energy
    {"category": "Energy", "titles": ["Nuclear Fusion: Five Minutes to Midnight?", "The Solid-State Battery Breakthrough"], "leads": ["The quest for clean, infinite energy is reaching a fever pitch."], "tags": ["Power", "Physics", "Future"]},
    # 22. Law & Justice
    {"category": "Law", "titles": ["Copyright in the Age of AI", "Space Law: Who Owns the Moon?"], "leads": ["Our legal systems are struggling to keep up with innovation."], "tags": ["Legal", "Rights", "Policy"]},
    # 23. Sociology
    {"category": "Sociology", "titles": ["The Death of the Third Place", "Why Minimalist Living is Growing"], "leads": ["How we interact in public spaces defines our communal health."], "tags": ["People", "Society", "Groups"]},
    # 24. Astronomy
    {"category": "Astronomy", "titles": ["James Webb's First Look at the Big Bang", "Dark Matter: The Missing 95%"], "leads": ["The universe is speaking, and we are finally learning to listen."], "tags": ["Stars", "Science", "Space"]},
    # 25. Aviation
    {"category": "Aviation", "titles": ["Supersonic Travel: The Return of Concorde?", "Electric Planes: Short-Haul Success"], "leads": ["Flight is getting faster, quieter, and greener."], "tags": ["Flight", "Travel", "Tech"]},
    # 26. Remote Work
    {"category": "Work Culture", "titles": ["The Digital Nomad Tax Haven", "VR Offices: Better Than the Real Thing?"], "leads": ["The office is no longer a place; it's a state of mind."], "tags": ["Work", "Jobs", "Digital"]},
    # 27. Crypto & Blockchain
    {"category": "Crypto", "titles": ["The Rise of CBDCs", "NFTs: Beyond the Hype to Utility"], "leads": ["The very definition of 'value' is being recoded."], "tags": ["Crypto", "Web3", "Finance"]},
    # 28. Linguistics
    {"category": "Linguistics", "titles": ["The Death of Indigenous Languages", "How Emojis Changed Grammar"], "leads": ["Language is the most fluid technology we possess."], "tags": ["Language", "Culture", "Communication"]},
    # 29. Disaster Prep
    {"category": "Resilience", "titles": ["Prepping for the Next Pandemic", "The Global Seed Vault: Earth's Backup"], "leads": ["Sustainability is good, but resilience is better."], "tags": ["Safety", "Future", "Survival"]},
    # 30. Music
    {"category": "Music", "titles": ["AI Composers and the Billboard 100", "The Revival of High-Fidelity Audio"], "leads": ["The way we hear the world is being reshaped by algorithms."], "tags": ["Music", "Audio", "Art"]}
]
def setup_relations():
    """Fetches categories and tags from the DB to get their real IDs."""
    global CATEGORIES, TAG_MAP
    print("🔍 Syncing with database categories and tags...")
    
    try:
        # Fetch Categories
        cat_res = requests.get(f"{API_BASE_URL}/articles/categories/", headers=HEADERS)
        if cat_res.status_code == 200:
            data = cat_res.json()
            cats = data.get('results', data) if isinstance(data, dict) else data
            CATEGORIES = [c['id'] for c in cats]
        
        # Fetch Tags
        tag_res = requests.get(f"{API_BASE_URL}/articles/tags/", headers=HEADERS)
        if tag_res.status_code == 200:
            data = tag_res.json()
            tags = data.get('results', data) if isinstance(data, dict) else data
            TAG_MAP = {t['name'].lower(): t['id'] for t in tags} # Use lowercase for easier matching
            
        if not CATEGORIES:
            print("❌ No categories found. Please create categories in Django Admin first.")
            return False
        return True
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def generate_content():
    topic = random.choice(TOPICS)
    title = random.choice(topic["titles"])
    lead = random.choice(topic["leads"])
    
    # Flesh out the body with a bit more substance
    body = f"{lead}\n\n"
    body += "Recent investigations by The Sentinel have uncovered a series of developments that challenge the status quo. "
    body += "Experts from various sectors weigh in, suggesting that the implications of these shifts will be felt for decades to come. "
    body += "\n\n\"We are looking at a fundamental change in how the system operates,\" says Dr. Aris Thorne, a leading consultant in the field. "
    body += "As the situation continues to evolve, the public is left wondering whether current regulations are enough to maintain order."
    body += "\n\nIn the coming months, we expect to see more transparency as stakeholders demand accountability. Stay tuned for further updates."
    
    return title, body, topic["tags"]

def seed_articles(count=50):
    if not setup_relations():
        return

    print(f"🏗️  Seeding {count} meaningful articles into the Newsroom...")
    
    for i in range(1, count + 1):
        title, content, theme_tags = generate_content()
        
        # Match template tags to DB IDs (case-insensitive)
        tag_ids = [TAG_MAP[t.lower()] for t in theme_tags if t.lower() in TAG_MAP]
        
        # Fallback if no tags match: pick a random one from DB
        if not tag_ids and TAG_MAP:
            tag_ids = [random.choice(list(TAG_MAP.values()))]

        # Generate a unique slug
        slug = f"{title.lower().replace(' ', '-')}-{random.randint(1000, 9999)}"[:50]

        payload = {
            "title": title,
            "slug": slug,
            "content": content,
            "status": "published",
            "category": random.choice(CATEGORIES),
            "tags": tag_ids,
            "image_url": f"https://picsum.photos/seed/{random.randint(1, 10000)}/1200/800",
            "view_count": random.randint(150, 15000),
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 60))).isoformat()
        }

        try:
            res = requests.post(f"{API_BASE_URL}/articles/articles/", json=payload, headers=HEADERS)
            if res.status_code in [200, 201]:
                print(f"[{i}/{count}] ✅ {title}")
            else:
                print(f"[{i}/{count}] ❌ Failed: {res.text}")
        except Exception as e:
            print(f"⚠️ Error on item {i}: {e}")

if __name__ == "__main__":
    seed_articles(50)