from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import QuestionView, AnswerView, StartGameView, EndGameView


urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('question/', QuestionView.as_view()),
    path('answer/', AnswerView.as_view()),
    path('start-game/', StartGameView.as_view()),
    path('end-game/', EndGameView.as_view()),
]