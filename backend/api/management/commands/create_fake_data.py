import random
from django.core.management.base import BaseCommand
from api.models import Breed


class Command(BaseCommand):
    help = '創建假數據以測試品種猜對率統計'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='要修改的品種數量 (預設: 20)'
        )
        parser.add_argument(
            '--reset',
            action='store_true',
            help='重置所有品種的統計數據為 0'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # 如果指定了 --reset，重置所有數據
        if options['reset']:
            updated = Breed.objects.all().update(
                total_attempts=0,
                correct_attempts=0
            )
            self.stdout.write(
                self.style.SUCCESS(f'✓ 已重置 {updated} 個品種的統計數據')
            )
            return

        # 獲取所有品種
        all_breeds = list(Breed.objects.all())
        
        if not all_breeds:
            self.stdout.write(
                self.style.ERROR('資料庫中沒有品種資料！')
            )
            return
        
        # 隨機選擇品種
        selected_count = min(count, len(all_breeds))
        selected_breeds = random.sample(all_breeds, selected_count)
        
        self.stdout.write(f'準備為 {selected_count} 個品種創建假數據...\n')
        
        updated_count = 0
        
        for breed in selected_breeds:
            # 生成隨機數據
            total_attempts = random.randint(10, 200)
            # 正確率在 10% 到 90% 之間
            correct_rate = random.uniform(0.1, 0.9)
            correct_attempts = int(total_attempts * correct_rate)
            
            # 更新品種
            breed.total_attempts = total_attempts
            breed.correct_attempts = correct_attempts
            breed.save(update_fields=['total_attempts', 'correct_attempts'])
            
            # 計算實際正確率
            actual_rate = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
            
            self.stdout.write(
                f'✓ {breed.slug:30} | 嘗試: {total_attempts:3}次 | '
                f'正確: {correct_attempts:3}次 | 正確率: {actual_rate:5.1f}%'
            )
            updated_count += 1
        
        # 顯示總結
        self.stdout.write(
            self.style.SUCCESS(f'\n完成！已為 {updated_count} 個品種創建假數據')
        )
        self.stdout.write(
            self.style.WARNING(
                f'\n提示: 執行 python manage.py shell -c '
                f'"from api.tasks import calculate_hardest_breeds; calculate_hardest_breeds()" '
                f'來計算最難品種排名'
            )
        )
