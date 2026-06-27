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

      const data =
      await getPosts();

      setPosts(
        data || []
      );

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