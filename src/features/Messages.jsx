// src/pages/Messages.jsx

import { useAuth } from "../context/AuthContext";
import MessagingShell from "../components/messaging/components/MessagingShell";

export default function Messages() {
  const {
    user,
    authLoading,
    profileLoading,
  } = useAuth();

  if (authLoading || profileLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-400">
          Loading messages...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">
            💬
          </div>

          <h1 className="text-xl font-semibold">
            Sign in to use messages
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Connect with people on VibeHub.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-slate-950">
      <MessagingShell user={user} />
    </main>
  );
}