from django.core.cache import cache

class RedisService:
    @classmethod
    def set(cls, key, value, ttl=600):
        cache.set(key, value, timeout=ttl)

    @classmethod
    def get(cls, key):
        return cache.get(key)

    @classmethod
    def delete(cls, key):
        cache.delete(key)

    @classmethod
    def incr(cls, key, amount=1):
        if cache.get(key) is None:
            cache.set(key, 0, timeout=None)
        return cache.incr(key, amount)

    @classmethod
    def exists(cls, key):
        return cache.get(key) is not None