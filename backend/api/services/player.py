from django.contrib.auth.models import User

from api.models import PlayerInfo


class PlayerService:
    @staticmethod
    def create_user(username: str, password: str = None, email: str = None) -> User:
        """創建新用戶並確保關聯的 PlayerInfo 被創建"""
        # 對於 Google OAuth 用戶，不設置密碼（使用不可用密碼）
        if password is None:
            user = User.objects.create(
                username=username,
                email=email or username,
            )
            user.set_unusable_password()
            user.save()
        else:
            user = User.objects.create_user(
                username=username,
                email=email or username,
                password=password
            )
        
        # 使用 get_or_create 確保 PlayerInfo 被創建
        PlayerInfo.objects.get_or_create(user=user)
        return user
    
    @staticmethod
    def get_user_by_email(email: str) -> User | None:
        """通過 email 查找用戶（支援 email 和 username 欄位）"""
        try:
            # 首先嘗試通過 email 欄位查找
            return User.objects.get(email=email)
        except User.DoesNotExist:
            try:
                # 如果沒找到，嘗試通過 username 查找（舊數據兼容）
                return User.objects.get(username=email)
            except User.DoesNotExist:
                return None
    
    @staticmethod
    def get_or_create_by_email(email: str) -> tuple[User, bool]:
        """獲取或創建用戶，返回 (user, created)"""
        user = PlayerService.get_user_by_email(email=email)
        if user:
            return user, False
        
        user = PlayerService.create_user(username=email, email=email)
        return user, True