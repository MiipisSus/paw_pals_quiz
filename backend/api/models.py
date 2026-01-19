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
    total_attempts = models.IntegerField(default=0)
    correct_attempts = models.IntegerField(default=0)
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
    nickname = models.CharField(max_length=100, default='Doggo Lover')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player_info')


class GameSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_sessions')
    score = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    avg_accuracy = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

class RoundRecord(models.Model):
    game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='round_records')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='round_records')
    selected_slug = models.CharField(max_length=100)
    correct_slug = models.CharField(max_length=100)
    is_correct = models.BooleanField()
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

class RoundRecordBreedChoice(models.Model):
    round_record = models.ForeignKey(RoundRecord, on_delete=models.CASCADE, related_name='choices')
    breed = models.ForeignKey(Breed, on_delete=models.SET_NULL, null=True, blank=True)
    slug = models.CharField(max_length=100)
    

class GlobalStat(models.Model):
    total_games = models.BigIntegerField(default=0)
    total_correct = models.BigIntegerField(default=0)
    total_rounds = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    

class HardestBreedStat(models.Model):
    rank = models.IntegerField(unique=True)
    breed = models.OneToOneField(Breed, on_delete=models.CASCADE, related_name='hardest_stat')
    correct_rate = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)