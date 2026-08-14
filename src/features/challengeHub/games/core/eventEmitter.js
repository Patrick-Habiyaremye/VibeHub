export function createEventEmitter(){

  const listeners = [];


  function subscribe(listener){

    listeners.push(listener);


    return () => {

      const index =
        listeners.indexOf(listener);


      if(index !== -1){
        listeners.splice(index,1);
      }

    };

  }



  function emit(event){

    listeners.forEach(listener=>{
      listener(event);
    });

  }


  return {
    subscribe,
    emit
  };

}