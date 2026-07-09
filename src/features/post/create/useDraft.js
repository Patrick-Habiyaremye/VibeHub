import { useEffect } from "react";
import { DraftManager } from "./DraftManager";

export function useDraft({ content, file, setContent, setFile }) {
  // load draft
  useEffect(() => {
    const draft = DraftManager.load();
    if (draft) {
      setContent(draft.content || "");
      setFile(null); // ⚠️ cannot restore file
    }
  }, []);

  // save draft
  useEffect(() => {
    DraftManager.save({ content });
  }, [content]);
}