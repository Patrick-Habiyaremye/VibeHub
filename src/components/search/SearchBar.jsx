import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="hidden md:flex items-center bg-slate-800 rounded-lg px-3 py-2 w-96">

      <Search
        size={18}
        className="text-slate-400"
      />

      <input
        type="text"
        placeholder="Search people, posts, challenges..."
        className="bg-transparent outline-none px-2 w-full text-white"
      />

    </div>
  );
}