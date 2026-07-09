// context/FeedContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getPosts } from "../api/posts";

const FeedContext =
  createContext();

export function FeedProvider({
  children,
}) {

  const [posts,setPosts]
  = useState([]);

  const [loading,setLoading]
  = useState(true);

  const loadPosts =
  async()=>{

    try{

      setLoading(true);
      const normalizePost = (post) => {
  return {
    id: post.id,
    userId: post.user_id,
    content: post.content,

    media: {
      type:
        post.media_type ||
        (post.image_url
          ? "image"
          : post.video_url
          ? "video"
          : null),

      url:
        post.media_url ||
        post.image_url ||
        post.video_url ||
        null,

      thumbnail: post.thumbnail_url || null,
    },

    stats: {
      smiles: post.smile_score || 0,
      comments: post.comments_count || 0,
      shares: post.share_count ?? post.shares_count ?? 0,
    },

    createdAt: post.created_at,
  };
};

const data = await getPosts();
setPosts((data || []).map(normalizePost));

    }

    catch(err){

      console.error(err);

    }

    finally{

      setLoading(false);

    }

  };

  useEffect(()=>{

    loadPosts();

  },[]);

  return(

    <FeedContext.Provider

      value={{

        posts,

        setPosts,

        loading,

        reload:

        loadPosts,

      }}

    >

      {children}

    </FeedContext.Provider>

  );

}

export function useFeed(){

return useContext(

FeedContext

);

}