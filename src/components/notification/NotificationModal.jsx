import { X } from "lucide-react";
import useNotifications from "../../hooks/useNotifications";
import { useAuth } from "../../context/AuthContext";
import NotificationItem from "./NotificationItem";

// export default function NotificationModal({ onClose }) {
//   const { user } = useAuth();

//   const {
//     notifications,
//     loading,
//     unreadCount,
//     handleRead,
//     handleDelete,
//     handleReadAll,
//   } = useNotifications(user);

//   useEffect(() => {
//   // ✅ lock scroll
//   document.body.style.overflow = "hidden";

//   // ✅ ESC close
//   const handleEsc = (e) => {
//     if (e.key === "Escape") onClose();
//   };

//   window.addEventListener("keydown", handleEsc);

//   return () => {
//     document.body.style.overflow = "auto";
//     window.removeEventListener("keydown", handleEsc);
//   };
// }, []);

//   return (
//     <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col">

//       {/* HEADER */}
//       <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
//         <h3 className="text-white font-bold">
//           Notifications {unreadCount > 0 && `(${unreadCount})`}
//         </h3>

//         <button onClick={onClose}>
//           <X className="text-white" />
//         </button>
//       </div>

//       {/* ACTION */}
//       <div className="px-4 py-2 bg-slate-900 border-b border-slate-700">
//         <button
//           onClick={handleReadAll}
//           className="text-sm text-yellow-400"
//         >
//           Mark all as read
//         </button>
//       </div>

//       {/* BODY */}
//       <div className="flex-1 overflow-y-auto bg-slate-800">
//         {loading && (
//           <div className="p-4 text-center text-slate-400">
//             Loading...
//           </div>
//         )}

//         {!loading && notifications.length === 0 && (
//           <div className="p-6 text-center text-slate-400">
//             No notifications yet 😊
//           </div>
//         )}

//         {notifications.map((n) => (
//           <NotificationItem
//             key={n.id}
//             notification={n}
//             onRead={handleRead}
//             onDelete={handleDelete}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

import React from "react";

// export default function NotificationModal({ open, onClose, notifications }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-end md:items-center">
//       <div className="bg-white w-full md:w-[400px] h-[80%] md:h-auto rounded-t-2xl md:rounded-2xl p-4 overflow-y-auto">
        
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-bold">Notifications</h2>
//           <button onClick={onClose}>✕</button>
//         </div>

//         {notifications.length === 0 ? (
//           <p className="text-gray-500">No notifications</p>
//         ) : (
//           notifications.map((n) => (
//             <div
//               key={n.id}
//               className="p-3 border-b hover:bg-gray-100"
//             >
//               {n.content}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
export default function NotificationModal({
  open,
  onClose,
  notifications,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-end md:items-center">
      <div className="bg-white w-full md:w-[400px] h-[80%] md:h-auto rounded-t-2xl md:rounded-2xl p-4 overflow-y-auto">

        <div className="flex justify-between mb-4">
          <h2 className="font-bold">Notifications</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="border-b p-2">
              {n.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
}