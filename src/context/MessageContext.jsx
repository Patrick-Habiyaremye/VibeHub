// context/MessageContext.jsx

import {

createContext,

useContext,

useState,

} from "react";


const MessageContext

=

createContext();


export function

MessageProvider({

children

}){

const [

selectedChat,

setSelectedChat

]

=

useState(null);


const [

messages,

setMessages

]

=

useState([]);


return(

<MessageContext.Provider

value={{

selectedChat,

setSelectedChat,

messages,

setMessages,

}}

>

{children}

</MessageContext.Provider>

);

}


export function

useMessages(){

return useContext(

MessageContext

);

}