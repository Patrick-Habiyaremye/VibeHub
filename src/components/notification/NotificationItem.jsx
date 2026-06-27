// components/notification/NotificationItem.jsx

import {

  Trash2,

} from "lucide-react";

import {

  notificationMessages,

} from "./notificationMessages";


export default function NotificationItem({

  notification,

  onRead,

  onDelete,

}) {

  const actor =

    notification.sender?.username ||

    "Someone";


  const message =

    notificationMessages[

      notification.type

    ]

      ?.

      (

        actor

      )

    ||

    "New notification";


  const handleClick = () => {

    onRead(

      notification.id

    );

  };


  return (

    <div

      onClick={handleClick}

      className={`

      flex

      gap-3

      p-4

      border-b

      border-slate-700

      hover:bg-slate-700

      cursor-pointer

      transition

      ${

        !notification.is_read

          ?

          "bg-slate-800"

          :

          ""

      }

      `}

    >

      <img

        src={

          notification.sender

          ?.avatar_url ||

          "https://ui-avatars.com/api/?name=User"

        }

        className="

        w-10

        h-10

        rounded-full

        object-cover

        "

      />


      <div className="flex-1">

        <p className="text-white text-sm">

          {message}

        </p>


        <p className="

        text-slate-400

        text-xs

        mt-1

        ">

          {

            new Date(

              notification.created_at

            )

            .toLocaleString()

          }

        </p>

      </div>


      {

        !notification.is_read && (

          <div

            className="

            w-2

            h-2

            rounded-full

            bg-yellow-400

            self-center

            "

          />

        )

      }


      <button

        onClick={(e)=>{

          e.stopPropagation();

          onDelete(

            notification.id

          );

        }}

        className="

        text-slate-400

        hover:text-red-400

        "

      >

        <Trash2 size={16}/>

      </button>

    </div>

  );

}