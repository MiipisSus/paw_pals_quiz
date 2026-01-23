from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import QuestionView, AnswerView, StartGameView, EndGameView, LogoutView, UserInfoView, \
    RegisterView, TerminateGameView, GlobalStatsView, CheckEmailView, GoogleLoginView, GoogleCallbackView, \
    RequestPasswordResetView, ResetPasswordView


urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
    path('request-password-reset/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/google/callback/', GoogleCallbackView.as_view(), name='google_callback'),
    path('question/', QuestionView.as_view()),
    path('answer/', AnswerView.as_view()),
    path('start-game/', StartGameView.as_view()),
    path('end-game/', EndGameView.as_view()),
    path('terminate-game/', TerminateGameView.as_view()),
    path('user/me/', UserInfoView.as_view()),
    path('global-stats/', GlobalStatsView.as_view()),
]