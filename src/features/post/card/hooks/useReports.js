import {
  useState,
  useCallback
} from "react";

import { reportContent } from "../../../../api/reportApi";



export default function useReports(){


const [loading,setLoading]=
useState(false);


const [error,setError]=
useState(null);



const report =
useCallback(async(payload)=>{


setLoading(true);

setError(null);



try{


const result =
await reportContent(payload);


return {

 success:true,

 data:result

};


}
catch(err){


console.error(
"Report error:",
err
);


setError(err);



return {

 success:false,

 error:err

};


}
finally{


setLoading(false);


}


},[]);




return {

 report,

 loading,

 error

};


}