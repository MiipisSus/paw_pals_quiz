"""
APScheduler 調度器配置
用於執行定時任務
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# 創建全局調度器實例
scheduler = BackgroundScheduler(
    timezone=settings.TIME_ZONE,
    daemon=True  # 設為守護進程，當主程序退出時自動停止
)


def start_scheduler():
    """
    啟動調度器並註冊所有定時任務
    """
    if scheduler.running:
        logger.warning("調度器已經在運行中")
        return
    
    # 導入任務函數
    from api.tasks import sync_redis_data_to_db
    
    # 註冊任務：每 30 分鐘執行一次
    scheduler.add_job(
        sync_redis_data_to_db,
        trigger=IntervalTrigger(minutes=1),
        id='sync_breed_stats',
        name='同步 Redis 品種統計到資料庫',
        replace_existing=True,
        max_instances=1,  # 確保同一時間只有一個實例在運行
    )
    
    # 啟動調度器
    scheduler.start()
    logger.info("✅ APScheduler 調度器已啟動")
    logger.info("📋 已註冊的任務:")
    for job in scheduler.get_jobs():
        logger.info(f"  - {job.name} (ID: {job.id}, 觸發器: {job.trigger})")


def stop_scheduler():
    """
    停止調度器
    """
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("❌ APScheduler 調度器已停止")
