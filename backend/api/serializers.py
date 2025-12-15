from rest_framework import serializers
from .models import Breed, Question, RoundRecord, GameSession


class BreedSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = Breed
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
        
    def get_name(self, obj: Breed):
        request = self.context.get('request')
        lang = request.GET.get('lang') if request else None
        if lang == 'zh':
            return obj.name_zh
        return obj.name_en
    

class QuestionInputSerializer(serializers.Serializer):
    game_session_id = serializers.UUIDField()
    
    
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


class RoundRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoundRecord
        fields = ['question', 'selected_answer_slug', 'correct_answer_slug', 'is_correct', 'score']


class AnswerInputSerializer(serializers.Serializer):
    game_session_id = serializers.UUIDField()
    question_id = serializers.UUIDField()
    selected_slug = serializers.CharField(max_length=100)
    
    
class AnswerSerializer(serializers.Serializer):
    correct_slug = serializers.CharField(max_length=100)
    score = serializers.IntegerField()
    is_correct = serializers.BooleanField()


class StartGameSerializer(serializers.Serializer):
    is_guest = serializers.BooleanField(required=False, default=False)
    game_session_id = serializers.UUIDField()
    total_rounds = serializers.IntegerField()


class EndGameInputSerializer(serializers.Serializer):
    game_session_id = serializers.UUIDField()
    
class EndGameSerializer(serializers.ModelSerializer):
    round_records = RoundRecordSerializer(many=True)
    rounds = serializers.SerializerMethodField()
    
    class Meta:
        model = GameSession
        fields = ['id', 'user', 'score', 'started_at', 'ended_at', 'round_records', 'rounds', 'score']

    def get_rounds(self, obj: GameSession):
        return obj.round_records.count()

