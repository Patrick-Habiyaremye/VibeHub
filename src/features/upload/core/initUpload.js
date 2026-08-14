async function initUpload(file) {
  const res = await fetch("/api/uploads/init", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      size: file.size,
      mime: file.type,
    }),
  });

  return res.json();
}