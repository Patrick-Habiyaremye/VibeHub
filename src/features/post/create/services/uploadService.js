// features/create/services/uploadService.js
export async function uploadService(file, onProgress) {
  if (!file) return null;

  // simulate upload (replace with real storage logic)
  return new Promise((resolve, reject) => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        resolve(URL.createObjectURL(file)); // replace with real URL
      }
    }, 200);
  });
}