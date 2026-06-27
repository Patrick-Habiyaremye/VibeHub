import {
  Search,
  Clock,
  User,
} from "lucide-react";

export default function SearchBar({

  value,

  onChange,

  suggestions = [],

  onSelect,

}) {

  return (

    <div className="relative mb-4">

      <div
        className="
          flex
          items-center
          bg-slate-800
          rounded-full
          px-4
          py-3
          border
          border-slate-700
          focus-within:border-yellow-500
        "
      >

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          value={value}
          onChange={(e)=>
            onChange(
              e.target.value
            )
          }
          placeholder="Search people, posts, reels...
          "
          className="
            bg-transparent
            outline-none
            px-3
            w-full
            text-white
          "
        />

      </div>

      {

        value &&
        suggestions.length > 0 && (

          <div
            className="
              absolute
              top-full
              mt-2
              w-full
              bg-slate-900
              border
              border-slate-700
              rounded-xl
              overflow-hidden
              shadow-2xl
              z-50
            "
          >

            {

              suggestions.map(
                item => (

                  <button
                    key={
                      item.id
                    }
                    onClick={() =>
                      onSelect(item)
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      flex
                      items-center
                      gap-3
                      hover:bg-slate-800
                      transition
                    "
                  >

                    {

                      item.type ===
                      "people"

                      ?

                      <User size={18}/>

                      :

                      <Clock size={18}/>

                    }

                    <span>

                      {

                        item.username ||

                        item.content

                      }

                    </span>

                  </button>

                )
              )

            }

          </div>

        )

      }

    </div>

  );

}