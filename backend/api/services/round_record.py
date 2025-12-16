from api.models import RoundRecord, Question


class RoundRecordService:
    @classmethod
    def log_record(cls, game_session_id: int, question_id: int, selected_slug: str, is_correct: bool, score: int, choices: list = None) -> RoundRecord:
        correct_slug = Question.objects.get(id=question_id).answer.slug
        
        round_record = RoundRecord.objects.create(
            game_session_id=game_session_id,
            question_id=question_id,
            selected_slug=selected_slug,
            correct_slug=correct_slug,
            is_correct=is_correct,
            score=score,
            choices=choices or []
        )
        
        return round_record