// utils/uploadQueue.js

// const queue = [];
// let processing = false;

// export function addToQueue(task) {
//   queue.push({
//     ...task,
//     retries: 0,
//     status: "pending",
//   });

//   processQueue();
// }

// async function processQueue() {
//   if (processing) return;
//   processing = true;

//   while (queue.length > 0) {
//     const task = queue[0];

//     try {
//       task.status = "processing";

//       await task.run();

//       queue.shift(); // success
//     } catch (err) {
//       task.retries++;

//       if (task.retries > 3) {
//         console.error("❌ Permanent failure");
//         queue.shift();
//       } else {
//         console.log("🔁 Retry", task.retries);
//         await wait(1000 * task.retries); // backoff
//       }
//     }
//   }

//   processing = false;
// }

// function wait(ms) {
//   return new Promise((res) => setTimeout(res, ms));
// }

// const STORAGE_KEY = "upload_queue_v1";

// export function loadQueue() {
//   try {
//     return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
//   } catch {
//     return [];
//   }
// }

// export function saveQueue(queue) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
// }

// export function addToQueue(item) {
//   const queue = loadQueue();
//   queue.push(item);
//   saveQueue(queue);
//   return queue;
// }

// export function updateQueue(id, updates) {
//   const queue = loadQueue().map(item =>
//     item.id === id ? { ...item, ...updates } : item
//   );
//   saveQueue(queue);
//   return queue;
// }

// export function removeFromQueue(id) {
//   const queue = loadQueue().filter(item => item.id !== id);
//   saveQueue(queue);
//   return queue;
// }
const STORAGE_KEY = "upload_queue_v1";

export function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveQueue(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function addToQueue(item) {
  const queue = loadQueue();

  const { file, ...safeItem } = item; // safety strip
  queue.push(safeItem);

  saveQueue(queue);
  return queue;
}

export function updateQueue(id, updates) {
  const queue = loadQueue().map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
  saveQueue(queue);
  return queue;
}

export function removeFromQueue(id) {
  const queue = loadQueue().filter(item => item.id !== id);
  saveQueue(queue);
  return queue;
}