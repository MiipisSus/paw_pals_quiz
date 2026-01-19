"""
測試定時任務系統
"""
import os
import sys
import django

# 設置 Django 環境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.cache import cache
from api.models import Breed
from api.tasks import sync_breed_stats_from_redis, calculate_hardest_breeds


def test_sync_system():
    """測試同步系統"""
    print("=" * 60)
    print("測試定時同步系統")
    print("=" * 60)
    
    # 1. 準備測試數據：在 Redis 中模擬一些統計
    print("\n1️⃣  準備測試數據...")
    breeds = Breed.objects.all()[:5]
    
    for i, breed in enumerate(breeds):
        attempts = (i + 1) * 10
        correct = (i + 1) * 5
        
        cache.set(f"breed:{breed.slug}:attempts", attempts)
        cache.set(f"breed:{breed.slug}:correct", correct)
        print(f"   ✓ 設置 {breed.slug}: {attempts} 次嘗試, {correct} 次正確")
    
    # 2. 執行同步
    print("\n2️⃣  執行同步任務...")
    sync_breed_stats_from_redis()
    
    # 3. 驗證結果
    print("\n3️⃣  驗證同步結果...")
    for breed in breeds:
        breed.refresh_from_db()
        print(f"   ✓ {breed.slug}:")
        print(f"      - total_attempts: {breed.total_attempts}")
        print(f"      - correct_attempts: {breed.correct_attempts}")
        
        # 檢查 Redis 是否已清空
        redis_attempts = cache.get(f"breed:{breed.slug}:attempts")
        redis_correct = cache.get(f"breed:{breed.slug}:correct")
        if redis_attempts is None and redis_correct is None:
            print(f"      - Redis 數據已清空 ✓")
        else:
            print(f"      - ⚠️  Redis 數據未清空！")
    
    # 4. 測試最難品種計算
    print("\n4️⃣  測試最難品種統計...")
    calculate_hardest_breeds(top_n=5)
    
    from api.models import HardestBreedStat
    hardest = HardestBreedStat.objects.select_related('breed').order_by('rank')[:5]
    
    print(f"\n   最難品種排名（前 5 名）:")
    print(f"   {'排名':<6} {'品種':<20} {'正確率':<10} {'嘗試次數':<10}")
    print(f"   {'-'*50}")
    for stat in hardest:
        print(f"   {stat.rank:<6} {stat.breed.slug:<20} {stat.correct_rate:.2f}%{' '*4} {stat.breed.total_attempts:<10}")
    
    print("\n" + "=" * 60)
    print("✅ 測試完成！")
    print("=" * 60)


if __name__ == '__main__':
    test_sync_system()
