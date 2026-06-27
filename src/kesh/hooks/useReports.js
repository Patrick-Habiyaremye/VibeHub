// hooks/useReports.js
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function useReports() {
  const [reports, setReports] = useState([]);

  const load = async () => {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    setReports(data || []);
  };

  const resolveReport = async (id) => {
    await supabase.from("reports").delete().eq("id", id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    load();
  }, []);

  return { reports, load, resolveReport };
}