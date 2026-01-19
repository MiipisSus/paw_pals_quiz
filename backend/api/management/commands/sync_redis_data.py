"""
Django 管理命令：手動同步 Redis 數據到資料庫
使用方式: python manage.py sync_breed_stats
"""
from django.core.management.base import BaseCommand
from api.tasks import sync_redis_data_to_db


class Command(BaseCommand):
    help = '手動同步 Redis 品種統計數據到資料庫'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('開始同步品種統計數據...'))
        
        try:
            sync_redis_data_to_db()
            self.stdout.write(
                self.style.SUCCESS('✅ 同步完成！')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ 同步失敗: {str(e)}')
            )
            raise
