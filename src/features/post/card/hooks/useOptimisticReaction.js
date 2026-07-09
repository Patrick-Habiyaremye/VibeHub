import {
  useState,
  useCallback,
  useRef,
  useEffect
} from "react";


export default function useOptimisticReaction({

  initialReaction = null,

  initialCount = 0,

  onReact,

  onRemove,

  onChange

}) {


  const [reaction,setReaction] =
    useState(initialReaction);


  const [count,setCount] =
    useState(initialCount);


  const [loading,setLoading] =
    useState(false);



  const requestId =
    useRef(0);



  useEffect(()=>{

    setReaction(initialReaction);

  },[initialReaction]);



  useEffect(()=>{

    setCount(initialCount);

  },[initialCount]);




  const toggleReaction =
  useCallback(async(type)=>{


    if(loading)
      return;



    const currentRequest =
      ++requestId.current;



    const previous = {

      reaction,

      count

    };



    const removing =
      reaction === type;




    /**
     * Optimistic update
     */

    if(removing){


      setReaction(null);


      setCount(
        value =>
        Math.max(
          0,
          value-1
        )
      );


    }
    else {


      setReaction(type);



      if(!reaction){

        setCount(
          value=>value+1
        );

      }

    }



    setLoading(true);



    try {


      let result;



      if(removing){


        result =
          await onRemove?.();



      }
      else {


        result =
          await onReact?.(type);



      }



      /**
       * ignore old requests
       */

      if(
        currentRequest !== requestId.current
      )
      return;



      onChange?.({

        reaction:
          removing
          ? null
          : type,

        count

      });



      return result;



    }
    catch(error){


      console.error(
        "Reaction update failed",
        error
      );


      /**
       * rollback
       */

      setReaction(
        previous.reaction
      );


      setCount(
        previous.count
      );


      throw error;


    }
    finally{


      if(
        currentRequest === requestId.current
      ){

        setLoading(false);

      }

    }



  },[
    reaction,
    count,
    loading,
    onReact,
    onRemove,
    onChange
  ]);




  return {


    reaction,


    count,


    loading,


    hasReacted:
      Boolean(reaction),



    toggleReaction


  };


}