// repositories/userRepo.js

import { supabase } from "../config/supabase.js";

export const userRepo = {
  async addXP(userId, xp) {
    const { data } = await supabase.rpc("add_xp", {
      user_id: userId,
      xp,
    });

    return data; // must return { level, leveledUp }
  },
};