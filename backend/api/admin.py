from django.contrib import admin
from .models import Breed


@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    """Admin options for the Breed model."""
    list_display = ('name_en', 'name_zh', 'created_at', 'updated_at')
    search_fields = ('name_en', 'name_zh')
    list_filter = ('created_at', 'updated_at')
    ordering = ('name_en',)

