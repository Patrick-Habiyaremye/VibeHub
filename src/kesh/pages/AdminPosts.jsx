import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function deletePost(id) {
    await supabase.from("posts").delete().eq("id", id);
    loadPosts();
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Posts</h1>

      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-slate-800 p-4 rounded-xl">
            <p className="mb-2">{p.content}</p>

            <button
              onClick={() => deletePost(p.id)}
              className="text-red-400"
            >
              Delete Post
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}