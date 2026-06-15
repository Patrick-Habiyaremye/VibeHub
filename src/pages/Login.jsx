import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    try {
      setIsLoading(true);

      const { error } = await signIn(
        email,
        password
      );

      if (error) {
        if (error.message?.toLowerCase().includes("not confirmed")) {
          setError(
            "Please confirm your email before logging in. Check your inbox for the confirmation link."
          );
        } else {
          setError(error.message);
        }
        return;
      }

      navigate("/feed");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white">
            VibeHub
          </h1>

          <p className="text-slate-400 mt-2">
            Share your vibe with the world
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white">
            Welcome Back
          </h2>

          <p className="text-slate-400 mt-1 mb-6">
            Login to continue
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition"
            >
              {isLoading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-violet-400 hover:text-violet-300"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}