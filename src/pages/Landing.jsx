import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/feed");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 text-slate-300">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-8">

          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white">
              VibeHub
            </h1>

            <p className="text-2xl text-slate-300">
              Share Your Vibe
            </p>

            <p className="text-slate-400">
              Connect with friends, share moments,
              discover content, and chat in real time.
            </p>
          </div>

          <div className="space-y-4 pt-8">

            <button
              onClick={() => navigate("/register")}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl text-lg font-medium transition"
            >
              Get Started
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full border border-slate-700 hover:bg-slate-800 text-white py-4 rounded-xl text-lg font-medium transition"
            >
              Sign In
            </button>

          </div>

          <div className="grid grid-cols-3 gap-6 pt-16 text-center">

            <div>
              <p className="text-2xl font-bold text-white">
                10M+
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Active Users
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white">
                50M+
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Posts Shared
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white">
                100%
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Free & Open
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}