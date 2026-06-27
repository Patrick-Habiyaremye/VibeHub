// context/NotificationContext.jsx

import {

createContext,

useContext,

useEffect,

useState,

} from "react";

import {

getNotifications,

markAsRead,

markAllAsRead,

} from "../api/notifications";

import {

useAuth,

} from "./AuthContext";


const NotificationContext

=

createContext();


export function

NotificationProvider({

children

}){

const {

user

}

=

useAuth();


const [

notifications,

setNotifications

]

=

useState([]);


const loadNotifications

=

async()=>{

if(!user) return;

try{

const data=

await getNotifications(

user.id

);

setNotifications(

data || []

);

}

catch(err){

console.error(err);

}

};


useEffect(()=>{

loadNotifications();

},[user]);


const unreadCount

=

notifications.filter(

n=>!n.is_read

).length;


return(

<NotificationContext.Provider

value={

{

notifications,

setNotifications,

reload:

loadNotifications,

markAsRead,

markAllAsRead,

unreadCount,

}

}

>

{children}

</NotificationContext.Provider>

);

}


export function

useNotifications(){

return useContext(

NotificationContext

);

}