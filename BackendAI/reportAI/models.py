# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AiCharacter(models.Model):
    ai_id = models.BigAutoField(primary_key=True)
    ai_face_1 = models.TextField(blank=True, null=True)
    ai_face_2 = models.TextField(blank=True, null=True)
    ai_face_3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ai_character'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Background(models.Model):
    backgroundid = models.BigAutoField(db_column='backgroundId', primary_key=True)  # Field name made lowercase.
    image = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'background'


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
    userid = models.BigIntegerField(db_column='userId')  # Field name made lowercase.
    history = models.ForeignKey('ChatHistory', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat'


class ChatHistory(models.Model):
    history_id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(blank=True, null=True)
    keyword1_id = models.BigIntegerField(blank=True, null=True)
    keyword2_id = models.BigIntegerField(blank=True, null=True)
    status = models.IntegerField(default=0)
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
    history = models.OneToOneField(ChatHistory, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat_report'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Havecoupon(models.Model):
    havecouponid = models.BigAutoField(db_column='haveCouponId', primary_key=True)  # Field name made lowercase.
    ea = models.IntegerField(blank=True, null=True)
    item = models.ForeignKey('Item', models.DO_NOTHING)
    user = models.ForeignKey('User', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'havecoupon'


class Hint(models.Model):
    hintid = models.BigAutoField(db_column='hintId', primary_key=True)  # Field name made lowercase.
    hint = models.CharField(max_length=200)
    keyword = models.ForeignKey('Keyword', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'hint'


class Item(models.Model):
    itemid = models.BigAutoField(db_column='itemId', primary_key=True)  # Field name made lowercase.
    name = models.CharField(max_length=40)
    price = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'item'


class Keyword(models.Model):
    keywordid = models.BigAutoField(db_column='keywordId', primary_key=True)  # Field name made lowercase.
    keyword = models.CharField(unique=True, max_length=30)
    totalcount = models.IntegerField(db_column='totalCount', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'keyword'


class Mask(models.Model):
    maskid = models.BigAutoField(db_column='maskId', primary_key=True)  # Field name made lowercase.
    image = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mask'


class Purchase(models.Model):
    purchaseid = models.BigAutoField(db_column='purchaseId', primary_key=True)  # Field name made lowercase.
    ea = models.IntegerField()
    method = models.CharField(max_length=255)
    orderid = models.CharField(db_column='orderId', max_length=255)  # Field name made lowercase.
    paymenttime = models.DateTimeField(db_column='paymentTime')  # Field name made lowercase.
    totalprice = models.IntegerField(db_column='totalPrice')  # Field name made lowercase.
    item = models.ForeignKey(Item, models.DO_NOTHING)
    user = models.ForeignKey('User', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'purchase'


class Refresh(models.Model):
    refreshid = models.BigAutoField(db_column='refreshId', primary_key=True)  # Field name made lowercase.
    expiration = models.CharField(max_length=255, blank=True, null=True)
    refresh = models.CharField(max_length=255, blank=True, null=True)
    useremail = models.CharField(db_column='userEmail', max_length=255, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'refresh'





class Totalreport(models.Model):
    totalreportid = models.BigAutoField(db_column='totalReportId', primary_key=True)  # Field name made lowercase.
    anscount = models.IntegerField(db_column='ansCount', blank=True, null=True)  # Field name made lowercase.
    questcount = models.IntegerField(db_column='questCount', blank=True, null=True)  # Field name made lowercase.
    totalchattime = models.IntegerField(db_column='totalChatTime', blank=True, null=True)  # Field name made lowercase.
    user = models.OneToOneField('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'totalreport'


class Usedcoupon(models.Model):
    couponid = models.BigAutoField(db_column='couponId', primary_key=True)  # Field name made lowercase.
    useddate = models.DateField(db_column='usedDate')  # Field name made lowercase.
    item = models.ForeignKey(Item, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usedcoupon'


class User(models.Model):
    userid = models.BigAutoField(db_column='userId', primary_key=True)  # Field name made lowercase.
    birth = models.DateField(blank=True, null=True)
    email = models.CharField(unique=True, max_length=40)
    password = models.CharField(max_length=1000)
    role = models.CharField(max_length=255, blank=True, null=True)
    snsid = models.CharField(db_column='snsId', max_length=40, blank=True, null=True)  # Field name made lowercase.
    snstype = models.CharField(db_column='snsType', max_length=100, blank=True, null=True)  # Field name made lowercase.
    status = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user'


class Userkeyword(models.Model):
    selectedid = models.BigAutoField(db_column='selectedId', primary_key=True)  # Field name made lowercase.
    count = models.IntegerField(blank=True, null=True)
    keyword = models.ForeignKey(Keyword, models.DO_NOTHING)
    user = models.ForeignKey(User, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'userkeyword'
