import { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function useChatSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (query) => {
    if (!query) return setResults([]);

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${query}%`)
      .limit(10);

    if (error) console.error(error);

    setResults(data || []);
    setLoading(false);
  }, []);

  return { results, loading, searchUsers };
}