#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load your data (Only run this ONCE, then remove or comment out this line)
python manage.py loaddata datadump_fixed.json

# Collect static files
python manage.py collectstatic --no-input
