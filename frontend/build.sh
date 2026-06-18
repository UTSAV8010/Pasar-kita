#!/usr/bin/env bash

echo "Installing Python packages..."
pip install -r requirements.txt

echo "Building React frontend..."
cd react-app

npm install
npm run build

cd ..

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running database migrations..."
python manage.py migrate

echo "Build completed successfully!"