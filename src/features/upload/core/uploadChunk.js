async function uploadChunk(uploadId, chunkIndex, blob) {
  const res = await fetch(`/api/uploads/${uploadId}/chunk-url`, {
    method: "POST",
    body: JSON.stringify({ chunkIndex }),
  });

  const { url, headers } = await res.json();

  await fetch(url, {
    method: "PUT",
    body: blob,
    headers,
  });
}