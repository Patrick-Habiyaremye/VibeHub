// import { MapPin, Calendar, Globe, ShieldCheck } from "lucide-react";
// import { useProfileContext } from "../context/ProfileContext";
// import ProfileReputation from "./ProfileReputation";
// import ProfileActions from "./ProfileActions";
// import { selectDisplayName } from "../utils/profileSelectors";

// export default function ProfileBio() {
//   const { profile } = useProfileContext();
//   if (!profile) return null;

//   return (
//     <div className="flex justify-between items-start gap-4">
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2">
//           <h1 className="text-3xl font-bold">{selectDisplayName(profile)}</h1>
//           {profile.isVerified && <ShieldCheck className="text-blue-500" />}
//         </div>

//         <p className="text-gray-500">@{profile.username}</p>

//         <ProfileReputation />

//         <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
//           {profile.location && (
//             <span className="flex gap-1 items-center">
//               <MapPin size={16} />
//               {profile.location}
//             </span>
//           )}

//           <span className="flex gap-1 items-center">
//             <Calendar size={16} />
//             Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "recently"}
//           </span>

//           {profile.website && (
//             <a
//               href={profile.website}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex gap-1 items-center hover:text-purple-600"
//             >
//               <Globe size={16} />
//               {profile.website}
//             </a>
//           )}
//         </div>

//         <p className="mt-4 max-w-xl text-gray-700 break-words">{profile.bio || "Spreading positivity ✨"}</p>
//       </div>

//       <ProfileActions />
//     </div>
//   );
// }



import { MapPin, Calendar, Globe, ShieldCheck } from "lucide-react";
import { useProfileContext } from "../context/ProfileContext";
import ProfileReputation from "./ProfileReputation";
import ProfileActions from "./ProfileActions";

export default function ProfileBio() {
  const { profile } = useProfileContext();

  if (!profile) return null;

  const fullName = profile.fullName?.trim();
  const username = profile.username?.trim();
  const website = profile.website?.trim();
  const location = profile.location?.trim();
  const bio = profile.bio?.trim();

  // Safely format the joined date.
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt)
    : null;

  const formattedJoinedDate =
    joinedDate && !Number.isNaN(joinedDate.getTime())
      ? joinedDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Recently";

  // Normalize website URL so href works even when
  // the database contains "example.com" instead of "https://example.com".
  const normalizedWebsite = website
    ? /^https?:\/\//i.test(website)
      ? website
      : `https://${website}`
    : null;

  return (
    <div className="w-full">
      {/* --------------------------------------------- */}
      {/* Profile identity */}
      {/* --------------------------------------------- */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 wrap-break-word">
              {fullName || username || "Unnamed user"}
            </h1>

            {profile.isVerified && (
              <ShieldCheck
                size={20}
                className="shrink-0 text-blue-500"
                aria-label="Verified profile"
              />
            )}
          </div>

          {username && (
            <p className="mt-1 text-sm text-gray-500">@{username}</p>
          )}

          {/* Reputation */}
          <div className="mt-3">
            <ProfileReputation />
          </div>

          {/* ----------------------------------------- */}
          {/* Profile metadata */}
          {/* ----------------------------------------- */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <span className="wrap-break-word">
                  {location}
                </span>
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Calendar
                size={16}
                className="shrink-0"
                aria-hidden="true"
              />

              <span>
                Joined {formattedJoinedDate}
              </span>
            </span>

            {normalizedWebsite && (
              <a
                href={normalizedWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-1.5
                  max-w-full
                  hover:text-purple-600
                  transition-colors
                "
                title={website}
              >
                <Globe
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <span className="truncate max-w-60">
                  {website}
                </span>
              </a>
            )}
          </div>

          {/* ----------------------------------------- */}
          {/* Bio */}
          {/* ----------------------------------------- */}
          <p className="mt-4 max-w-2xl whitespace-pre-wrap wrap-break-word text-gray-700">
            {bio || "Spreading positivity ✨"}
          </p>
        </div>

        {/* Profile actions */}
        <div className="shrink-0">
          <ProfileActions />
        </div>
      </div>
    </div>
  );
}

