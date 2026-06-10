import { useState } from "react";
import { Image, Video, Send } from "lucide-react";

export default function CreatePost() {
  const [content, setContent] = useState("");

  const handlePost = () => {
    console.log(content);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's making you smile today? 😊"
        className="w-full bg-slate-900 rounded-lg p-3 text-white resize-none outline-none"
        rows="4"
      />

      <div className="flex justify-between items-center mt-4">

        <div className="flex gap-4">

          <button className="flex items-center gap-2 text-slate-300">
            <Image size={18}/>
            Photo
          </button>

          <button className="flex items-center gap-2 text-slate-300">
            <Video size={18}/>
            Video
          </button>

        </div>

        <button
          onClick={handlePost}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Send size={18}/>
          Share
        </button>

      </div>
    </div>
  );
}