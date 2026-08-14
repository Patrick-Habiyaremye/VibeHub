// hooks/useAuditLog.js
//
// Writes a row to `admin_audit_log` every time an admin takes an action.
// Requires the table + RLS policy from supabase/migrations/001_admin_rls.sql.

import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function useAuditLog() {
  const { user } = useAuth();

  const logAction = async (action, targetType, targetId, meta = {}) => {
    try {
      await supabase.from("admin_audit_log").insert({
        actor_id: user?.id,
        action,          // e.g. "ban_user", "change_role", "resolve_report"
        target_type: targetType, // e.g. "profile", "report"
        target_id: targetId,
        meta,
      });
    } catch (err) {
      // Never let audit logging failure block the actual admin action.
      console.error("Failed to write audit log:", err);
    }
  };

  return { logAction };
}
