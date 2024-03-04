from django.db import models
from django.contrib.auth.models import (BaseUserManager, AbstractBaseUser)


class UserManager(BaseUserManager):
    def create_user(self, id, name, phone, email, dept, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            dept = dept,
            id = id,
            name = name,
            phone = phone,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    # def create_superuser(self, email, password, dept):
    #     user = self.create_user(
    #         email,
    #         password=password,
    #         dept = dept,
    #     )
    #     user.is_admin = True
    #     user.save(using=self._db)
    #     return user


# AbstractBaseUser: 내가 쓴것만
# AbstractUser: 원래 있던 필드도
class User(AbstractBaseUser):
    class Meta:
        managed = False
        db_table = 'User'
        
    user_no = models.AutoField(primary_key=True)
    id = models.CharField(max_length=128, unique=True)
    password = models.CharField(max_length=128)
    is_admin = models.BooleanField(default=False)
    image = models.TextField(blank=True, null=True)
    email = models.EmailField(
        verbose_name='email',
        max_length=255,
        unique=True,
    )
    
    dept = models.IntegerField()
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=128)
    image = models.TextField(blank=True, null=True)

    objects = UserManager()

    # 뭐로 로그인할건지
    USERNAME_FIELD = 'id'
    # 필수 필드
    REQUIRED_FIELDS = ['dept', 'name', 'phone']

    # 관리자 페이지에서 객체 표시할 때 사용
    def __str__(self):
        return self.email

    # 사용자가 특정 권한 가지고 있는지
    def has_perm(self, perm, obj=None):
        return True

    # 사용자가 특정 앱의 모든 모듈 권한을 가지고 있는지
    def has_module_perms(self, app_label):
        return True

    # 사용자가 관리자인지
    @property
    def is_staff(self):
        return self.is_admin
    