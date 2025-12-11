import requests


class DogAPIService:
    BASE_URL = 'https://dog.ceo/api/'
    
    @classmethod
    def fetch_random_single_image(cls) -> str:
        url = f'{cls.BASE_URL}breeds/image/random'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return data.get('message')
    
    @classmethod
    def extract_slug_from_image_url(cls, image_url: str) -> str:
        return image_url.split('/')[4]