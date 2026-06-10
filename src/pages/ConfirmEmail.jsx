import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SignUpSuccess from "./SignUpSuccess";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setStatus("Email confirmed! Redirecting...");
        setTimeout(() => navigate("/SignUpSuccess"), 2000);
      } else {
        setStatus("Please confirm your email from inbox.");
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <div className="bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl">{status}</h2>
      </div>
    </div>
  );
}