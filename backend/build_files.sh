#!/usr/bin/env bash
set -e

echo "Building project packages..."
python3 -m pip install -r requirements.txt

echo "Collecting static assets..."
python3 manage.py collectstatic --noinput --clear
