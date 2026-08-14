/**
 * services/momentApi.js
 *
 * The only file that knows about network endpoints. Everything else in
 * this feature imports from here, never calls fetch/XHR directly — swap
 * base URL, auth headers, or the transport itself in one place.
 *
 * BACKEND CONTRACT — implement these routes server-side:
 *
 *   POST   /api/scenes/upload        multipart/form-data { file }
 *          -> { url: string }                (CDN url of stored media)
 *
 *   POST   /api/moments              JSON PersistedMoment payload (see
 *                                    models/momentModel.js#toPersistedPayload)
 *          -> { id: string, ...moment }
 *
 *   GET    /api/moments?cursor=...   -> { items: PersistedMoment[], nextCursor }
 *
 *   POST   /api/moments/:id/views    JSON { sceneId }
 *          -> { ok: true }            (fire-and-forget view tracking)
 */

const BASE_URL = (typeof process !== 'undefined' && process.env && process.env.VIBEHUB_API_BASE) || '/api';

/**
 * Uploads one processed scene's blob with real upload-progress callbacks.
 * Uses XMLHttpRequest because fetch() has no upload progress event.
 */
export function uploadSceneMedia(scene, onProgress) {
  return new Promise((resolve, reject) => {
    const blob = scene.processedBlob || scene.sourceFile;
    if (!blob) {
      reject(new Error('Scene has no media to upload.'));
      return;
    }
    const form = new FormData();
    const ext = scene.type === 'video' ? 'webm' : 'jpg';
    form.append('file', blob, `${scene.id}.${ext}`);
    form.append('sceneId', scene.id);
    form.append('type', scene.type);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/scenes/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error('Malformed upload response.'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out.'));
    xhr.timeout = 120_000;
    xhr.send(form);
  });
}

export async function finalizeMoment(momentPayload) {
  const res = await fetch(`${BASE_URL}/moments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(momentPayload),
  });
  if (!res.ok) throw new Error(`Failed to publish moment (status ${res.status})`);
  return res.json();
}

export async function fetchMoments(cursor) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const res = await fetch(`${BASE_URL}/moments${qs}`);
  if (!res.ok) throw new Error(`Failed to load moments (status ${res.status})`);
  return res.json();
}

export function trackSceneView(momentId, sceneId) {
  // Fire-and-forget; view tracking should never block or throw into the UI.
  fetch(`${BASE_URL}/moments/${momentId}/views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneId }),
    keepalive: true,
  }).catch(() => {});
}