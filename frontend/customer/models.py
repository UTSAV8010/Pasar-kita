from django.db import models

class Category(models.Model):
    title = models.CharField(max_length=100)
    image_name = models.CharField(max_length=255)
    featured = models.CharField(max_length=10)
    active = models.CharField(max_length=10)

    class Meta:
        db_table = 'tbl_category'
        managed = False

class Food(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    restro_name = models.CharField(max_length=255)
    image_name = models.CharField(max_length=255)
    category_id = models.IntegerField()
    featured = models.CharField(max_length=10)
    active = models.CharField(max_length=10)
    stock = models.IntegerField()

    class Meta:
        db_table = 'tbl_food'
        managed = False

class Restro(models.Model):
    restro_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    restro_address = models.TextField()
    mobile_no = models.CharField(max_length=15)
    email = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    food_licence_image = models.CharField(max_length=255)
    restro_image = models.CharField(max_length=255)
    user_role = models.IntegerField(default=1)
    status = models.CharField(max_length=20, default='not_approved')
    reset_key = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tbl_restro'
        managed = False

class RestroFoodItem(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_name = models.CharField(max_length=255, null=True, blank=True)
    restro_name = models.CharField(max_length=255)
    cid = models.IntegerField()
    featured = models.CharField(max_length=10, default='No')
    active = models.CharField(max_length=10, default='Yes')
    stock = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='not_approved')

    class Meta:
        db_table = 'tbl_restro_food_item'
        managed = False

class User(models.Model):
    name = models.TextField()
    email = models.CharField(max_length=100)
    add1 = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    phone = models.BigIntegerField()
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=255)
    reset_key = models.CharField(max_length=255, null=True, blank=True)
    user_role = models.IntegerField(default=1)

    class Meta:
        db_table = 'tbl_users'
        managed = False

class OrderManager(models.Model):
    order_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100)
    cus_name = models.TextField()
    cus_email = models.CharField(max_length=100)
    cus_add1 = models.CharField(max_length=100)
    cus_city = models.TextField()
    cus_phone = models.BigIntegerField()
    location = models.CharField(max_length=255, null=True, blank=True)
    delivery_boy_name = models.CharField(max_length=255, null=True, blank=True)
    payment_status = models.CharField(max_length=100)
    order_date = models.DateTimeField()
    total_amount = models.IntegerField()
    transaction_id = models.CharField(max_length=100)
    order_status = models.CharField(max_length=100)

    class Meta:
        db_table = 'order_manager'
        managed = False

class Coupon(models.Model):
    name = models.CharField(max_length=255)
    coupon_code = models.CharField(max_length=100)
    created_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20)
    discount = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'tbl_coupon'
        managed = False

class FestivalCoupon(models.Model):
    festival_name = models.CharField(max_length=255)
    coupon_code = models.CharField(max_length=50)
    created_date = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField()
    expire = models.CharField(max_length=20, default='active')
    status = models.CharField(max_length=20)
    discount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'tbl_fest_coupon'
        managed = False

class Review(models.Model):
    name = models.CharField(max_length=255)
    order_id = models.IntegerField()
    message = models.TextField(null=True, blank=True)
    review_star = models.IntegerField(null=True, blank=True)
    tip = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    username = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tbl_review'
        managed = False

class ReviewRestro(models.Model):
    name = models.CharField(max_length=255)
    restro_name = models.CharField(max_length=255)
    message = models.TextField(null=True, blank=True)
    review_star = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tbl_review_restro'
        managed = False

class ContactMessage(models.Model):
    name = models.TextField()
    phone = models.BigIntegerField()
    subject = models.CharField(max_length=100)
    message = models.TextField()
    message_status = models.CharField(max_length=100)
    date = models.DateTimeField()

    class Meta:
        db_table = 'message'
        managed = False

class Aamarpay(models.Model):
    cus_name = models.TextField()
    amount = models.IntegerField()
    status = models.CharField(max_length=100)
    pay_time = models.DateTimeField(auto_now=True)
    transaction_id = models.CharField(max_length=100)
    card_type = models.CharField(max_length=100)
    order_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'aamarpay'
        managed = False
