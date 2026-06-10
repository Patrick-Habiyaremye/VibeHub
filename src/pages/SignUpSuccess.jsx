import { Link } from "react-router-dom";

export default function SignUpSuccess() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        
        <div className="text-6xl mb-4">
          🎉
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to VibeHub!
        </h1>

        <p className="text-slate-300 mb-6">
          Your account has been created successfully.
          Start sharing positivity, collecting smiles,
          and completing daily challenges.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-6">
          <p className="text-yellow-300 font-medium">
            🌟 Today's Mission
          </p>
          <p className="text-slate-200 mt-2">
            Make 3 people smile today 😊
          </p>
        </div>

        <Link
          to="/feed"
          className="block w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition"
        >
          Continue to Feed
        </Link>
      </div>
    </div>
  );
}