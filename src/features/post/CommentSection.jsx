import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../supabaseClient";

export default function CommentSection({
  postId,
}) {

  const [comments,setComments]
  = useState([]);

  const [comment,setComment]
  = useState("");

  const [loading,setLoading]
  = useState(false);

  const loadComments = async () => {

    const {
      data,
      error
    } = await supabase
      .from("comments")
      .select(`
        *,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq("post_id",postId)
      .order(
        "created_at",
        {
          ascending:true
        }
      );

    if(error){

      console.error(error);

      return;
    }

    setComments(data || []);

  };

  useEffect(()=>{

    loadComments();

  },[postId]);

  // useEffect(()=>{

  //   const channel = supabase

  //     .channel(
  //       `comments-${postId}`
  //     )

  //     .on(
  //       "postgres_changes",
  //       {
  //         event:"INSERT",
  //         schema:"public",
  //         table:"comments",
  //         filter:`post_id=eq.${postId}`
  //       },
  //       (payload)=>{

  //         setComments(prev=>[
  //           ...prev,
  //           payload.new
  //         ]);

  //       }
  //     )

  //     .subscribe();

  //   return ()=>{

  //     supabase.removeChannel(
  //       channel
  //     );

  //   };

  // },[postId]);

  useEffect(()=>{

loadComments();

const channel =
supabase
.channel(
`comments-${postId}`
)

.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"comments",
filter:`post_id=eq.${postId}`
},
()=>{

loadComments();

}
)

.subscribe();

return()=>{

supabase.removeChannel(
channel
);

};

},[postId]);

  const addComment = async()=>{

    if(!comment.trim()) return;

    try{

      setLoading(true);

      const {

        data:{user}

      } = await supabase
      .auth
      .getUser();

      if(!user) return;

      const { error } = await supabase

        .from("comments")

        .insert({

          user_id:user.id,

          post_id:postId,

          content:comment.trim(),

        });

      if(error)
      throw error;

      setComment("");

    }

    catch(err){

      console.error(err);

    }

    finally{

      setLoading(false);

    }

  };

  return(

    <div className="mt-4">

      <div className="space-y-2">

        {comments.map(c=>(

          <div
            key={c.id}
            className="
              bg-slate-700
              rounded-lg
              p-3
            "
          >

            <p className="
              text-yellow-400
              text-xs
              mb-1
            ">
              {
                c.profiles?.username ||
                "User"
              }
            </p>

            <p className="text-white">
              {c.content}
            </p>

          </div>

        ))}

      </div>

      <div className="
        flex
        gap-2
        mt-3
      ">

        <input

          value={comment}

          onChange={(e)=>
            setComment(
              e.target.value
            )
          }

          placeholder="
            Say something kind 💛
          "

          className="
            flex-1
            bg-slate-900
            text-white
            px-3
            py-2
            rounded-lg
          "
        />

        <button

          disabled={
            loading ||
            !comment.trim()
          }

          onClick={addComment}

          className="
            bg-yellow-500
            text-black
            px-4
            rounded-lg
          "
        >

          {
            loading
            ? "..."
            : "Post"
          }

        </button>

      </div>

    </div>

  );

}