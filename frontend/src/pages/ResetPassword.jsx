import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

import { resetPassword } from "../services/apiService";

function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError(t("resetPassword.errorInvalidToken"));
    }
  }, [token, t]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError(t("resetPassword.errorFillAll"));
      return;
    }

    if (password.length < 8) {
      setError(t("resetPassword.errorPasswordLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.errorPasswordMismatch"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (error) {
      console.error("Reset password failed:", error);
      setError(error.message || t("resetPassword.errorResetFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="center h-screen">
        <div className="flex justify-center items-center flex-col gap-6 w-3/10 min-w-120 p-10 bg-white rounded-4xl shadow-2xl">
          <div className="center flex-col gap-4">
            <div className="center size-16 bg-red-100 rounded-full">
              <Lock className="size-8 text-red-600" />
            </div>
            <h1 className="text-brown text-2xl font-bold text-center">
              {t("resetPassword.invalidLinkTitle")}
            </h1>
            <p className="text-brown/70 text-center">
              {t("resetPassword.invalidLinkMessage")}
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full p-3 text-white font-semibold bg-darker-primary rounded-3xl btn-animate hover:bg-darker-primary/90"
          >
            {t("resetPassword.backToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="center h-screen">
      <div className="flex justify-between items-center flex-col gap-2 w-3/10 min-w-120 h-8/10 px-10 py-10 bg-white rounded-4xl shadow-2xl">
        <div className="center flex-col">
          <h1 className="mt-8 text-brown text-3xl font-bold">
            {t("resetPassword.title")}&nbsp;
            <span className="text-darker-accent">{t("resetPassword.titleHighlight")}</span>
          </h1>
          <h2 className="text-brown/50 font-semibold text-center mt-2">
            {t("resetPassword.subtitle")}
          </h2>
        </div>

        {success ? (
          <div className="flex flex-col gap-6 w-full items-center">
            <div className="center flex-col gap-4 p-6 text-center">
              <div className="center size-16 bg-green-100 rounded-full">
                <CheckCircle className="size-8 text-green-600" />
              </div>
              <h3 className="text-brown text-xl font-bold">{t("resetPassword.successTitle")}</h3>
              <p className="text-brown/70 text-sm">
                {t("resetPassword.successMessage")}
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="center gap-2 w-full p-3 text-white font-semibold bg-darker-primary rounded-3xl btn-animate hover:bg-darker-primary/90"
            >
              {t("resetPassword.goToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3 w-full">
            <div
              className={`p-3 text-red-600 bg-red-100 border border-red-300 rounded-lg text-sm ${
                error ? "visible fade-in" : "invisible"
              }`}
            >
              {error || "placeholder"}
            </div>

            <p className="text-brown/80">{t("resetPassword.newPassword")}</p>
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("resetPassword.passwordPlaceholder")}
                className="w-full pl-10 pr-12 py-2 text-darker-primary bg-secondary border border-darker-primary rounded-lg"
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-darker-primary/60" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darker-primary/60 hover:text-darker-primary"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <p className="text-brown/80">{t("resetPassword.confirmPassword")}</p>
            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                className="w-full pl-10 pr-12 py-2 text-darker-primary bg-secondary border border-darker-primary rounded-lg"
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-darker-primary/60" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darker-primary/60 hover:text-darker-primary"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`p-3 text-brown font-semibold rounded-3xl btn-animate ${
                isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-darker-primary hover:bg-darker-primary/90"
              }`}
            >
              {isLoading ? t("resetPassword.resetting") : t("resetPassword.resetPassword")}
            </button>
          </form>
        )}

        <div className="flex gap-3">
          <p className="inline-block text-brown font-semibold">
            {t("resetPassword.rememberPassword")}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="text-darker-primary font-semibold btn-text-animate"
          >
            {t("resetPassword.backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
