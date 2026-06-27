// hooks/useUsers.js
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function useUsers() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*");
    setUsers(data || []);
  };

  const banUser = async (id) => {
    await supabase.from("profiles").update({ banned: true }).eq("id", id);
    load();
  };

  const changeRole = async (id, role) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return { users, load, banUser, changeRole };
}