# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from account.models import User
from django.conf import settings


class Question(models.Model):
    content = models.CharField(max_length=500, db_collation='utf8mb4_unicode_ci', blank=True, null=True)
    question_no = models.IntegerField(primary_key=True)
    category_no = models.ForeignKey('Category', models.CASCADE, db_column='category_no', blank=True, null=True)
    korean = models.CharField(max_length=255, db_collation='utf8mb4_unicode_ci', blank=True, null=True)
 
    class Meta:
        managed = False
        db_table = 'Question'


class Answer(models.Model):
    content = models.TextField(blank=True, null=True)
    question_no = models.ForeignKey(Question, models.CASCADE, db_column='question_no', blank=True, null=True)
    answer_no = models.AutoField(primary_key=True)
    is_correct = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Answer'


class Category(models.Model):
    category_no = models.AutoField(primary_key=True)
    classification = models.TextField(blank=True, null=True)
    category_name = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Category'


class Result(models.Model):
    result_no = models.AutoField(primary_key=True, db_column='result_no')
    user_no = models.ForeignKey(User, models.CASCADE, db_column='user_no')
    answer_no = models.ForeignKey(Answer, models.CASCADE, db_column='answer_no')
    timestamp = models.DateTimeField()
    is_correct = models.IntegerField()
    content = models.TextField()
    question_no = models.ForeignKey(Question, models.CASCADE, db_column='question_no')

    class Meta:
        managed = False
        db_table = 'Result'


class Comm_History(models.Model):
    history_no = models.AutoField(primary_key=True, db_column='history_no')
    user_no = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True, null=True, db_column='title')
    code = models.PositiveSmallIntegerField(blank=True, null=True, db_column='code')
    timestamp = models.DateTimeField(auto_now_add=True, db_column='timestamp')

    class Meta:
        managed = False
        db_table = 'Comm_History'


class Comm_History_Sentence(models.Model):
    sentence_no = models.AutoField(primary_key=True, db_column='sentence_no')
    history_no = models.ForeignKey(Comm_History, blank=True, null=True, on_delete=models.CASCADE)
    speaker = models.CharField(max_length = 32, blank=True, null=True, db_column='speaker')
    sentence = models.TextField(blank=True, null=True, db_column='sentence')
    label_clear = models.PositiveSmallIntegerField(blank=True, null=True, default=None, db_column='label_clear')
    label_concise = models.PositiveSmallIntegerField(blank=True, null=True, default=None, db_column='label_concise')
    label_concrete = models.PositiveSmallIntegerField(blank=True, null=True, default=None, db_column='label_concrete')
    label_correct = models.PositiveSmallIntegerField(blank=True, null=True, default=None, db_column='label_correct')
    label_coherent = models.PositiveSmallIntegerField(blank=True, null=True, default=None, db_column='label_coherent')
    label_complete = models.PositiveSmallIntegerField(blank=True, null=True, default=None, db_column='label_complete')
    label_courteous = models.PositiveSmallIntegerField(blank=True, null=True, default=None, db_column='label_courteous')
    timestamp = models.DateTimeField(blank=True, null=True, db_column='timestamp')
    label_check = models.PositiveSmallIntegerField(blank=True, null=True, default=2, db_column='label_check')

    class Meta:
        managed = False
        db_table = 'Comm_History_Sentence'