// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://wviyfshrvvtkbcxhrgfs.supabase.co";
// const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aXlmc2hydnZ0a2JjeGhyZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTI1NjYsImV4cCI6MjA5NjU4ODU2Nn0.N-vPF8Df6F7aNi9msCOL_HTeFCUgGA9uYI9FFd-NG14";

// export const supabase = createClient(
//   supabaseUrl,
//   supabaseAnonKey
// );

//supabaseclient.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars — check your .env file and restart the dev server.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


//.env
// VITE_SUPABASE_URL=https://wviyfshrvvtkbcxhrgfs.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aXlmc2hydnZ0a2JjeGhyZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTI1NjYsImV4cCI6MjA5NjU4ODU2Nn0.N-vPF8Df6F7aNi9msCOL_HTeFCUgGA9uYI9FFd-NG14