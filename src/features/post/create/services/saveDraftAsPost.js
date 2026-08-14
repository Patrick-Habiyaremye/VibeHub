// features/create/services/saveDraftAsPost.js

import { ContentApi } from "../../../api/contentApi";
import { mapDraftToApi } from "../adapters/mapDraftToApi";

export async function saveDraftAsPost(draft) {
  const payload = mapDraftToApi(draft);
  return ContentApi.createPost(payload);
}