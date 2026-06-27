import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { supabase }
from "../supabaseClient";

import useRealtime
from "./useRealtime";

export default function useUnreadMessages(
  userId
){

  const [
    unread,
    setUnread
  ] = useState(0);

  const load =
    useCallback(async()=>{

      if(!userId) return;

      const {
        count
      } =
      await supabase
      .from("messages")
      .select(
        "*",
        {
          count:"exact",
          head:true,
        }
      )
      .eq(
        "receiver_id",
        userId
      )
      .is(
        "seen_at",
        null
      );

      setUnread(
        count || 0
      );

    },[
      userId
    ]);

  useEffect(()=>{

    load();

  },[
    load
  ]);

  useRealtime({

    channelName:
      `unread-${userId}`,

    table:
      "messages",

    callback:load,

  });

  return unread;

}