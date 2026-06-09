import { useAuth } from "../../context/AuthContext";

export default function Feed() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold">
        Welcome to VibeHub
      </h1>

      <p className="mt-2">
        {user?.email}
      </p>

      <button
        onClick={signOut}
        className="mt-4 bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}