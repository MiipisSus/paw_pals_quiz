from api.models import GameSession
from django.db import models

from datetime import datetime

from .redis import RedisService


class GameSessionService:
    @classmethod
    def is_valid_session(cls, session_id: int) -> bool:
        return GameSession.objects.filter(id=session_id).exists()
    
    @classmethod
    def is_session_owned_by_user(cls, session_id: int, user_id: int) -> bool:
        return GameSession.objects.filter(id=session_id, user_id=user_id).exists()
    
    @classmethod
    def create_session(cls, user_id: int) -> GameSession:
        session = GameSession.objects.create(user_id=user_id)
        return session
    
    @classmethod
    def end_session(cls, session_id: int):
        session = GameSession.objects.get(id=session_id)
        session.score = session.round_records.aggregate(total_score=models.Sum('score'))['total_score'] or 0
        session.ended_at = datetime.now()
        session.save()
        return session
    
    @classmethod
    def get_current_round(cls, session_id: int) -> int:
        session = GameSession.objects.get(id=session_id)
        return session.round_records.count() + 1
    

class GuestGameSessionService:
    @classmethod
    def create_session(cls, game_session_id: str) -> str:
        RedisService.set(f"guest_game_session:{game_session_id}",
                            {
                                "started_at": str(datetime.now()),
                                "score": 0,
                                "rounds": 0,
                                "round_records": []
                            })
    
    @classmethod
    def get_session_data(cls, game_session_id: str):
        return RedisService.get(f"guest_game_session:{game_session_id}")
    
    @classmethod
    def update_session_data(cls, game_session_id: str, data: dict):
        RedisService.set(f"guest_game_session:{game_session_id}", data)
        
    @classmethod
    def delete_session(cls, game_session_id: str):
        RedisService.delete(f"guest_game_session:{game_session_id}")