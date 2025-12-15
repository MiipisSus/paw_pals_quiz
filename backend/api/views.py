from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated

from uuid import uuid4
from datetime import datetime

from .models import Breed, User
from .serializers import QuestionInputSerializer, QuestionSerializer, AnswerInputSerializer, AnswerSerializer, \
    StartGameSerializer, EndGameInputSerializer, EndGameSerializer, RoundRecordSerializer
from .services import QuestionService, RedisService, GameSessionService, GuestGameSessionService, RoundRecordService
    

def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})

class QuestionView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = QuestionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        if request.user.is_authenticated:
            if not GameSessionService.is_session_owned_by_user(data.get('game_session_id'), request.user.id):
                return Response({"error": "Invalid game session"}, status=400)
            current_round = GameSessionService.get_current_round(data.get('game_session_id'))
        else:
            session_data = GuestGameSessionService.get_session_data(game_session_id=data.get('game_session_id'))
            current_round = len(session_data.get('round_records', [])) + 1

        question = QuestionService.generate_question()
        choices = QuestionService.generate_random_choices(question.answer)
        
        serializer = QuestionSerializer(question, context={
            'choices': choices,
            'current_round': current_round
            })
        
        RedisService.set(f"question_{question.id}", {
            "correct_slug": question.answer.slug
        })
        
        return Response(serializer.data)
    
    
class AnswerView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = AnswerInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data

        is_authenticated = request.user.is_authenticated

        if is_authenticated:
            if not GameSessionService.is_session_owned_by_user(data.get('game_session_id'), request.user.id):
                return Response({"error": "Invalid game session"}, status=400)
        
        cached_data = RedisService.get(f"question_{data.get('question_id')}")
        if cached_data and data.get('selected_slug') == cached_data.get('correct_slug'):
            is_correct = True
            correct_slug = cached_data.get('correct_slug')
        else:
            is_correct, correct_slug = QuestionService.is_answer_correct(data.get('question_id'), data.get('selected_slug'))
            
        score = 1 if is_correct else 0

        if not is_authenticated:
            # Update guest session data in Redis
            session_data = GuestGameSessionService.get_session_data(game_session_id=data.get('game_session_id'))
            session_data['score'] += score
            
            # Store round record for guest
            round_record = {
                'question_id': str(data.get('question_id')),
                'selected_slug': data.get('selected_slug'),
                'is_correct': is_correct,
                'score': score
            }
            
            session_data['round_records'].append(round_record)

            GuestGameSessionService.update_session_data(game_session_id=data.get('game_session_id'), data=session_data)

        else:
            RoundRecordService.log_record(
                game_session_id=data.get('game_session_id'),
                question_id=data.get('question_id'),
                selected_slug=data.get('selected_slug'),
                is_correct=is_correct,
                score=score
            )
            
        serializer = AnswerSerializer({'correct_slug': correct_slug, 'is_correct': is_correct, 'score': score})

        return Response(serializer.data)


class StartGameView(APIView):
    def post(self, request, *args, **kwargs):
        is_guest = False
        
        if request.user.is_authenticated:    
            game_session = GameSessionService.create_session(user_id=request.user.id)
            game_session_id = game_session.id
        else:
            game_session_id = str(uuid4())
            GuestGameSessionService.create_session(game_session_id=game_session_id)
            is_guest = True

        serializer = StartGameSerializer(
            {'game_session_id': game_session_id,
             'is_guest': is_guest,
             'total_rounds': 3}
            )
        
        return Response(serializer.data)
    

class EndGameView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = EndGameInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        if not request.user.is_authenticated:
            session_data = RedisService.get(f"guest_game_session:{data.get('game_session_id')}")
            if not session_data:
                return Response({"error": "Invalid game session"}, status=400)
            
            response_data = {
                'id': data.get('game_session_id'),
                'score': session_data.get('score', 0),
                'started_at': session_data.get('started_at'),
                'ended_at': str(datetime.now()),
                'rounds': len(session_data.get('round_records', [])),
                'round_records': session_data.get('round_records', []),
            }
            
            GuestGameSessionService.delete_session(game_session_id=data.get('game_session_id'))

            return Response(response_data)

        if not GameSessionService.is_session_owned_by_user(data.get('game_session_id'), request.user.id):
            return Response({"error": "Invalid game session"}, status=400)
        
        game_session = GameSessionService.end_session(session_id=data.get('game_session_id'))
        
        serializer = EndGameSerializer(game_session)
        return Response(serializer.data)