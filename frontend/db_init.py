import os
import sys
import re
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_ordering_project.settings')
django.setup()

from django.db import connection

def initialize_database():
    print("--- Starting database initialization check ---")
    
    with connection.cursor() as cursor:
        # Check if tbl_category exists (if it does, database is already initialized)
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tbl_category');")
        exists = cursor.fetchone()[0]
        
        if exists:
            print("Database is already initialized. Skipping schema creation and data import.")
            return

        print("Tables not found. Initializing PostgreSQL schema...")
        
        # 1. Create all tables with PostgreSQL-compatible syntax
        schemas = [
            """
            CREATE TABLE IF NOT EXISTS aamarpay (
              id SERIAL PRIMARY KEY,
              cus_name TEXT NOT NULL,
              amount INTEGER NOT NULL,
              status VARCHAR(100) NOT NULL,
              pay_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              transaction_id VARCHAR(100) NOT NULL,
              card_type VARCHAR(100) NOT NULL,
              order_id INTEGER DEFAULT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS message (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL,
              phone BIGINT NOT NULL,
              subject VARCHAR(100) NOT NULL,
              message TEXT NOT NULL,
              message_status VARCHAR(100) NOT NULL,
              date TIMESTAMP NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS online_orders_new (
              order_id INTEGER NOT NULL,
              "Item_Name" VARCHAR(100) NOT NULL,
              "Price" INTEGER NOT NULL,
              "Quantity" INTEGER NOT NULL,
              restro_name VARCHAR(255) NOT NULL DEFAULT 'Pasar Kita',
              total_amount DECIMAL(10,2) NOT NULL DEFAULT '0.00'
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS order_manager (
              order_id SERIAL PRIMARY KEY,
              username VARCHAR(100) NOT NULL,
              cus_name TEXT NOT NULL,
              cus_email VARCHAR(100) NOT NULL,
              cus_add1 VARCHAR(100) NOT NULL,
              cus_city TEXT NOT NULL,
              cus_phone BIGINT NOT NULL,
              location VARCHAR(255) DEFAULT NULL,
              delivery_boy_name VARCHAR(255) DEFAULT NULL,
              payment_status VARCHAR(100) NOT NULL,
              order_date TIMESTAMP NOT NULL,
              total_amount INTEGER NOT NULL,
              transaction_id VARCHAR(100) NOT NULL,
              order_status VARCHAR(100) NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_admin (
              id SERIAL PRIMARY KEY,
              full_name VARCHAR(100) NOT NULL,
              email VARCHAR(120) NOT NULL,
              username VARCHAR(100) NOT NULL,
              password VARCHAR(255) NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_category (
              id SERIAL PRIMARY KEY,
              title VARCHAR(100) NOT NULL,
              image_name VARCHAR(255) NOT NULL,
              featured VARCHAR(10) NOT NULL,
              active VARCHAR(10) NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_coupon (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              coupon_code VARCHAR(100) NOT NULL,
              created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              status VARCHAR(20) NOT NULL,
              discount DECIMAL(5,2) NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_delivery_boy (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              username VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              mobile_number VARCHAR(15) NOT NULL,
              password VARCHAR(255) NOT NULL,
              user_role SMALLINT NOT NULL,
              status VARCHAR(20) DEFAULT 'not_verified',
              adhar_image VARCHAR(255) NOT NULL,
              address TEXT NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_delivery_payment (
              id SERIAL PRIMARY KEY,
              username VARCHAR(255) NOT NULL,
              salary DECIMAL(10,2) NOT NULL,
              payment_status VARCHAR(20) DEFAULT 'unpaid',
              order_id INTEGER NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_eipay (
              id SERIAL PRIMARY KEY,
              table_id VARCHAR(50) NOT NULL,
              amount DECIMAL(10,2) NOT NULL,
              tran_id VARCHAR(50) NOT NULL,
              order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              payment_status VARCHAR(50) NOT NULL,
              order_status VARCHAR(100) NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_fest_coupon (
              id SERIAL PRIMARY KEY,
              festival_name VARCHAR(255) NOT NULL,
              coupon_code VARCHAR(50) NOT NULL,
              created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              duration INTEGER NOT NULL,
              expire VARCHAR(20) NOT NULL DEFAULT 'active',
              status VARCHAR(20) NOT NULL,
              discount DECIMAL(10,2) NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_food (
              id SERIAL PRIMARY KEY,
              title VARCHAR(100) NOT NULL,
              description TEXT NOT NULL,
              price DECIMAL(10,2) NOT NULL,
              restro_name VARCHAR(255) NOT NULL DEFAULT 'Pasar Kita',
              image_name VARCHAR(255) NOT NULL,
              category_id INTEGER NOT NULL,
              featured VARCHAR(10) NOT NULL,
              active VARCHAR(10) NOT NULL,
              stock INTEGER NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_order (
              id SERIAL PRIMARY KEY,
              transaction_id VARCHAR(150) NOT NULL,
              total DECIMAL(10,2) NOT NULL,
              order_date TIMESTAMP NOT NULL,
              status VARCHAR(50) NOT NULL,
              customer_name VARCHAR(150) NOT NULL,
              customer_contact VARCHAR(20) NOT NULL,
              customer_email VARCHAR(150) NOT NULL,
              customer_address VARCHAR(200) NOT NULL
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_rcategory_notapproved (
              cid SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              image_name VARCHAR(255) DEFAULT NULL,
              featured VARCHAR(10) NOT NULL DEFAULT 'No',
              active VARCHAR(10) NOT NULL DEFAULT 'No',
              status VARCHAR(20) NOT NULL DEFAULT 'not_approved',
              restro_name VARCHAR(255) NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_restro (
              id SERIAL PRIMARY KEY,
              restro_name VARCHAR(255) NOT NULL,
              username VARCHAR(255) NOT NULL,
              restro_address TEXT NOT NULL,
              mobile_no VARCHAR(15) NOT NULL,
              email VARCHAR(255) NOT NULL,
              password VARCHAR(255) NOT NULL,
              food_licence_image VARCHAR(255) NOT NULL,
              restro_image VARCHAR(255) NOT NULL,
              user_role SMALLINT DEFAULT 1,
              status VARCHAR(20) DEFAULT 'not_approved',
              reset_key VARCHAR(6) NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_restro_food_item (
              id SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              price DECIMAL(10,2) NOT NULL,
              image_name VARCHAR(255) DEFAULT NULL,
              restro_name VARCHAR(255) NOT NULL,
              cid INTEGER NOT NULL,
              featured VARCHAR(10) NOT NULL DEFAULT 'No',
              active VARCHAR(10) NOT NULL DEFAULT 'Yes',
              stock INTEGER NOT NULL DEFAULT 0,
              status VARCHAR(20) DEFAULT 'not_approved'
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_review (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              order_id INTEGER NOT NULL,
              message TEXT,
              review_star INTEGER,
              tip DECIMAL(10,2) NOT NULL DEFAULT '0.00',
              username VARCHAR(255) NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_review_restro (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              restro_name VARCHAR(255) NOT NULL,
              message TEXT,
              review_star INTEGER,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tbl_users (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL,
              email VARCHAR(100) NOT NULL,
              add1 VARCHAR(100) NOT NULL,
              city VARCHAR(100) NOT NULL,
              phone BIGINT NOT NULL,
              username VARCHAR(100) NOT NULL,
              password VARCHAR(255) NOT NULL,
              reset_key VARCHAR(255) DEFAULT NULL,
              user_role INTEGER DEFAULT 1
            );
            """
        ]
        
        for schema in schemas:
            cursor.execute(schema)
            
        print("Schema tables created successfully. Importing initial data...")
        
        # 2. Parse and execute INSERT statements from the database SQL file
        sql_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'f_management.sql')
        
        if not os.path.exists(sql_file_path):
            print(f"Error: SQL dump file not found at {sql_file_path}")
            return
            
        with open(sql_file_path, 'r', encoding='utf-8', errors='ignore') as f:
            statement = ""
            for line in f:
                trimmed = line.strip()
                if not trimmed or trimmed.startswith('--') or trimmed.startswith('/*'):
                    continue
                statement += line
                if trimmed.endswith(';'):
                    if statement.strip().upper().startswith('INSERT INTO'):
                        # Clean up MySQL specific syntax for PostgreSQL
                        sql = statement.replace('`', '')
                        # Convert MySQL escape backslash-quote (\') to standard SQL escape double-quote ('')
                        sql = sql.replace("\\'", "''")
                        # Handle multiline string double backslashes in description
                        sql = sql.replace("\\r\\n", "\n").replace("\\r", "\n").replace("\\n", "\n")
                        
                        try:
                            cursor.execute(sql)
                        except Exception as e:
                            print(f"Warning: Failed to execute statement: {sql[:100]}... Error: {e}")
                    statement = ""
        
        print("Data imported. Resetting primary key sequences...")
        
        # 3. Reset primary key sequence values for all SERIAL tables in PostgreSQL
        serial_tables = [
            'aamarpay', 'message', 'order_manager', 'tbl_admin', 'tbl_category', 
            'tbl_coupon', 'tbl_delivery_boy', 'tbl_delivery_payment', 'tbl_eipay', 
            'tbl_fest_coupon', 'tbl_food', 'tbl_order', 'tbl_rcategory_notapproved', 
            'tbl_restro', 'tbl_restro_food_item', 'tbl_review', 'tbl_review_restro', 'tbl_users'
        ]
        
        for table in serial_tables:
            try:
                # Find max id and set sequence to it
                cursor.execute(f"SELECT COALESCE(MAX(id), 1) FROM {table};")
                max_id = cursor.fetchone()[0]
                cursor.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), {max_id});")
            except Exception as e:
                # Some tables might have different primary keys (like tbl_rcategory_notapproved has cid)
                if table == 'tbl_rcategory_notapproved':
                    try:
                        cursor.execute(f"SELECT COALESCE(MAX(cid), 1) FROM {table};")
                        max_id = cursor.fetchone()[0]
                        cursor.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'cid'), {max_id});")
                    except Exception as e2:
                        pass
                elif table == 'order_manager':
                    try:
                        cursor.execute(f"SELECT COALESCE(MAX(order_id), 1) FROM {table};")
                        max_id = cursor.fetchone()[0]
                        cursor.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'order_id'), {max_id});")
                    except Exception as e2:
                        pass
        
        print("--- Database initialization completed successfully ---")

