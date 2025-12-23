from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import QuestionView, AnswerView, StartGameView, EndGameView, LogoutView, UserInfoView, RegisterView


urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('question/', QuestionView.as_view()),
    path('answer/', AnswerView.as_view()),
    path('start-game/', StartGameView.as_view()),
    path('end-game/', EndGameView.as_view()),
    path('user/me/', UserInfoView.as_view()),
    
]