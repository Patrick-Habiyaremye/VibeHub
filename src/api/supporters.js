import { supabase }
from "../supabaseClient";

export async function supportUser(
  supporterId,
  supportedUserId
){

  const { error } =
    await supabase
      .from("supporters")
      .insert({
        supporter_id:
          supporterId,

        supported_user_id:
          supportedUserId,
      });

  if(error) throw error;
}

export async function removeSupport(
  supporterId,
  supportedUserId
){

  const { error } =
    await supabase
      .from("supporters")
      .delete()
      .eq(
        "supporter_id",
        supporterId
      )
      .eq(
        "supported_user_id",
        supportedUserId
      );

  if(error) throw error;
}

export async function getSupporters(
  userId
){

  const { data,error } =
    await supabase
      .from("supporters")
      .select("*")
      .eq(
        "supported_user_id",
        userId
      );

  if(error) throw error;

  return data || [];
}