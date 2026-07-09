import { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpeg = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => {
    // optional: debug logs
    // console.log(message);
  });

  ffmpeg.on("progress", ({ progress }) => {
    self.postMessage({
      type: "progress",
      progress,
    });
  });

  await ffmpeg.load();

  return ffmpeg;
};

self.onmessage = async (e) => {
  const { file } = e.data;

  try {
    const ffmpeg = await loadFFmpeg();

    const inputName = "input.mp4";
    const outputName = "output.mp4";

    await ffmpeg.writeFile(inputName, await file.arrayBuffer());

    await ffmpeg.exec([
      "-i", inputName,
      "-vcodec", "libx264",
      "-crf", "28",
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);

    const blob = new Blob([data.buffer], { type: "video/mp4" });

    self.postMessage({
      type: "done",
      blob,
    });

  } catch (err) {
    self.postMessage({
      type: "error",
      error: err.message,
    });
  }
};