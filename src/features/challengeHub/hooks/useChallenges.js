// import {
//  useEffect,
//  useState
// } from "react";


// import {
//  getChallenges
// }
// from "../api/challengesApi";


// export default function useChallenges(filters={}){


// const [challenges,setChallenges]=useState([]);

// const [loading,setLoading]=useState(true);


// useEffect(()=>{


// async function load(){

//  try{

//  setLoading(true);


//  const result =
//  await getChallenges(filters);


//  setChallenges(
//   result.data
//  );


//  }
//  finally{

//  setLoading(false);

//  }

// }


// load();


// },[
//  JSON.stringify(filters)
// ]);



// return {

//  challenges,

//  loading

// };


// }

// src/features/challengeHub/hooks/useChallenges.js

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import ChallengeController from "../controllers/challenge.controller";

export default function useChallenges(filters = {}) {
  const [challenges, setChallenges] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Stable dependency — an inline `{ category: 'x' }` literal passed by
  // the caller on every render shouldn't retrigger a fetch just because
  // its object identity changed.
  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ChallengeController.getChallenges(filters);

      if (!isMountedRef.current) return;

      if (!result.success) {
        setError(result.message);
        setChallenges([]);
        setMeta(null);
        return;
      }

      setChallenges(result.data);
      setMeta(result.meta ?? null);
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error("[useChallenges] Failed to load challenges", err);
      setError(err.message || "Failed to load challenges.");
      setChallenges([]);
      setMeta(null);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
    // `filters` is intentionally omitted — serializedFilters is the real
    // dependency; see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedFilters]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const refresh = useCallback(() => {
    return loadChallenges();
  }, [loadChallenges]);

  return {
    challenges,
    meta,
    loading,
    error,
    refresh,
  };
}