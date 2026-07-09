import { useEffect, useState } from "react";
import { loadQueue } from "../utils/uploadQueue";
import { processQueue } from "../utils/uploadWorker";

export default function useUploadQueue(onUpdate) {
  const [queue, setQueue] = useState(loadQueue());

useEffect(() => {
  const interval = setInterval(() => {
    const q = loadQueue();
    console.log("STEP 2: Queue state", q);

    setQueue(q);
    processQueue(onUpdate);
  }, 1000);

  return () => clearInterval(interval);
}, [onUpdate]);

  return { queue };
}   