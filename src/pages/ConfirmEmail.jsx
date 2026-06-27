import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SignUpSuccess from "./SignUpSuccess";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(
    "We sent you a confirmation link. Please check your email inbox to activate your account."
  );

  // useEffect(() => {
  //   const checkSession = async () => {
  //     const { data } = await supabase.auth.getSession();

  //     if (data.session) {
  //       setStatus("Email confirmed! Redirecting...");
  //       setTimeout(() => navigate("/SignUpSuccess"), 2000);
  //     } else {
  //       setStatus("Please confirm your email from inbox.");
  //     }
  //   };

  //   checkSession();
  // }, [navigate]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {

        if (
          event === "SIGNED_IN" &&
          session
        ) {
          navigate("/signup-success");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


//   useEffect(() => {
//     const interval = setInterval(async () => {
//     const { data } = await supabase.auth.getSession();

//     if (data.session) {
//       setStatus("Email confirmed! Redirecting...");
//       clearInterval(interval);

//       setTimeout(() => navigate("/feed"), 1500);
//     }
//   }, 2000);

//   return () => clearInterval(interval);
// }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <div className="bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl">{status}</h2>
      </div>
    </div>
  );
}