import {
  useEffect,
  useState,
  useCallback,
} from "react";

import { supabase }
from "../supabaseClient";

import useRealtime
from "./useRealtime";

export default function useConversation(
  userId
){

  const [
    conversations,
    setConversations
  ] = useState([]);

  const load =
    useCallback(async()=>{

      if(!userId) return;

      const {
        data,
        error,
      } =
      await supabase
      .from("conversations")
      .select(`
        *,
        participant_one:profiles!participant_one(
          id,
          username,
          avatar_url
        ),
        participant_two:profiles!participant_two(
          id,
          username,
          avatar_url
        ),
        last_message:messages(
          id,
          content,
          created_at
        )
      `)
      .or(
`participant_one.eq.${userId},
participant_two.eq.${userId}`
      )
      .order(
        "updated_at",
        {
          ascending:false
        }
      );

      if(error){

        console.error(error);

        return;

      }

      setConversations(
        data || []
      );

    },[userId]);

  useEffect(()=>{

    load();

  },[load]);

  useRealtime({

    channelName:
      `conversations-${userId}`,

    table:
      "conversations",

    callback:load,

  });

  return conversations;

}