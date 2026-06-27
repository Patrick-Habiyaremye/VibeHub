// export default function VibeStats({
//   posts = [],
// }) {

//   const totalPosts =
//     posts.length;

//   const totalSupport =
//     posts.reduce(
//       (sum, post) =>
//         sum +
//         (post.smile_score || 0),
//       0
//     );

//   return (
//     <div className="
//       bg-slate-800
//       rounded-xl
//       p-4
//       mb-6
//       border
//       border-slate-700
//     ">

//       <h3 className="text-white font-semibold mb-3">
//         Your Positive Impact 💛
//       </h3>

//       <div className="grid grid-cols-2 gap-4">

//         <div>
//           <p className="text-slate-400 text-sm">
//             Shared Posts
//           </p>

//           <p className="text-white text-xl font-bold">
//             {totalPosts}
//           </p>
//         </div>

//         <div>
//           <p className="text-slate-400 text-sm">
//             Support Received
//           </p>

//           <p className="text-yellow-400 text-xl font-bold">
//             {totalSupport}
//           </p>
//         </div>

//       </div>

//     </div>
//   );
// }

// components/feed/VibeStats.jsx

export default function VibeStats({
  posts = [],
}) {

  const totalPosts =
    posts.length;

  const smiles =
    posts.reduce(
      (acc, post) =>
        acc +
        (post.smile_count || 0),
      0
    );

  const gratitude =
    posts.reduce(
      (acc, post) =>
        acc +
        (post.gratitude_count || 0),
      0
    );

  return (
    <div className="
      grid
      grid-cols-3
      gap-4
      mb-6
    ">

      <StatCard
        title="Positive Posts"
        value={totalPosts}
      />

      <StatCard
        title="Smiles Created"
        value={smiles}
      />

      <StatCard
        title="Gratitude Messages"
        value={gratitude}
      />

    </div>
  );
}

function StatCard({
  title,
  value,
}) {
  return (
    <div className="
      bg-slate-900
      rounded-xl
      p-4
      text-center
    ">
      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h3 className="
        text-2xl
        font-bold
        text-yellow-400
      ">
        {value}
      </h3>
    </div>
  );
}