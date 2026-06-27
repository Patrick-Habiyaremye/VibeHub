// components/feed/FeedFilters.jsx
const filters = ["Latest", "Trending", "Kindness", "Support"];

export default function FeedFilters({ active, setActive }) {
  return (
    <div className="mb-5">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`
              whitespace-nowrap
              px-4 py-2
              rounded-full
              text-sm
              transition
              shrink-0

              ${
                active === item
                  ? "bg-yellow-500 text-black shadow-md"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              }
            `}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}