import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

function LoginCallback() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      // 處理錯誤
      let errorMessage = t("login.errorLoginFailed");
      
      switch (errorParam) {
        case "invalid_state":
          errorMessage = t("login.errorInvalidState");
          break;
        case "no_code":
          errorMessage = t("login.errorNoCode");
          break;
        case "no_email":
          errorMessage = t("login.errorNoEmail");
          break;
        case "oauth_failed":
          errorMessage = t("login.errorOAuthFailed");
          break;
        case "server_error":
          errorMessage = t("login.errorServerError");
          break;
        default:
          errorMessage = t("login.errorLoginFailed");
      }
      
      setError(errorMessage);
      
      // 3秒後導向登入頁面
      setTimeout(() => {
        navigate("/login", { state: { error: errorMessage } });
      }, 3000);
      return;
    }

    if (accessToken && refreshToken) {
      // 儲存 tokens
      login(accessToken, refreshToken);
      
      // 導向首頁
      navigate("/", { replace: true });
    } else {
      // 沒有 tokens，導向登入頁面
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, login, t]);

  if (error) {
    return (
      <div className="center h-screen">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-red-600">{error}</h2>
          <p className="text-gray-600">{t("login.redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="center h-screen">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl">
        <div className="w-16 h-16 border-4 border-darker-primary border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-brown">{t("login.processing")}</h2>
      </div>
    </div>
  );
}

export default LoginCallback;
