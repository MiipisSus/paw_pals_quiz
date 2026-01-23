import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft } from "lucide-react";

import { checkEmailExists, requestPasswordReset } from "../services/apiService";

function ForgetPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setError(t("forgetPassword.errorEmailRequired"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await checkEmailExists(email);
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (error) {
      console.error("Reset password failed:", error);
      setError(error.message || t("forgetPassword.errorSendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center h-screen">
      <div className="flex justify-between items-center flex-col gap-2 w-3/10 min-w-120 h-8/10 px-10 py-10 bg-white rounded-4xl shadow-2xl">
        <div className="center flex-col">
          <h1 className="mt-8 text-brown text-3xl font-bold">
            {t("forgetPassword.title")}&nbsp;
            <span className="text-darker-accent">{t("forgetPassword.titleHighlight")}</span>
          </h1>
          <h2 className="text-brown/50 font-semibold text-center mt-2">
            {t("forgetPassword.subtitle")}
          </h2>
        </div>

        {success ? (
          <div className="flex flex-col gap-6 w-full items-center">
            <div className="center flex-col gap-4 p-6 text-center">
              <div className="center size-16 bg-green-100 rounded-full">
                <Mail className="size-8 text-green-600" />
              </div>
              <h3 className="text-brown text-xl font-bold">{t("forgetPassword.successTitle")}</h3>
              <p className="text-brown/70 text-sm">
                {t("forgetPassword.successMessage")}
                <br />
                <span className="font-semibold text-darker-accent">{email}</span>
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="center gap-2 w-full p-3 text-white font-semibold bg-darker-primary rounded-3xl btn-animate hover:bg-darker-primary/90"
            >
              <ArrowLeft className="size-4" />
              {t("forgetPassword.backToLogin")}
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

            <p className="text-brown/80">{t("forgetPassword.email")}</p>
            <div className="relative mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("forgetPassword.emailPlaceholder")}
                className="w-full pl-10 pr-4 py-2 text-darker-primary bg-secondary border border-darker-primary rounded-lg"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-darker-primary/60" />
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
              {isLoading ? t("forgetPassword.sending") : t("forgetPassword.sendResetLink")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="center gap-2 mt-2 text-darker-primary font-semibold btn-text-animate hover:text-darker-accent hover:brightness-100"
            >
              <ArrowLeft className="size-4" />
              {t("forgetPassword.backToLogin")}
            </button>
          </form>
        )}

        <div className="flex gap-3">
          <p className="inline-block text-brown font-semibold">
            {t("forgetPassword.noAccount")}
          </p>
          <button
            onClick={() => navigate("/register")}
            className="text-darker-primary font-semibold btn-text-animate"
          >
            {t("forgetPassword.signUpFree")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
