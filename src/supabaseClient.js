import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wviyfshrvvtkbcxhrgfs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aXlmc2hydnZ0a2JjeGhyZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTI1NjYsImV4cCI6MjA5NjU4ODU2Nn0.N-vPF8Df6F7aNi9msCOL_HTeFCUgGA9uYI9FFd-NG14";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);