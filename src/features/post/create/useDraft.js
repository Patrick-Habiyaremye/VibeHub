// features/create/useDraft.js
import { useEffect } from "react";
import { DraftManager } from "./DraftManager";

export function useDraft({ content, file, setContent, setFile }) {
  useEffect(() => {
    const draft = DraftManager.load();
    if (draft) {
      setContent(draft.content || "");
      setFile(null); // cannot restore a File object from localStorage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    DraftManager.save({ content });
  }, [content]);
}