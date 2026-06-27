// features/search/SearchFilters.jsx

// 


const filters = [

  {
    label:"All",
    value:"all",
  },

  {
    label:"People",
    value:"people",
  },

  {
    label:"Posts",
    value:"posts",
  },

  {
    label:"Videos",
    value:"videos",
  },

//   {
//     label:"Challenges",
//     value:"challenges",
//   },

];

export default function SearchFilters({

  selected,

  onChange,

}) {

  return (

    <div
      className="
        flex
        gap-3
        mb-6
        overflow-x-auto
      "
    >

      {

        filters.map(
          filter => (

            <button

              key={
                filter.value
              }

              onClick={() =>
                onChange(
                  filter.value
                )
              }

              className={`
                px-5
                py-2
                rounded-full
                whitespace-nowrap
                transition

                ${
                  selected ===
                  filter.value

                  ?

                  "bg-yellow-500 text-black"

                  :

                  "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }
              `}
            >

              {
                filter.label
              }

            </button>

          )
        )

      }

    </div>

  );

}