#!/usr/bin/env bash
set -e

echo "Building project packages..."
python3 -m pip install --break-system-packages -r requirements.txt

echo "Applying database migrations..."
python3 manage.py migrate --noinput

echo "Collecting static assets..."
python3 manage.py collectstatic --noinput --clear
