export async function resumableUpload(file, uploadId, chunkSize, onProgress) {
  const { missingChunks } = await getUploadStatus(uploadId);

  let uploaded = 0;

  await Promise.all(
    missingChunks.map(async (index) => {
      const start = index * chunkSize;
      const end = start + chunkSize;

      const chunk = file.slice(start, end);

      await uploadChunk(uploadId, index, chunk);

      uploaded++;

      onProgress(Math.round((uploaded / missingChunks.length) * 100));
    })
  );
}