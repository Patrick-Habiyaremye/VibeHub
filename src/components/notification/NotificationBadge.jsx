// components/notification/NotificationBadge.jsx

export default function NotificationBadge({

  count,

}) {

  if (count === 0) return null;

  return (

    <span

      className="

      absolute

      -top-1

      -right-1

      min-w-[18px]

      h-[18px]

      px-1

      rounded-full

      bg-red-500

      text-white

      text-xs

      flex

      items-center

      justify-center

      "

    >

      {count > 99 ? "99+" : count}

    </span>

  );

}