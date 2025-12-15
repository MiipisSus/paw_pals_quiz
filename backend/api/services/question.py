import random

from .dog import DogAPIService
from api.models import Breed, Question


class QuestionService:
    @classmethod
    def generate_question(cls) -> Question:
        image_url = DogAPIService.fetch_random_single_image()
        
        # Check if the question exists
        question = Question.objects.filter(image_url=image_url).first()
        if question:
            return question
        
        slug = DogAPIService.extract_slug_from_image_url(image_url)
        
        breed = Breed.objects.filter(slug=slug).first()
        if not breed:
            raise ValueError(f'Breed with slug "{slug}" not found.')
        
        question = Question.objects.create(
            image_url=image_url,
            answer=breed,
            breed_slug=slug
        )
        
        return question
    
    @classmethod
    def generate_random_choices(cls, correct_breed: Breed, num_choices: int = 3) -> list[str]:
        wrong_breeds = Breed.objects.exclude(id=correct_breed.id).order_by('?')[:num_choices]
        choices = [{'slug': breed.slug, 'name': breed.name_en} for breed in wrong_breeds]
        choices.append({'slug': correct_breed.slug, 'name': correct_breed.name_en})
        random.shuffle(choices)
        
        return choices
    
    @classmethod
    def is_answer_correct(cls, question_id: int, selected_slug: str) -> bool:
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            raise ValueError(f'Question with ID "{question_id}" not found.')
        
        return question.answer.slug == selected_slug, question.answer.slug