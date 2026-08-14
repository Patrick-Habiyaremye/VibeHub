// features/reels/UploadDock.jsx
//
// Fixed: was importing useUploadQueueUI from "../../utils/useUploadQueueUI"
// — that file is superseded by hooks/useUploadQueueUI.js (see that file's
// header comment for why: same-tab updates now fall out of Zustand's own
// reactivity, and it correctly handles the cross-tab "removed" message
// instead of only ever checking for status === "canceled").

import { useUploadQueueUI } from "../../hooks/useUploadQueueUI";
import { useUploadControls } from "../../hooks/useUploadControls";
import UploadCard from "./UploadCard";

export default function UploadDock() {
  const items = useUploadQueueUI();
  const { pause, resume, retry, cancel } = useUploadControls();

  if (!items.length) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-black/90 p-3 rounded-lg z-50 space-y-3 max-h-[60vh] overflow-y-auto">
      <h3 className="text-white text-sm font-bold flex justify-between">
        Uploads
        <span className="text-gray-400">({items.length})</span>
      </h3>

      {items.map((item) => (
        <UploadCard
          key={item.id}
          item={item}
          onPause={pause}
          onResume={resume}
          onRetry={retry}
          onCancel={cancel}
        />
      ))}
    </div>
  );
}