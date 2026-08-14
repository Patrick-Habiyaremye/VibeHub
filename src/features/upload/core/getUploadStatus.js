async function getUploadStatus(uploadId) {
  const res = await fetch(`/api/uploads/${uploadId}/status`);
  return res.json();
}