from api.models import Breed


class BreedService:
    @classmethod
    def get_breed_by_slug(cls, slug: str) -> Breed:
        try:
            breed = Breed.objects.get(slug=slug)
        except Breed.DoesNotExist:
            raise ValueError(f'Breed with slug "{slug}" not found.')
        
        return breed