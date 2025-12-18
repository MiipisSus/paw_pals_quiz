from django.contrib.auth.models import User
from django.db import models

import uuid


class Breed(models.Model):
    slug = models.CharField(max_length=100, unique=True)
    name_en = models.CharField(max_length=100, unique=True)
    name_zh = models.CharField(max_length=100, unique=True, null=True, blank=True)
    origin_en = models.CharField(max_length=100, null=True, blank=True)
    origin_zh = models.CharField(max_length=100, null=True, blank=True)
    introduction_en = models.TextField(null=True, blank=True)
    introduction_zh = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return self.slug
    

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image_url = models.URLField(unique=True)
    answer = models.ForeignKey(Breed, on_delete=models.CASCADE, related_name='questions')
    breed_slug = models.CharField(max_length=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PlayerInfo(models.Model):
    nickname = models.CharField(max_length=100)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player_info')


class GameSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_sessions')
    score = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

class RoundRecord(models.Model):
    game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='round_records')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='round_records')
    choices = models.JSONField(default=list)
    selected_slug = models.CharField(max_length=100)
    correct_slug = models.CharField(max_length=100)
    is_correct = models.BooleanField()
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)