import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await updatePassword(password);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
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
          <h1 className="text-5xl font-bold text-white">VibeHub</h1>
          <p className="text-slate-400 mt-2">Share your vibe with the world</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-700 flex items-center justify-center text-emerald-400">
                <CheckIcon />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Congratulations!
              </h2>

              <p className="text-slate-300 mt-3 leading-relaxed">
                You've successfully changed your password. Keep smiling and
                stay positive — VibeHub is even better with you around. 🎉
              </p>

              <button
                onClick={() => navigate("/login")}
                className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition"
              >
                Continue to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white">
                Set a New Password
              </h2>
              <p className="text-slate-400 mt-1 mb-6">
                Choose a new password for your account
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 pr-11 text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Repeat New Password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 pr-11 text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showRepeatPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition"
                  >
                    <EyeIcon open={showRepeatPassword} />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}