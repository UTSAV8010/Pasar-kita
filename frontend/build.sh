# Install Python dependencies
pip install -r requirements.txt

cd react-app

npm install
npm run build

cd ..

python manage.py collectstatic --noinput
python manage.py migrate