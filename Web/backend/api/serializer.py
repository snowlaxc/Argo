# from django.contrib.auth.models import User
from account.models import User
# from django.conf import settings

from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from noticeboard.models import Post


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Frontend에서 더 필요한 정보가 있다면 여기에 추가적으로 작성
        token['name'] = user.name
        token['email'] = user.email
        token['dept'] = user.dept
        token['id'] = user.id
        token['user_no'] = user.user_no
        token['phone'] = user.phone
        token['is_admin'] = user.is_admin
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('password', 'password2', 'email', 'dept', 'name', 'phone', 'id')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            name=validated_data['name'],
            dept=validated_data['dept'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            id=validated_data['id'],
        )

        user.set_password(validated_data['password'])
        user.save()
        
        print(user)
        
        return user