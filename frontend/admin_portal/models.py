from django.db import models

class Admin(models.Model):
    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    email = models.CharField(max_length=120)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=255)

    class Meta:
        db_table = 'tbl_admin'
        managed = False

class DeliveryBoy(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=15)
    password = models.CharField(max_length=255)
    user_role = models.IntegerField()  # 0 = Blocked, 1 = Active
    status = models.CharField(max_length=20, default='not_verified')
    adhar_image = models.CharField(max_length=255)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reset_key = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_delivery_boy'
        managed = False

class DeliveryPayment(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=10, default='unpaid')
    order_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tbl_delivery_payment'
        managed = False

class RestroCategoryNotApproved(models.Model):
    cid = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    image_name = models.CharField(max_length=255, null=True, blank=True)
    featured = models.CharField(max_length=10, default='No')
    active = models.CharField(max_length=10, default='No')
    status = models.CharField(max_length=20, default='not_approved')
    restro_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tbl_rcategory_notapproved'
        managed = False

class EatInPay(models.Model):
    id = models.AutoField(primary_key=True)
    table_id = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tran_id = models.CharField(max_length=50)
    order_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=50)
    order_status = models.CharField(max_length=100)

    class Meta:
        db_table = 'tbl_eipay'
        managed = False

class ReviewRestro(models.Model):
    id = models.AutoField(primary_key=True)
    customer_name = models.CharField(max_length=255)
    restro_name = models.CharField(max_length=255)
    description = models.TextField()
    rating_star = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tbl_review_restro'
        managed = False
