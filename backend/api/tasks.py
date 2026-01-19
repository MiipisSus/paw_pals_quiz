"""
定時任務：同步 Redis 數據到資料庫
"""
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from api.models import Breed, HardestBreedStat, GlobalStat
import logging

logger = logging.getLogger(__name__)


def sync_redis_data_to_db():
    sync_game_count_from_redis()
    sync_breed_stats_from_redis()
    calculate_global_avg_accuracy()
    calculate_hardest_breeds()
    
def sync_game_count_from_redis():
    total_games_key = 'global:count:games'
    total_rounds_key = 'global:count:rounds'
    total_correct_key = 'global:count:correct'
    
    redis_total_games = cache.get(total_games_key) or 0
    redis_total_rounds = cache.get(total_rounds_key) or 0
    redis_total_correct = cache.get(total_correct_key) or 0
    global_stat, created = GlobalStat.objects.get_or_create(id=1)
    
    if redis_total_games > 0 or redis_total_rounds > 0 or redis_total_correct > 0:
        with transaction.atomic():
            global_stat, created = GlobalStat.objects.get_or_create(id=1)
            if redis_total_games > 0:
                global_stat.total_games += redis_total_games
                cache.delete(total_games_key)
            if redis_total_rounds > 0:
                global_stat.total_rounds += redis_total_rounds
                cache.delete(total_rounds_key)
            if redis_total_correct > 0:
                global_stat.total_correct += redis_total_correct
                cache.delete(total_correct_key)
                
            global_stat.save(update_fields=['total_games', 'total_rounds', 'total_correct'])
            
        logger.info(f"同步全局遊戲數據: total_games +{redis_total_games}, total_rounds +{redis_total_rounds}, total_correct +{redis_total_correct}")
            
    cache.set('global:stats:total_games', global_stat.total_games)
    cache.set('global:stats:total_rounds', global_stat.total_rounds)
    cache.set('global:stats:total_correct', global_stat.total_correct)        
    
def sync_breed_stats_from_redis():
    """
    從 Redis 同步品種統計數據到資料庫
    每半小時執行一次
    """
    logger.info("開始同步 Redis 品種統計數據...")
    
    try:
        # 獲取所有品種
        breeds = Breed.objects.all()
        updated_count = 0
        
        with transaction.atomic():
            for breed in breeds:
                # Redis key 格式: breed:{slug}:attempts 和 breed:{slug}:correct
                attempts_key = f"breed:{breed.slug}:attempts"
                correct_key = f"breed:{breed.slug}:correct"
                
                # 從 Redis 獲取數據
                redis_attempts = cache.get(attempts_key) or 0
                redis_correct = cache.get(correct_key) or 0
                
                # 如果 Redis 中有新數據，則更新到資料庫
                if redis_attempts > 0 or redis_correct > 0:
                    # 累加到資料庫
                    breed.total_attempts += redis_attempts
                    breed.correct_attempts += redis_correct
                    breed.save(update_fields=['total_attempts', 'correct_attempts'])
                    
                    # 清空 Redis 計數器（已同步到資料庫）
                    cache.delete(attempts_key)
                    cache.delete(correct_key)
                    
                    updated_count += 1
                    logger.debug(
                        f"更新品種 {breed.slug}: "
                        f"attempts +{redis_attempts}, correct +{redis_correct}"
                    )
        
        logger.info(f"同步完成！共更新 {updated_count} 個品種")
        
    except Exception as e:
        logger.error(f"同步品種統計數據時發生錯誤: {str(e)}", exc_info=True)
        raise


def calculate_global_avg_accuracy():
    pass
    
def calculate_hardest_breeds(top_n=10):
    """
    計算並更新最難猜測的品種排名
    基於正確率（correct_attempts / total_attempts）
    """
    logger.info("開始計算最難品種統計...")
    print("=" * 60)
    print("開始計算最難品種統計...")
    
    try:
        # 獲取所有有嘗試記錄的品種，並計算正確率
        breeds_with_stats = Breed.objects.filter(
            total_attempts__gt=0
        ).annotate(
            # 使用 F 表達式計算正確率
            # correct_rate = correct_attempts / total_attempts
        ).values(
            'id',
            'slug', 
            'name_en',
            'name_zh',
            'total_attempts',
            'correct_attempts'
        )
        
        print(f"找到 {len(breeds_with_stats)} 個有嘗試記錄的品種")
        
        # 計算正確率並排序（正確率越低越難）
        breeds_stats = []
        for breed in breeds_with_stats:
            if breed['total_attempts'] > 0:
                correct_rate = (breed['correct_attempts'] / breed['total_attempts']) * 100
                breeds_stats.append({
                    'breed_id': breed['id'],
                    'slug': breed['slug'],
                    'correct_rate': correct_rate,
                    'total_attempts': breed['total_attempts']
                })
        
        # 按正確率升序排序（最難的在前面）
        # 同時考慮最小嘗試次數（避免樣本太少的品種）
        MIN_ATTEMPTS = 10  # 至少需要 10 次嘗試才納入排名
        breeds_stats = [b for b in breeds_stats if b['total_attempts'] >= MIN_ATTEMPTS]
        breeds_stats.sort(key=lambda x: x['correct_rate'])
        
        print(f"符合最小嘗試次數 (>={MIN_ATTEMPTS}) 的品種: {len(breeds_stats)}")
        
        # 更新 HardestBreedStat 表
        with transaction.atomic():
            # 清空舊數據
            deleted_count = HardestBreedStat.objects.count()
            HardestBreedStat.objects.all().delete()
            print(f"已刪除 {deleted_count} 筆舊排名資料")
            
            # 插入新的排名
            hardest_stats = []
            for rank, breed_stat in enumerate(breeds_stats[:top_n], start=1):
                hardest_stats.append(
                    HardestBreedStat(
                        rank=rank,
                        breed_id=breed_stat['breed_id'],
                        correct_rate=breed_stat['correct_rate']
                    )
                )
            
            # 批量創建
            if hardest_stats:
                HardestBreedStat.objects.bulk_create(hardest_stats)
                logger.info(f"已更新前 {len(hardest_stats)} 個最難品種排名")
                print(f"\n✓ 已更新前 {len(hardest_stats)} 個最難品種排名:")
                print("-" * 60)
                for i, stat in enumerate(hardest_stats, 1):
                    breed = Breed.objects.get(id=stat.breed_id)
                    print(f"  {i}. {breed.slug:30} | 正確率: {stat.correct_rate:5.1f}%")
                print("-" * 60)
            else:
                logger.warning("沒有足夠的數據來計算最難品種排名")
                print("⚠ 沒有足夠的數據來計算最難品種排名")
        
        print("=" * 60)
        
    except Exception as e:
        logger.error(f"計算最難品種統計時發生錯誤: {str(e)}", exc_info=True)
        print(f"✗ 錯誤: {str(e)}")
        raise


def test_sync_task():
    """
    測試用函數：手動觸發同步任務
    """
    print("=" * 50)
    print("手動執行同步任務...")
    print("=" * 50)
    sync_breed_stats_from_redis()
    print("同步任務完成！")
