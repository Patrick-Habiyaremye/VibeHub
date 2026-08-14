import { useEffect, useState } from "react";
import { useProfileContext } from "../context/ProfileContext";
import { profileStatsApi } from "../api/profileStatsApi";

// Instagram-style highlight strip. Backed by a feature-detected endpoint
// (see profileStatsApi.getMoments) - renders nothing at all until the
// backend has moments to show, so it never adds empty visual weight.
export default function ProfileMoments() {
  const { userId } = useProfileContext();
  const [moments, setMoments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    profileStatsApi.getMoments(userId).then((list) => {
      if (!cancelled) setMoments(Array.isArray(list) ? list : []);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (moments.length === 0) return null;

  return (
    <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
      {moments.map((moment) => (
        <div key={moment.id} className="flex flex-col items-center gap-1 shrink-0">
          <img
            src={moment.cover_url}
            alt={moment.title}
            className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
          />
          <span className="text-xs text-gray-600 max-w-[64px] truncate">{moment.title}</span>
        </div>
      ))}
    </div>
  );
}