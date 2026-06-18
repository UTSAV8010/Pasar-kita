#!/usr/bin/env bash

echo "Installing Python packages..."
pip install -r requirements.txt

echo "Building React frontend..."
cd react-app

npm install
npm run build

cd ..

echo "Checking React build..."
ls -la react-app/dist || true

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Build completed successfully!"
