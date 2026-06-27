import { useState } from "react";
import {
  Image,
  Video,
  Send,
  Lock,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { createPost } from "../../api/posts";

import {
  uploadPostMedia,
} from "../../api/storage";

export default function CreatePost({
  onPostCreated,
}) {

  const { user } = useAuth();

  const [content, setContent] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [mediaType, setMediaType] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showAuthPrompt,
    setShowAuthPrompt] =
    useState(false);

  const isLoggedIn = !!user;


  const requireAuth = () => {

    if (!isLoggedIn) {

      setShowAuthPrompt(true);

      return false;
    }

    return true;

  };


  const handleFileChange = (
    e,
    type
  ) => {

    if (!requireAuth()) return;

    const selected =
      e.target.files[0];

    if (!selected) return;

    setFile(selected);

    setMediaType(type);

  };


  const handlePost = async () => {

    if (!requireAuth()) return;

    if (
      !content.trim() &&
      !file
    ) {

      return;

    }

    try {

      setLoading(true);

      setError("");

      let mediaUrl = null;


      if (file) {

        mediaUrl =
          await uploadPostMedia(

            user.id,

            file,

            mediaType

          );

      }


      await createPost({

        user_id:
          user.id,

        content:
          content.trim(),

        media_url:
          mediaUrl,

        media_type:

          file

          ? mediaType

          : "text"

      });


      setContent("");

      setFile(null);

      setMediaType(null);


      onPostCreated?.();

    }

    catch (err) {

      console.error(err);

      setError(
        err.message
      );

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="
      bg-slate-800
      rounded-xl
      p-4
      border
      border-slate-700
      mb-6
    ">

      {showAuthPrompt && (

        <div className="
          mb-4
          p-3
          bg-red-500/10
          border
          border-red-500
          text-red-300
          rounded-lg
        ">

          <div className="flex items-center gap-2">

            <Lock size={18}/>

            Please sign in first

          </div>

        </div>

      )}

      {error && (

        <div className="text-red-400 mb-3">

          {error}

        </div>

      )}


      <textarea

        rows="4"

        value={content}

        disabled={!isLoggedIn}

        onChange={(e)=>

          setContent(

            e.target.value

          )

        }

        placeholder={

          isLoggedIn

          ?

          "What's making you smile today? 😊"

          :

          "Login to share positivity"

        }

        className="

          w-full

          bg-slate-900

          text-white

          rounded-lg

          p-3

          resize-none

          outline-none

        "

      />


      {file && (

        <div className="
          mt-2
          text-sm
          text-slate-300
        ">

          📎 {file.name}

        </div>

      )}


      <div className="
        flex
        justify-between
        items-center
        mt-4
      ">

        <div className="flex gap-4">

          <label className="
            flex
            gap-2
            cursor-pointer
            text-slate-300
          ">

            <Image size={18}/>

            Photo

            <input

              type="file"

              accept="image/*"

              hidden

              onChange={(e)=>

                handleFileChange(

                  e,

                  "image"

                )

              }

            />

          </label>


          <label className="
            flex
            gap-2
            cursor-pointer
            text-slate-300
          ">

            <Video size={18}/>

            Video

            <input

              type="file"

              accept="video/*"

              hidden

              onChange={(e)=>

                handleFileChange(

                  e,

                  "video"

                )

              }

            />

          </label>

        </div>


        <button

          onClick={handlePost}

          disabled={
            loading ||

            (

              !content.trim()

              &&

              !file

            )
          }

          className="

            bg-yellow-500

            hover:bg-yellow-600

            text-black

            px-4

            py-2

            rounded-lg

          "

        >

          {

            loading

            ?

            "Posting..."

            :

            "Share"

          }

        </button>

      </div>

    </div>

  );

}