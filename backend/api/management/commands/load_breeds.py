import json
import os
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from api.models import Breed


class Command(BaseCommand):
    help = '從 breeds.json 載入品種資料到資料庫'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='breeds.json',
            help='JSON 檔案路径 (預設: breeds.json)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='在載入新資料前清除所有現有的品種資料'
        )

    def handle(self, *args, **options):
        # 取得 JSON 檔案路径
        json_file = options['file']
        if not os.path.isabs(json_file):
            # 如果不是絕對路徑，則相對於專案根目錄
            json_file = os.path.join(settings.BASE_DIR, json_file)

        # 檢查檔案是否存在
        if not os.path.exists(json_file):
            raise CommandError(f'檔案不存在: {json_file}')

        # 如果指定了 --clear 選項，先清除現有資料
        if options['clear']:
            deleted_count = Breed.objects.count()
            Breed.objects.all().delete()
            self.stdout.write(
                self.style.SUCCESS(f'已刪除 {deleted_count} 筆現有品種資料')
            )

        try:
            # 讀取 JSON 檔案
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 取得品種資料
            breeds_data = data.get('message', {})
            if not breeds_data:
                raise CommandError('JSON 檔案中找不到 "message" 欄位')

            # 處理品種資料
            created_count = 0
            updated_count = 0
            error_count = 0

            for breed_key, sub_breeds in breeds_data.items():
                try:
                    # 如果沒有子品種，直接創建主品種
                    if not sub_breeds:
                        slug = breed_key
                        name_en = breed_key.replace('-', ' ').title()
                        
                        breed, created = Breed.objects.get_or_create(
                            slug=slug,
                            defaults={
                                'name_en': name_en,
                                'name_zh': None
                            }
                        )
                        
                        if created:
                            created_count += 1
                            self.stdout.write(f'✓ 創建: {slug} -> {name_en}')
                        else:
                            updated_count += 1
                            self.stdout.write(f'○ 已存在: {slug}')

                    # 如果有子品種，為每個子品種創建記錄
                    else:
                        for sub_breed in sub_breeds:
                            slug = f"{breed_key}-{sub_breed}"
                            # 格式化名稱："sub_breed breed_key" 
                            name_en = f"{sub_breed.replace('-', ' ').title()} {breed_key.replace('-', ' ').title()}"
                            
                            breed, created = Breed.objects.get_or_create(
                                slug=slug,
                                defaults={
                                    'name_en': name_en,
                                    'name_zh': None
                                }
                            )
                            
                            if created:
                                created_count += 1
                                self.stdout.write(f'✓ 創建: {slug} -> {name_en}')
                            else:
                                updated_count += 1
                                self.stdout.write(f'○ 已存在: {slug}')

                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(f'✗ 處理 {breed_key} 時發生錯誤: {str(e)}')
                    )

            # 顯示總結
            self.stdout.write(
                self.style.SUCCESS(f'\n處理完成！')
            )
            self.stdout.write(f'新增: {created_count} 筆')
            self.stdout.write(f'已存在: {updated_count} 筆') 
            if error_count > 0:
                self.stdout.write(
                    self.style.ERROR(f'錯誤: {error_count} 筆')
                )

        except json.JSONDecodeError as e:
            raise CommandError(f'JSON 格式錯誤: {str(e)}')
        except Exception as e:
            raise CommandError(f'處理檔案時發生錯誤: {str(e)}')