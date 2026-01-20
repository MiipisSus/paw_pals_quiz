from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.db import transaction

from uuid import uuid4
from datetime import datetime
from urllib.parse import urlencode
import requests
import secrets

from .serializers import QuestionInputSerializer, QuestionSerializer, AnswerInputSerializer, AnswerSerializer, \
    StartGameSerializer, EndGameInputSerializer, EndGameSerializer, UserInfoSerializer, UserInputSerializer, \
        UserSerializer, GlobalStatsSerializer, HardestBreedsSerializer
from .services import QuestionService, RedisService, GameSessionService, GuestGameSessionService, \
    RoundRecordService, BreedService, PlayerService
from .models import HardestBreedStat
    

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
            stats = GameSessionService.calculate_stats(session_id=data.get('game_session_id'))

            RedisService.incr('global:count:games', stats.get('total_games', 0))
            RedisService.incr('global:count:rounds', stats.get('total_rounds', 0))
            RedisService.incr('global:count:correct', stats.get('total_correct', 0))
            for breed, breed_stat in stats.get('breed_stats', {}).items():
                RedisService.incr(f"breed:{breed}:attempts", breed_stat.get('attempts', 0))
                RedisService.incr(f"breed:{breed}:correct", breed_stat.get('successes', 0))
            
        except Exception as e:
            print(e)
            return Response({"error": "Failed to end game session"}, status=500)
        
        serializer = EndGameSerializer(game_session, context={'request': request})
        return Response(serializer.data)
    

class TerminateGameView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = EndGameInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        if not request.user.is_authenticated:
            GuestGameSessionService.delete_session(game_session_id=data.get('game_session_id'))
            return Response({"message": "Guest game session terminated"}, status=200)
        
        if not GameSessionService.is_session_owned_by_user(data.get('game_session_id'), request.user.id):
            return Response({"error": "Invalid game session or access denied"}, status=403)
        
        try:
            GameSessionService.terminate_session(session_id=data.get('game_session_id'))
        except Exception as e:
            return Response({"error": "Failed to terminate game session"}, status=500)
        
        return Response({"message": "Game session terminated"}, status=200)


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
    
    def patch(self, request):
        user = request.user

        serializer = UserInputSerializer(
            instance=user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            serializer.save()

        return Response(UserSerializer(user).data)
    

class RegisterView(APIView):
    def post(self, request):
        serializer = UserInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = PlayerService.create_user(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
            email=serializer.validated_data.get('email', serializer.validated_data['username'])
        )
        
        data = UserSerializer(user).data
        
        return Response(data, status=status.HTTP_201_CREATED)
    
    
class GlobalStatsView(APIView):
    def get(self, request):
        total_games = RedisService.get('global:stats:total_games') or 0
        total_rounds = RedisService.get('global:stats:total_rounds') or 0
        total_correct = RedisService.get('global:stats:total_correct') or 0
        total_players = User.objects.count()
        avg_accuracy = total_correct / total_rounds * 100 if total_rounds > 0 else 0.0
        hardest_breeds = HardestBreedStat.objects.select_related('breed').order_by('rank')
        hardest_stats_serializer = HardestBreedsSerializer(hardest_breeds, many=True, context={'request': request})
        
        data = {
            'total_games': int(total_games),
            'total_rounds': int(total_rounds),
            'total_players': int(total_players),
            'avg_accuracy': round(avg_accuracy, 2),
            'hardest_breeds': hardest_stats_serializer.data,
        }
        
        serializer = GlobalStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        return Response(data)


class CheckEmailView(APIView):
    def post(self, request):
        """
        檢查 email 是否已註冊
        若 email 不存在則回傳 400
        """
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            ) 

        user = PlayerService.get_user_by_email(email=email)
        if user:
            return Response(
                {"message": "Email found", "email": email}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Email not found"}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class GoogleLoginView(APIView):
    def get(self, request):
        """
        重定向到 Google OAuth 授權頁面
        """
        # 生成 state token 用於 CSRF 保護
        state = secrets.token_urlsafe(32)
        request.session['oauth_state'] = state
        
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
        }
        
        auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
        return redirect(auth_url)


class GoogleCallbackView(APIView):
    def get(self, request):
        """
        處理 Google OAuth 回調
        """
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        if error:
            return redirect(f"{settings.FRONTEND_URL}/login?error={error}")
        
        stored_state = request.session.get('oauth_state')
        if not state or state != stored_state:
            return redirect(f"{settings.FRONTEND_URL}/login?error=invalid_state")
        
        request.session.pop('oauth_state', None)
        
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/login?error=no_code")
        
        try:
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
            
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
            
            # 使用 access token 獲取用戶信息
            userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {tokens['access_token']}"}
            userinfo_response = requests.get(userinfo_url, headers=headers)
            userinfo_response.raise_for_status()
            user_info = userinfo_response.json()
            
            # 獲取或創建用戶
            email = user_info.get('email')
            if not email:
                return redirect(f"{settings.FRONTEND_URL}/login?error=no_email")
            
            # 查找或創建用戶
            user, created = PlayerService.get_or_create_by_email(email=email)
            if created:
                print(f"Created new user for Google OAuth: {email}")
            
            # 生成 JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            print(access_token)
            
            # 重定向到前端，帶上 tokens
            redirect_url = (
                f"{settings.FRONTEND_URL}/login/callback?"
                f"access_token={access_token}&refresh_token={refresh_token}"
            )
            return redirect(redirect_url)
            
        except requests.RequestException as e:
            print(f"Google OAuth error: {e}")
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_failed")
        except Exception as e:
            print(f"Unexpected error: {e}")
            return redirect(f"{settings.FRONTEND_URL}/login?error=server_error")
