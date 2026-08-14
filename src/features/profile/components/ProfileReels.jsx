import { useProfileContext } from "../context/ProfileContext";
import ProfileEmpty from "./ProfileEmpty";

export default function ProfileReels() {
  const { reels } = useProfileContext();

  if (reels.length === 0) return <ProfileEmpty message="No reels yet." fullWidth />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {reels.map((reel) => (
        <video key={reel.id} src={reel.video_url} className="w-full rounded-lg" controls preload="metadata" />
      ))}
    </div>
  );
}