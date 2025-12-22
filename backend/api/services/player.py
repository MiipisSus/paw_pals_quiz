from django.contrib.auth.models import User

from api.models import PlayerInfo


class PlayerService:
    @staticmethod
    def create_user(username: str, password: str) -> User:
        user = User.objects.create_user(
            username=username,
            password=password
        )
        PlayerInfo.objects.create(user=user)
        return user