import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { registerUser, loginUser } from "../services/apiService";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await registerUser(email, password);
      await loginUser(email, password);
      navigate("/");
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="center h-screen">
      <div className="flex justify-between items-center flex-col w-120 h-8/10 p-10 bg-white rounded-4xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-darker-accent">
            <span className="block text-darker-primary">JOIN</span>THE PACK!
          </h2>
          <h3 className="text-sm font-semibold text-brown/50">
            Create an account to track your stats
          </h3>
        </div>
        <form className="flex flex-col gap-3 w-full">
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
              className="w-full pl-10 pr-4 py-2 text-darker-accent bg-tertiary/20 border border-tertiary/50 rounded-lg"
              required
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-darker-accent/60" />
          </div>
          <p className="text-brown/80">Password</p>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full pl-10 pr-4 py-2 text-darker-accent bg-tertiary/20 border border-tertiary/50 rounded-lg"
              required
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-darker-accent/60" />
          </div>
          <p className="text-brown/80">Confirm Password</p>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              className="w-full pl-10 pr-4 py-2 text-darker-accent bg-tertiary/20 border border-tertiary/50 rounded-lg"
              required
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-darker-accent/60" />
          </div>
          <button
            className="py-2 mt-5 bg-darker-accent text-white font-bold rounded-lg btn-animate hover:brightness-110"
            onClick={handleRegister}
          >
            Create Account
          </button>
        </form>
        <div className="mt-5 text-center text-sm text-gray-300 font-medium">
          <p>By registering, you agree to our Terms & Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}

export default Register;
