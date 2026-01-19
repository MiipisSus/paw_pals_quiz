from api.models import GameSession
from django.db import models
from django.utils import timezone

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
        session.ended_at = timezone.now()
        
        total_rounds = session.round_records.count()
        if total_rounds > 0:
            correct_rounds = session.round_records.filter(is_correct=True).count()
            session.avg_accuracy = round((correct_rounds / total_rounds) * 100, 2)
        else:
            session.avg_accuracy = 0.0
            
        session.save()
        return session
    
    @classmethod
    def terminate_session(cls, session_id: int):
        GameSession.objects.filter(id=session_id).delete()
    
    @classmethod
    def get_current_round(cls, session_id: int) -> int:
        session = GameSession.objects.get(id=session_id)
        return session.round_records.count() + 1
    
    @classmethod
    def calculate_stats(cls, session_id: int) -> dict:
        session = GameSession.objects.get(id=session_id)
        total_games = 1
        total_rounds = session.round_records.count()
        breed_stats = {}
        for record in session.round_records.all():
            breed = record.question.breed_slug
            if breed is not None:
                if breed not in breed_stats:
                    breed_stats[breed] = {"attempts": 0, "successes": 0}
                breed_stats[breed]["attempts"] += 1
                if getattr(record, "is_correct", False):
                    breed_stats[breed]["successes"] += 1
        
        return {
            "total_games": total_games,
            "total_rounds": total_rounds,
            "total_correct": sum(bs["successes"] for bs in breed_stats.values()),
            "breed_stats": breed_stats
        }
    

class GuestGameSessionService:
    @classmethod
    def create_session(cls, game_session_id: str) -> str:
        RedisService.set(f"guest_game_session:{game_session_id}",
                            {
                                "started_at": str(timezone.now()),
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