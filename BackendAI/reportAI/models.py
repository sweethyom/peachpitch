# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Blacklist(models.Model):
    blacklist_id = models.BigAutoField(primary_key=True)
    from_user_id = models.BigIntegerField()
    to_user_id = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'blacklist'


class Chat(models.Model):
    chat_id = models.BigAutoField(primary_key=True)
    content = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    history = models.ForeignKey('ChatHistory', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat'


class ChatHistory(models.Model):
    history_id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(blank=True, null=True)
    keyword1_id = models.BigIntegerField(blank=True, null=True)
    keyword2_id = models.BigIntegerField(blank=True, null=True)
    status = models.TextField()  # This field type is a guess.
    user1_feedback = models.CharField(max_length=20, blank=True, null=True)
    user1_id = models.BigIntegerField()
    user1_name = models.CharField(max_length=40)
    user2_feedback = models.CharField(max_length=20, blank=True, null=True)
    user2_id = models.BigIntegerField(blank=True, null=True)
    user2_name = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat_history'


class ChatReport(models.Model):
    report_id = models.BigAutoField(primary_key=True)
    chat_time = models.IntegerField()
    cons = models.CharField(max_length=300, blank=True, null=True)
    pros = models.CharField(max_length=300, blank=True, null=True)
    summary = models.CharField(max_length=300, blank=True, null=True)
    history = models.ForeignKey(ChatHistory, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat_report'


class HaveCoupon(models.Model):
    have_coupon_id = models.BigAutoField(primary_key=True)
    ea = models.IntegerField(blank=True, null=True)
    expiration_date = models.DateTimeField(blank=True, null=True)
    item = models.ForeignKey('Item', models.DO_NOTHING)
    user = models.ForeignKey('User', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'have_coupon'


class Hint(models.Model):
    hint_id = models.BigAutoField(primary_key=True)
    hint = models.CharField(max_length=200)
    keyword = models.ForeignKey('Keyword', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'hint'


class Item(models.Model):
    item_id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=40)
    price = models.IntegerField()
    type = models.CharField(max_length=4)

    class Meta:
        managed = False
        db_table = 'item'


class Keyword(models.Model):
    keyword_id = models.BigAutoField(primary_key=True)
    keyword = models.CharField(unique=True, max_length=30)
    total_count = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'keyword'


class Mask(models.Model):
    mask_id = models.BigAutoField(primary_key=True)
    image = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mask'


class Purchase(models.Model):
    purchase_id = models.BigAutoField(primary_key=True)
    ea = models.IntegerField()
    method = models.CharField(max_length=255)
    order_id = models.CharField(max_length=255)
    payment_time = models.DateTimeField()
    total_price = models.IntegerField()
    item = models.ForeignKey(Item, models.DO_NOTHING)
    user = models.ForeignKey('User', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'purchase'


class Refresh(models.Model):
    refresh_id = models.BigAutoField(primary_key=True)
    expiration = models.CharField(max_length=255, blank=True, null=True)
    refresh = models.CharField(max_length=255, blank=True, null=True)
    user_email = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'refresh'


class SpeakingHabits(models.Model):
    word_id = models.BigAutoField(primary_key=True)
    count = models.IntegerField(blank=True, null=True)
    word = models.CharField(max_length=100)
    total_report = models.ForeignKey('TotalReport', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'speaking_habits'


class TotalReport(models.Model):
    total_report_id = models.BigAutoField(primary_key=True)
    ans_count = models.IntegerField(blank=True, null=True)
    quest_count = models.IntegerField(blank=True, null=True)
    total_chat_time = models.IntegerField(blank=True, null=True)
    user = models.OneToOneField('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'total_report'


class UsedCoupon(models.Model):
    coupon_id = models.BigAutoField(primary_key=True)
    used_date = models.DateField()
    item = models.ForeignKey(Item, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'used_coupon'


class User(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    birth = models.DateField(blank=True, null=True)
    email = models.CharField(unique=True, max_length=40)
    password = models.CharField(max_length=1000, blank=True, null=True)
    role = models.CharField(max_length=255, blank=True, null=True)
    sns_id = models.CharField(max_length=200, blank=True, null=True)
    sns_type = models.CharField(max_length=200, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user'


class UserKeyword(models.Model):
    selected_id = models.BigAutoField(primary_key=True)
    count = models.IntegerField(blank=True, null=True)
    keyword = models.ForeignKey(Keyword, models.DO_NOTHING)
    user = models.ForeignKey(User, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'user_keyword'
