// import { useAuth } from "../../context/AuthContext";

export default function DangerZone(){

const {user}=useAuth();

const deleteAccount=async()=>{

const confirmed=

window.confirm(

"This action cannot be undone."

);

if(!confirmed)

return;


/*

delete from:

profiles

posts

comments

reactions

then:

admin api

or edge function

to delete auth user

*/

};

return(

<div className="

bg-red-900/20

border

border-red-500

rounded-xl

p-6

">

<h2 className="

text-red-400

text-2xl

font-bold

mb-4

">

Danger Zone ⚠️

</h2>

<p className="

text-slate-300

mb-5

">

Delete your account permanently.

This action cannot be undone.

</p>

<button

onClick={deleteAccount}

className="

bg-red-500

hover:bg-red-600

text-white

px-4

py-2

rounded-lg

"

>

Delete Account

</button>

</div>

);

}