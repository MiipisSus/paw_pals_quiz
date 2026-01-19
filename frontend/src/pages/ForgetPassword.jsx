import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("請輸入您的電子信箱");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: 實作重設密碼 API 呼叫
      // await resetPassword(email);
      
      // 模擬 API 呼叫
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
    } catch (error) {
      console.error("Reset password failed:", error);
      setError(error.message || "發送重設信件失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center h-screen">
      <div className="flex justify-between items-center flex-col gap-2 w-3/10 min-w-120 h-8/10 px-10 py-10 bg-white rounded-4xl shadow-2xl">
        <div className="center flex-col">
          <h1 className="mt-8 text-brown text-3xl font-bold">
            FORGOT&nbsp;
            <span className="text-darker-accent">PASSWORD?</span>
          </h1>
          <h2 className="text-brown/50 font-semibold text-center mt-2">
            No worries, we'll send you reset instructions.
          </h2>
        </div>

        {success ? (
          <div className="flex flex-col gap-6 w-full items-center">
            <div className="center flex-col gap-4 p-6 text-center">
              <div className="center size-16 bg-green-100 rounded-full">
                <Mail className="size-8 text-green-600" />
              </div>
              <h3 className="text-brown text-xl font-bold">Check your email</h3>
              <p className="text-brown/70 text-sm">
                We sent a password reset link to
                <br />
                <span className="font-semibold text-darker-accent">{email}</span>
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="center gap-2 w-full p-3 text-white font-semibold bg-darker-primary rounded-3xl btn-animate hover:bg-darker-primary/90"
            >
              <ArrowLeft className="size-4" />
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3 w-full">
            <div
              className={`p-3 text-red-600 bg-red-100 border border-red-300 rounded-lg text-sm ${
                error ? "visible" : "invisible"
              }`}
            >
              {error}
            </div>

            <p className="text-brown/80">Email</p>
            <div className="relative mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
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
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="center gap-2 mt-2 text-darker-primary font-semibold btn-text-animate hover:text-darker-accent hover:brightness-100"
            >
              <ArrowLeft className="size-4" />
              Back to Login
            </button>
          </form>
        )}

        <div className="flex gap-3">
          <p className="inline-block text-brown font-semibold">
            Don't have an account?
          </p>
          <button
            onClick={() => navigate("/register")}
            className="text-darker-primary font-semibold btn-text-animate"
          >
            Sign up for free
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
