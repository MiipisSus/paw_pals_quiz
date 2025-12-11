from api.models import RoundRecord, Question


class RoundRecordService:
    @classmethod
    def log_record(cls, game_session_id: int, question_id: int, selected_slug: str, is_correct: bool, score: int) -> RoundRecord:
        correct_slug = Question.objects.get(id=question_id).answer.slug
        
        round_record = RoundRecord.objects.create(
            game_id=game_session_id,
            question_id=question_id,
            selected_answer_slug=selected_slug,
            correct_answer_slug=correct_slug,
            is_correct=is_correct,
            score=score
        )
        
        return round_record