from api.models import RoundRecord, Question, RoundRecordBreedChoice
from api.services.breed import BreedService


class RoundRecordService:
    @classmethod
    def log_record(cls, game_session_id: int, question_id: int, selected_slug: str, is_correct: bool, score: int, choices: list = []) -> RoundRecord:
        correct_slug = Question.objects.get(id=question_id).answer.slug
        
        round_record = RoundRecord.objects.create(
            game_session_id=game_session_id,
            question_id=question_id,
            selected_slug=selected_slug,
            correct_slug=correct_slug,
            is_correct=is_correct,
            score=score,
        )
        
        for choice in choices:
            RoundRecordBreedChoice.objects.create(
                round_record=round_record,
                breed=BreedService.get_breed_by_slug(choice['slug']),
                slug=choice['slug']
            )
        
        return round_record
    
    @classmethod
    def process_record_choices(cls, choices: list[dict], lang='en') -> list[dict]:
        processed_choices = []
        for choice in choices:
            breed = BreedService.get_breed_by_slug(choice['slug'])
            if lang == 'zh':
                processed_choices.append({
                    'slug': choice['slug'],
                    'name': breed.name_zh
                })
            else:
                processed_choices.append({
                    'slug': choice['slug'],
                    'name': breed.name_en
                })
        return processed_choices