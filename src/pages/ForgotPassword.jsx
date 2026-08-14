import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);

      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        return;
      }

      setSubmitted(true);
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
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-slate-400 mt-1 mb-6">
            Enter the email you used to sign up and we'll send you a link to set a new password.
          </p>

          {submitted ? (
            <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-400 rounded-lg p-4 text-sm">
              If an account exists for <span className="font-medium">{email}</span>, a
              password reset link is on its way. Check your inbox (and spam folder).
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

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
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="text-center text-slate-400 mt-6">
            <Link to="/login" className="text-violet-400 hover:text-violet-300">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}