import shutil

def align_images():
    print("--- Starting category and food image alignment ---")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    images_dir = os.path.join(base_dir, 'images')
    
    src_pizza = os.path.join(images_dir, 'pizza.jpg')
    src_burger = os.path.join(images_dir, 'burger.jpg')
    
    dest_cat_pizza = os.path.join(images_dir, 'category', 'pizza.jpg')
    dest_cat_burger = os.path.join(images_dir, 'category', 'burger.jpg')
    
    dest_food_pizza = os.path.join(images_dir, 'food', 'pizza.jpg')
    dest_food_burger = os.path.join(images_dir, 'food', 'burger.jpg')
    
    # Ensure destination directories exist
    os.makedirs(os.path.dirname(dest_cat_pizza), exist_ok=True)
    os.makedirs(os.path.dirname(dest_food_pizza), exist_ok=True)
    
    # Copy pizza image
    if os.path.exists(src_pizza):
        shutil.copy(src_pizza, dest_cat_pizza)
        shutil.copy(src_pizza, dest_food_pizza)
        print("Copied pizza images successfully.")
    else:
        print(f"Warning: Source pizza image not found at {src_pizza}")
        
    # Copy burger image
    if os.path.exists(src_burger):
        shutil.copy(src_burger, dest_cat_burger)
        shutil.copy(src_burger, dest_food_burger)
        print("Copied burger images successfully.")
    else:
        print(f"Warning: Source burger image not found at {src_burger}")
        
    # Update DB references to use these images
    with connection.cursor() as cursor:
        try:
            cursor.execute("UPDATE tbl_category SET image_name = 'pizza.jpg' WHERE id = 1;")
            cursor.execute("UPDATE tbl_category SET image_name = 'burger.jpg' WHERE id = 2;")
            cursor.execute("UPDATE tbl_food SET image_name = 'pizza.jpg' WHERE id = 1;")
            cursor.execute("UPDATE tbl_food SET image_name = 'burger.jpg' WHERE id = 2;")
            cursor.execute("UPDATE tbl_food SET image_name = 'pizza.jpg' WHERE id = 3;")
            print("Successfully updated database image references.")
        except Exception as e:
            print(f"Error updating database image references: {e}")
    print("--- Image alignment completed ---")

if __name__ == '__main__':
    initialize_database()
    align_images()
