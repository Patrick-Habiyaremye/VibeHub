import { useState } from "react";
import ReelUpload from "./ReelUpload";

export default function ReelPage() {
  const [openUpload, setOpenUpload] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpenUpload(true)}
        className="bg-yellow-500 px-4 py-2 rounded"
      >
        Upload Reel
      </button>

      {/* Modal */}
      <ReelUpload
        open={openUpload}
        onClose={() => setOpenUpload(false)}
      />
    </>
  );
}