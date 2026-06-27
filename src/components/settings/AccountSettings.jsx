// import { useState, useEffect } from "react";

// export default function AccountSetting() {
//   const [settings, setSettings] = useState({
//     smileVisibility: true,
//     gratitudeMessages: true,
//     dailyChallenges: true,
//     positiveContentOnly: true,
//   });

//   // Toggle handler
//   const handleToggle = (key) => {
//     setSettings((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   // TODO: replace with Supabase save
//   const saveSettings = async () => {
//     console.log("Saving settings:", settings);
//     // await supabase.from("profiles").update(settings).eq("id", user.id)
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
//       <h2 className="text-2xl font-bold mb-6">VibeHub Settings</h2>

//       {/* Smile Visibility */}
//       <SettingItem
//         title="😊 Smile Visibility"
//         description="Show my kindness score"
//         value={settings.smileVisibility}
//         onChange={() => handleToggle("smileVisibility")}
//       />

//       {/* Gratitude Messages */}
//       <SettingItem
//         title="💛 Gratitude Messages"
//         description="Allow people to thank me"
//         value={settings.gratitudeMessages}
//         onChange={() => handleToggle("gratitudeMessages")}
//       />

//       {/* Daily Challenges */}
//       <SettingItem
//         title="🌟 Daily Challenge Reminders"
//         description="Receive challenge reminders"
//         value={settings.dailyChallenges}
//         onChange={() => handleToggle("dailyChallenges")}
//       />

//       {/* Positive Content */}
//       <SettingItem
//         title="🙌 Positive Content Only"
//         description="Hide reported toxic content"
//         value={settings.positiveContentOnly}
//         onChange={() => handleToggle("positiveContentOnly")}
//       />

//       <button
//         onClick={saveSettings}
//         className="mt-6 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
//       >
//         Save Changes
//       </button>
//     </div>
//   );
// }

// // Reusable component
// function SettingItem({ title, description, value, onChange }) {
//   return (
//     <div className="flex items-center justify-between py-4 border-b">
//       <div>
//         <h3 className="font-semibold">{title}</h3>
//         <p className="text-sm text-gray-500">{description}</p>
//       </div>

//       <button
//         onClick={onChange}
//         className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
//           value ? "bg-green-500" : "bg-gray-300"
//         }`}
//       >
//         <div
//           className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
//             value ? "translate-x-6" : ""
//           }`}
//         />
//       </button>
//     </div>
//   );
// }

import { useState,useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

import {

getProfile,

updateProfile,

logout,

}

from "../../api/settings";


export default function AccountSettings(){

const {user}=useAuth();

const [username,setUsername]=useState("");

const [bio,setBio]=useState("");

const [loading,setLoading]=useState(false);


useEffect(()=>{

if(!user) return;

loadProfile();

},[user]);


const loadProfile=async()=>{

const profile=

await getProfile(

user.id

);

if(profile){

setUsername(

profile.username||""

);

setBio(

profile.bio||""

);

}

};


const save=async()=>{

try{

setLoading(true);

await updateProfile(

user.id,

{

username,

bio,

}

);

alert(

"Profile updated"

);

}

catch(err){

console.error(err);

}

finally{

setLoading(false);

}

};


return(

<div className="

bg-slate-800

rounded-xl

p-6

mb-6

">

<h2 className="

text-2xl

font-bold

text-white

mb-5

">

Account 👤

</h2>


<input

value={username}

onChange={(e)=>

setUsername(

e.target.value

)

}

placeholder="Username"

className="

w-full

bg-slate-900

text-white

rounded-lg

p-3

mb-4

"

/>


<textarea

value={bio}

onChange={(e)=>

setBio(

e.target.value

)

}

placeholder="Tell people about yourself"

className="

w-full

bg-slate-900

text-white

rounded-lg

p-3

"

/>


<div className="

flex

gap-3

mt-5

">

<button

onClick={save}

disabled={loading}

className="

bg-yellow-500

text-black

px-4

py-2

rounded-lg

"

>

{

loading

?

"Saving..."

:

"Save"

}

</button>


<button

onClick={logout}

className="

bg-red-500

text-white

px-4

py-2

rounded-lg

"

>

Logout

</button>

</div>

</div>

);

}