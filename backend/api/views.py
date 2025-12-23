from django.contrib.auth.models import User
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from uuid import uuid4
from datetime import datetime

from .serializers import QuestionInputSerializer, QuestionSerializer, AnswerInputSerializer, AnswerSerializer, \
    StartGameSerializer, EndGameInputSerializer, EndGameSerializer, UserInfoSerializer, UserInputSerializer, \
        UserSerializer
from .services import QuestionService, RedisService, GameSessionService, GuestGameSessionService, RoundRecordService, BreedService
    

class QuestionView(APIView):
    def post(self, request, *args, **kwargs):
        lang = request.GET.get('lang', 'en')

        serializer = QuestionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        
        game_session_id = data.get('game_session_id')

        if request.user.is_authenticated:
            if not GameSessionService.is_session_owned_by_user(data.get('game_session_id'), request.user.id):
                return Response({"error": "Invalid game session"}, status=400)
            current_round = GameSessionService.get_current_round(data.get('game_session_id'))
        else:
            session_data = GuestGameSessionService.get_session_data(game_session_id=data.get('game_session_id'))
            current_round = len(session_data.get('round_records', [])) + 1

        question = QuestionService.generate_question()
        choices = QuestionService.generate_random_choices(question.answer, lang=lang)
        
        serializer = QuestionSerializer(question, context={
            'choices': choices,
            'current_round': current_round
            })
        
        if not RedisService.exists(f"{game_session_id}_{question.id}"):
            RedisService.set(f"{game_session_id}_{question.id}", {
                "correct_slug": question.answer.slug,
                "choices": choices,
                'image_url': question.image_url
            })
        else:
            RedisService.set(f"{game_session_id}_{question.id}", {
                "choices": choices,
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
        
        cached_data = RedisService.get(f"{data.get('game_session_id')}_{data.get('question_id')}")
        
        if cached_data:
            correct_slug = cached_data.get('correct_slug')
            is_correct = data.get('selected_slug') == correct_slug
        else:
            is_correct, correct_slug = QuestionService.is_answer_correct(data.get('question_id'), data.get('selected_slug'))
            
        score = 1 if is_correct else 0
        
        if cached_data:
            choices = cached_data.get('choices', [])
        else:
            return Response({"error": "Round expired, please start a new round."}, status=400)
        
        if cached_data and 'image_url' in cached_data:
            image_url = cached_data.get('image_url')
        else:
            try:
                question = QuestionService.get_question_by_id(data.get('question_id'))
                image_url = question.image_url if question else ''
            except Exception:
                image_url = ''

        if not is_authenticated:
            session_data = GuestGameSessionService.get_session_data(game_session_id=data.get('game_session_id'))
            session_data['score'] += score
            
            round_record = {
                'question_id': str(data.get('question_id')),
                'selected_slug': data.get('selected_slug'),
                'correct_slug': correct_slug,
                'is_correct': is_correct,
                'score': score,
                'choices': choices,
                'image_url': image_url
            }
            
            session_data['round_records'].append(round_record)

            GuestGameSessionService.update_session_data(game_session_id=data.get('game_session_id'), data=session_data)

        else:
            RoundRecordService.log_record(
                game_session_id=data.get('game_session_id'),
                question_id=data.get('question_id'),
                selected_slug=data.get('selected_slug'),
                is_correct=is_correct,
                score=score,
                choices=choices
            )
            
        breed = BreedService.get_breed_by_slug(correct_slug)
        serializer = AnswerSerializer(
            {'breed': breed, 'correct_slug': correct_slug, 'is_correct': is_correct, 'score': score}, 
            context={'request': request})

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
        lang = request.GET.get('lang', 'en')
        serializer = EndGameInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        if not request.user.is_authenticated:
            session_data = GuestGameSessionService.get_session_data(game_session_id=data.get('game_session_id'))
            if not session_data:
                return Response({"error": "Invalid or expired game session"}, status=400)
            
            round_records = session_data.get('round_records', [])
            if round_records:
                for record in round_records:
                    record['choices'] = RoundRecordService.process_record_choices(record['choices'], lang=lang)
            
            response_data = {
                'id': data.get('game_session_id'),
                'score': session_data.get('score', 0),
                'started_at': session_data.get('started_at'),
                'ended_at': str(datetime.now()),
                'rounds': len(round_records),
                'round_records': round_records,
            }
            
            GuestGameSessionService.delete_session(game_session_id=data.get('game_session_id'))

            return Response(response_data)
        
        if not GameSessionService.is_session_owned_by_user(data.get('game_session_id'), request.user.id):
            return Response({"error": "Invalid game session or access denied"}, status=403)
        
        try:
            game_session = GameSessionService.end_session(session_id=data.get('game_session_id'))
        except Exception as e:
            return Response({"error": "Failed to end game session"}, status=500)
        
        serializer = EndGameSerializer(game_session, context={'request': request})
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response(
                {"message": "Successfully logged out"}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(e)
            return Response(
                {"error": "Invalid token"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        serializer = UserInfoSerializer(user)
        return Response(serializer.data)
    

class RegisterView(APIView):
    def post(self, request):
        serializer = UserInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        data = UserSerializer(user).data
        
        return Response(data, status=status.HTTP_201_CREATED)