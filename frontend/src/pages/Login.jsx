import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { loginUser } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // 獲取使用者原本想要訪問的頁面
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("請填寫所有欄位");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser(email, password);
      console.log("Login successful:", response);

      // 使用 Auth context 的 login 函數
      login(response.access, response.refresh);

      // 導向原本想要訪問的頁面，或預設首頁
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "登入失敗，請檢查您的帳號密碼");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center h-screen">
      <div className="flex justify-between items-center flex-col gap-2 w-3/10 min-w-120 h-8/10 px-10 py-10 bg-white rounded-4xl shadow-2xl">
        <div className="center flex-col">
          <h1 className="mt-8 text-brown text-3xl font-bold">
            WELCOME&nbsp;
            <span className="text-darker-accent">BACK!</span>
          </h1>
          <h2 className="text-brown/50 font-semibold">Ready to play?</h2>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
          <div
            className={`p-3 text-red-600 bg-red-100 border border-red-300 rounded-lg text-sm ${
              error ? "visible" : "invisible"
            }`}
          >
            {error}
          </div>

          <p className="text-brown/80">Email</p>
          <div className="relative">
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

          <p className="text-brown/80">Password</p>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full pl-10 pr-4 py-2 text-darker-primary bg-secondary border border-darker-primary rounded-lg"
              required
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-darker-primary/60" />
          </div>

          <a href="#" className="ml-auto text-darker-primary">
            Forget Password?
          </a>

          <button
            type="submit"
            disabled={isLoading}
            className={`p-3 text-brown font-semibold rounded-3xl btn-animate ${
              isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-darker-primary hover:bg-darker-primary/90"
            }`}
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
        <div className="center flex-col gap-3 w-full">
          <div class="flex items-center w-full">
            <div class="grow h-px bg-brown/30"></div>
            <span class="px-3 text-brown/30 text-sm font-semibold">OR</span>
            <div class="grow h-px bg-brown/30"></div>
          </div>
          <button className="center gap-3 w-full p-3 text-darker-accent font-semibold bg-white border-2 border-accent/70 rounded-3xl btn-animate hover:bg-gray-50">
            <svg className="inline-block w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            Sign in with Google
          </button>
        </div>
        <div className="flex gap-3">
          <p className="inline-block text-brown font-semibold">
            No account yet?
          </p>
          <button
            onClick={() => navigate("/register")}
            className="text-darker-primary font-semibold btn-animate hover:brightness-110"
          >
            Sign up for free
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
