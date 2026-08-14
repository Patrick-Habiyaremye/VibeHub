// engines/mediaProcessor.js

export async function processMedia(file, fileUrl) {
  const type = file.type.startsWith("video") ? "video" : "image";

  // You can extend this later (thumbnails, compression, etc)
  return {
    url: fileUrl,
    type,
  };
}