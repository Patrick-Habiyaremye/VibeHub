// import { useState } from "react";
// import { useProfileContext } from "../context/ProfileContext";
// import ProfileSupporters from "./ProfileSupporters";

// function ImpactCard({ title, value, onClick }) {
//   const Tag = onClick ? "button" : "div";
//   return (
//     <Tag
//       onClick={onClick}
//       className={`bg-white rounded-xl shadow p-5 text-center ${onClick ? "hover:shadow-md transition-shadow" : ""}`}
//     >
//       <p className="text-gray-500">{title}</p>
//       <h2 className="text-2xl font-bold">{value}</h2>
//     </Tag>
//   );
// }

// export default function ProfileStats() {
//   const { impactCards, reputation } = useProfileContext();
//   const [supportersOpen, setSupportersOpen] = useState(false);
//   const unlocked = reputation?.unlockedAchievements ?? [];

//   return (
//     <>
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
//         {impactCards.map((card) => (
//           <ImpactCard
//             key={card.key}
//             title={card.title}
//             value={card.value}
//             onClick={card.key === "supporters" ? () => setSupportersOpen(true) : undefined}
//           />
//         ))}
//       </div>

//       {unlocked.length > 0 && (
//         <div className="mt-10">
//           <h2 className="text-xl font-bold mb-4">Achievements</h2>
//           <div className="flex flex-wrap gap-3">
//             {unlocked.map((a) => (
//               <div key={a.id} className="bg-white px-4 py-2 rounded-xl shadow text-sm">
//                 {a.icon} {a.title}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {supportersOpen && <ProfileSupporters onClose={() => setSupportersOpen(false)} />}
//     </>
//   );
// }

// src/features/profile/components/ProfileStats.jsx

import { useState } from "react";
import { useProfileContext } from "../context/ProfileContext";
import ProfileSupporters from "./ProfileSupporters";

function ImpactCard({ title, value, onClick }) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`
        bg-white
        rounded-xl
        shadow
        p-5
        text-center
        w-full
        ${
          onClick
            ? "hover:shadow-md transition-shadow cursor-pointer"
            : ""
        }
      `}
    >
      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="text-2xl font-bold">
        {value}
      </h2>
    </Tag>
  );
}

export default function ProfileStats() {
  const {
    profile,
    impactCards,
    reputationDisplay,
  } = useProfileContext();

  const [supportersOpen, setSupportersOpen] = useState(false);

  const unlocked =
    reputationDisplay?.unlockedAchievements ?? [];

  const profileId = profile?.id;

  return (
    <>
      <section
        aria-label="Profile statistics"
        className="mt-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactCards.map((card) => (
            <ImpactCard
              key={card.key}
              title={card.title}
              value={card.value}
              onClick={
                card.key === "supporters" && profileId
                  ? () => setSupportersOpen(true)
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {unlocked.length > 0 && (
        <section
          aria-labelledby="profile-achievements"
          className="mt-10"
        >
          <h2
            id="profile-achievements"
            className="text-xl font-bold mb-4"
          >
            Achievements
          </h2>

          <div className="flex flex-wrap gap-3">
            {unlocked.map((achievement) => (
              <div
                key={achievement.id}
                className="
                  bg-white
                  px-4
                  py-2
                  rounded-xl
                  shadow
                  text-sm
                "
              >
                <span aria-hidden="true">
                  {achievement.icon}
                </span>{" "}
                {achievement.title}
              </div>
            ))}
          </div>
        </section>
      )}

      {supportersOpen && profileId && (
        <ProfileSupporters
          profileId={profileId}
          onClose={() => setSupportersOpen(false)}
        />
      )}
    </>
  );
}