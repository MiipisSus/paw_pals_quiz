from rest_framework import serializers
from django.db import models
from django.contrib.auth.models import User
from .models import Breed, Question, RoundRecord, GameSession, PlayerInfo, RoundRecordBreedChoice, HardestBreedStat


class BreedSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    introduction = serializers.SerializerMethodField()
    origin = serializers.SerializerMethodField()
    
    class Meta:
        model = Breed
        fields = ['id', 'name', 'introduction', 'origin', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
        
    def get_name(self, obj: Breed):
        request = self.context.get('request')
        lang = request.GET.get('lang') if request else None
        if lang == 'zh':
            return obj.name_zh
        return obj.name_en
    
    def get_introduction(self, obj: Breed):
        request = self.context.get('request')
        lang = request.GET.get('lang') if request else None
        if lang == 'zh':
            return obj.introduction_zh
        return obj.introduction_en
    
    def get_origin(self, obj: Breed):
        request = self.context.get('request')
        lang = request.GET.get('lang') if request else None
        if lang == 'zh':
            return obj.origin_zh
        return obj.origin_en
    

class QuestionInputSerializer(serializers.Serializer):
    game_session_id = serializers.CharField()
    
    
class QuestionSerializer(serializers.ModelSerializer):
    current_round = serializers.SerializerMethodField()
    choices = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'image_url', 'current_round', 'choices', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
        
    def get_current_round(self, obj: Question):
        return self.context.get('current_round', 1)

    def get_choices(self, obj: RoundRecord):
        return self.context.get('choices', [])


class RoundRecordBreedChoiceSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = RoundRecordBreedChoice
        fields = ['slug', 'name']
        
    def get_name(self, obj: RoundRecordBreedChoice):
        request = self.context.get('request')
        lang = request.GET.get('lang') if request else None
        if lang == 'zh':
            return obj.breed.name_zh
        return obj.breed.name_en
    
    
class RoundRecordSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(source='question.image_url')
    choices = RoundRecordBreedChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = RoundRecord
        fields = ['image_url', 'choices', 'selected_slug', 'correct_slug', 'is_correct', 'score']
        
        
class AnswerInputSerializer(serializers.Serializer):
    game_session_id = serializers.CharField()
    question_id = serializers.UUIDField()
    selected_slug = serializers.CharField(max_length=100)
    
    
class AnswerSerializer(serializers.Serializer):
    breed = BreedSerializer()
    correct_slug = serializers.CharField(max_length=100)
    score = serializers.IntegerField()
    is_correct = serializers.BooleanField()


class StartGameSerializer(serializers.Serializer):
    is_guest = serializers.BooleanField(required=False, default=False)
    game_session_id = serializers.CharField()
    total_rounds = serializers.IntegerField()


class EndGameInputSerializer(serializers.Serializer):
    game_session_id = serializers.CharField()
    

class EndGameSerializer(serializers.ModelSerializer):
    round_records = RoundRecordSerializer(many=True)
    rounds = serializers.SerializerMethodField()
    
    class Meta:
        model = GameSession
        fields = ['id', 'user', 'score', 'started_at', 'ended_at', 'round_records', 'rounds', 'score']

    def get_rounds(self, obj: GameSession):
        return obj.round_records.count()


class GameSessionSerializer(serializers.ModelSerializer):
    round_record_count = serializers.IntegerField(source='round_records.count', read_only=True)
    
    class Meta:
        model = GameSession
        fields = ['id', 'user', 'score', 'started_at', 'avg_accuracy', 'round_record_count']
        read_only_fields = ['created_at', 'updated_at']


class UserInfoSerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(source='player_info.nickname')
    total_game_sessions = serializers.SerializerMethodField()
    game_sessions = serializers.SerializerMethodField()
    total_score = serializers.SerializerMethodField()
    avg_accuracy = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['nickname', 'total_game_sessions', 'total_score', 'avg_accuracy', 'game_sessions']
        
    def get_game_sessions(self, obj: User):
        game_sessions = obj.game_sessions.filter(ended_at__isnull=False).order_by('-started_at')
        return GameSessionSerializer(game_sessions, many=True, context=self.context).data
        
    def get_total_game_sessions(self, obj: User):
        return obj.game_sessions.count()
    
    def get_total_score(self, obj: User):
        return obj.game_sessions.aggregate(total_score=models.Sum('score'))['total_score'] or 0
    
    def get_avg_accuracy(self, obj: User):
        game_sessions = obj.game_sessions.all()
        if not game_sessions.exists():
            return 0.0
        total_questions = game_sessions.aggregate(total_questions=models.Count('round_records'))['total_questions'] or 0
        total_correct = game_sessions.aggregate(total_correct=models.Count('round_records', filter=models.Q(round_records__is_correct=True)))['total_correct'] or 0
        
        if total_questions == 0:
            return 0.0
        
        return round((total_correct / total_questions) * 100, 2)
    
    
class UserInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        

class UserSerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(source='playerinfo.nickname')
    
    class Meta:
        model = User
        fields = ['id', 'username', 'nickname']
        

class HardestBreedsSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    name = serializers.SerializerMethodField()
    correct_rate = serializers.FloatField()
    
    def get_name(self, obj: HardestBreedStat):
        request = self.context.get('request')
        lang = request.GET.get('lang') if request else None
        if lang == 'zh':
            return obj.breed.name_zh
        return obj.breed.name_en
    
    
class GlobalStatsSerializer(serializers.Serializer):
    total_games = serializers.IntegerField()
    total_rounds = serializers.IntegerField()
    total_players = serializers.IntegerField()
    avg_accuracy = serializers.FloatField()
    hardest_breeds = HardestBreedsSerializer(many=True)