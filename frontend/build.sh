#!/usr/bin/env bash

echo "Installing Python packages..."
pip install -r requirements.txt

echo "Installing Node packages..."
cd react-app

npm install

echo "Building React..."
npm run build

cd ..

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Build complete."