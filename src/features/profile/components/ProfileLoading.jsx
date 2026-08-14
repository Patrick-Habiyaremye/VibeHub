import { Loader2 } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-purple-600" size={36} />
        <p className="text-gray-500 font-medium">Loading profile…</p>
      </div>
    </div>
  );
}