from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = '創建預設測試使用者'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='在創建新使用者前清除所有現有使用者資料'
        )

    def handle(self, *args, **options):
        # 如果指定了 --clear 選項，先清除現有使用者資料
        if options['clear']:
            deleted_count = User.objects.count()
            User.objects.all().delete()
            self.stdout.write(
                self.style.SUCCESS(f'已刪除 {deleted_count} 筆現有使用者資料')
            )

        username = 'test'
        password = 'test'

        try:
            # 檢查使用者是否已存在
            if User.objects.filter(username=username).exists():
                self.stdout.write(f'○ 使用者已存在: {username}')
                existing_user = User.objects.get(username=username)
                self.stdout.write(f'  使用者 ID: {existing_user.id}')
                return

            # 創建新使用者
            user = User.objects.create_user(
                username=username,
                password=password
            )
            
            self.stdout.write(f'✓ 創建使用者: {username} (ID: {user.id})')
            self.stdout.write(
                self.style.SUCCESS(f'\n處理完成！')
            )
            self.stdout.write(f'總使用者數: {User.objects.count()} 人')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'創建使用者時發生錯誤: {str(e)}')
            )