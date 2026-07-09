// utils/compressVideo.js
// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// const ffmpeg = createFFmpeg({ log: false });

// export async function compressVideo(file) {
//   if (!ffmpeg.isLoaded()) {
//     await ffmpeg.load();
//   }

//   const inputName = "input.mp4";
//   const outputName = "output.mp4";

//   ffmpeg.FS("writeFile", inputName, await fetchFile(file));

//   // 🔥 balance quality vs size
//   await ffmpeg.run(
//     "-i", inputName,
//     "-vcodec", "libx264",
//     "-crf", "28",       // higher = smaller size
//     "-preset", "fast",
//     outputName
//   );

//   const data = ffmpeg.FS("readFile", outputName);

//   return new File([data.buffer], "compressed.mp4", {
//     type: "video/mp4",
//   });
// }


// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// const ffmpeg = createFFmpeg({ log: false });

// export async function compressVideo(file) {
//   if (!ffmpeg.isLoaded()) {
//     await ffmpeg.load();
//   }

//   ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

//   await ffmpeg.run(
//     "-i",
//     "input.mp4",
//     "-vcodec",
//     "libx264",
//     "-crf",
//     "28",
//     "output.mp4"
//   );

//   const data = ffmpeg.FS("readFile", "output.mp4");

//   return new File([data.buffer], "compressed.mp4", {
//     type: "video/mp4",
//   });
// }

export const compressVideoInWorker = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/videoWorker.js", import.meta.url),
      { type: "module" }
    );

    worker.postMessage({ file });

    worker.onmessage = (e) => {
      const { type, progress, blob, error } = e.data;

      if (type === "progress") {
        onProgress?.(progress);
      }

      if (type === "done") {
        resolve(blob);
        worker.terminate();
      }

      if (type === "error") {
        reject(error);
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };
  });
};