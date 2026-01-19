from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        """
        當 Django 應用準備就緒時執行
        只在主進程中啟動調度器
        """
        import os
        
        # 避免在 runserver 的 reloader 進程中重複啟動
        # 只在主進程中啟動調度器
        if os.environ.get('RUN_MAIN') == 'true' or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
            try:
                from api.scheduler import start_scheduler
                start_scheduler()
            except Exception as e:
                logger.error(f"啟動調度器失敗: {str(e)}", exc_info=True)
