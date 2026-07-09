// import { supabase } from "../supabaseClient";
// import { loadQueue, updateQueue } from "./uploadQueue";
// import { compressVideoInWorker } from "./compressVideo";

// let isProcessing = false;

// export async function processQueue(onUpdate) {
//   if (isProcessing) return;
//   isProcessing = true;

//   const queue = loadQueue();

//   for (const item of queue) {
//     if (item.status === "done") continue;

//     try {
//       updateQueue(item.id, { status: "processing" });

//       // -----------------------
//       // 1. COMPRESS
//       // -----------------------
//       // 1. compress
// const compressed = await compressVideoInWorker(item.file);

// // 2. upload
// const { error } = await supabase.storage
//   .from("reels")
//   .upload(item.path, compressed);

// if (error) throw error;

// // 3. signed url
// const { data: signed } = await supabase.storage
//   .from("reels")
//   .createSignedUrl(item.path, 60 * 60);

// // 4. insert
// const { data: post, error: dbError } = await supabase
//   .from("posts")
//   .insert({
//     user_id: item.userId,
//     content: item.caption,
//     media: {
//       kind: "video",
//       url: signed?.signedUrl,
//       path: item.path,
//     },
//   })
//   .select(`
//     id,
//     content,
//     media,
//     created_at,
//     profiles (
//       username,
//       avatar_url
//     )
//   `)
//   .single();

// if (dbError) throw dbError;

// // 5. done
// removeFromQueue(item.id);

// onUpdate?.({
//   ...post,
//   uploading: false,
//   progress: 100,
// });

//     } catch (err) {
//       console.error(err);

//       updateQueue(item.id, {
//         status: "failed",
//         retries: item.retries + 1,
//       });

//       onUpdate?.({
//         id: item.id,
//         error: true,
//         uploading: false,
//       });
//     }
//   }

//   isProcessing = false;
// }


import { supabase } from "../supabaseClient";
import {
  loadQueue,
  updateQueue,
  removeFromQueue,
} from "./uploadQueue";
import { getFile, deleteFile } from "./fileStore";

let isProcessing = false;

export async function processQueue(onUpdate) {
  if (isProcessing) return;
  isProcessing = true;

  console.log("STEP 3: Worker started");

  const queue = loadQueue();

  for (const item of queue) {
    if (item.status === "done") continue;

    console.log("PROCESSING ITEM:", item);

    try {
      updateQueue(item.id, { status: "processing" });

      // ✅ GET REAL FILE
      const file = await getFile(item.id);

      if (!file) {
        throw new Error("File missing from IndexedDB");
      }

      console.log("STEP 5: File loaded");

      // ✅ UPLOAD (FIXED MIME)
      console.log("STEP 6: Uploading...");

      const { error: uploadError } = await supabase.storage
        .from("reels")
        .upload(item.path, file, {
          contentType: file.type || "video/mp4",
        });

      if (uploadError) throw uploadError;

      console.log("STEP 7: Upload success");

      // ✅ PUBLIC URL (NO EXPIRY)
      const { data } = supabase.storage
        .from("reels")
        .getPublicUrl(item.path);

      const videoUrl = data.publicUrl;

      // ✅ INSERT DB
      console.log("STEP 8: Inserting DB...");

      const { data: post, error: dbError } = await supabase
        .from("posts")
        .insert({
          user_id: item.userId,
          content: item.caption,
          media: {
            kind: "video",
            url: videoUrl,
            path: item.path,
          },
        })
        .select(`
          id,
          content,
          media,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .single();

      if (dbError) throw dbError;

      console.log("STEP 9: DB success", post);

      onUpdate?.({
        ...post,
        uploading: false,
        progress: 100,
      });

      // ✅ CLEAN UP
      removeFromQueue(item.id);
      await deleteFile(item.id);

    } catch (err) {
      console.error("STEP ERROR:", err);

      updateQueue(item.id, {
        status: "failed",
        retries: (item.retries || 0) + 1,
      });

      onUpdate?.({
        id: item.id,
        uploading: false,
        error: true,
      });
    }
  }

  isProcessing = false;
}

