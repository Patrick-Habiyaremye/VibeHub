import { supabase } from "../../supabaseClient";

export default function DangerZone() {

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="bg-red-900/20 border border-red-500 p-5 rounded-xl">

      <h2 className="text-red-400 text-xl mb-4">
        Danger Zone
      </h2>

      <button
        onClick={logout}
        className="bg-red-500 px-4 py-2 rounded text-white"
      >
        Logout
      </button>

    </div>
  );
}