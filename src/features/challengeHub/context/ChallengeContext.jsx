// // context/ChallengeContext.jsx

// import React, {
//   createContext,
//   useContext,
//   useReducer,
//   useMemo,
// } from "react";

// import ChallengeController
// from "../controllers/challenge.controller";

// import {
//   isValidChallengeCategory,
//   isValidSubCategory,
//   getCategoryConfig,
// } from "../utils/categories";

// // -------------------
// // INITIAL STATE
// // -------------------

// const initialState = {
//   selectedCategory: null,
//   selectedSubCategory: null,
// };

// // -------------------
// // ACTIONS
// // -------------------

// const ACTIONS = Object.freeze({
//   SET_CATEGORY: "SET_CATEGORY",
//   SET_SUBCATEGORY: "SET_SUBCATEGORY",
//   RESET: "RESET",
// });

// // -------------------
// // REDUCER
// // -------------------

// function reducer(state, action) {
//   switch (action.type) {
//     case ACTIONS.SET_CATEGORY: {
//       const category = action.payload;

//       if (!isValidChallengeCategory(category)) {
//         console.warn("Invalid category:", category);
//         return state;
//       }

//       return {
//         selectedCategory: category,
//         selectedSubCategory: null, // reset sub
//       };
//     }

//     case ACTIONS.SET_SUBCATEGORY: {
//       const subCategory = action.payload;

//       if (
//         !state.selectedCategory ||
//         !isValidSubCategory(state.selectedCategory, subCategory)
//       ) {
//         console.warn("Invalid subcategory:", subCategory);
//         return state;
//       }

//       return {
//         ...state,
//         selectedSubCategory: subCategory,
//       };
//     }

//     case ACTIONS.RESET:
//       return initialState;

//     default:
//       return state;
//   }
// }

// // -------------------
// // CONTEXT
// // -------------------

// const ChallengeContext = createContext(null);

// // -------------------
// // PROVIDER
// // -------------------

// export function ChallengeProvider({ children }) {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   // ACTION DISPATCHERS (stable)
//   const setCategory = (category) => {
//     dispatch({ type: ACTIONS.SET_CATEGORY, payload: category });
//   };

//   const setSubCategory = (subCategory) => {
//     dispatch({
//       type: ACTIONS.SET_SUBCATEGORY,
//       payload: subCategory,
//     });
//   };

//   const reset = () => dispatch({ type: ACTIONS.RESET });

//   // DERIVED DATA (memoized)
//   const categoryConfig = useMemo(() => {
//     if (!state.selectedCategory) return null;
//     return getCategoryConfig(state.selectedCategory);
//   }, [state.selectedCategory]);

//   // VALUE (memoized to prevent re-renders)
//   const value = useMemo(
//     () => ({
//       ...state,
//       setCategory,
//       setSubCategory,
//       reset,
//       categoryConfig,
//     }),
//     [state, categoryConfig]
//   );

//   return (
//     <ChallengeContext.Provider value={value}>
//       {children}
//     </ChallengeContext.Provider>
//   );
// }

// // -------------------
// // HOOK
// // -------------------

// export function useChallenge() {
//   const context = useContext(ChallengeContext);

//   if (!context) {
//     throw new Error(
//       "useChallenge must be used within ChallengeProvider"
//     );
//   }

//   return context;
// }

// src/features/challengeHub/context/ChallengeContext.jsx

import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
} from "react";

import {
  isValidChallengeCategory,
  isValidSubCategory,
  getCategoryConfig,
} from "../utils/categories";

const ChallengeContext = createContext(null);

const initialState = {
  selectedCategory: null,
  selectedSubCategory: null,
};

const ACTIONS = Object.freeze({
  SET_CATEGORY: "SET_CATEGORY",
  SET_SUBCATEGORY: "SET_SUBCATEGORY",
  RESET: "RESET",
});

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CATEGORY: {
      const category = action.payload;

      if (!isValidChallengeCategory(category)) {
        return state;
      }

      return {
        selectedCategory: category,
        selectedSubCategory: null,
      };
    }

    case ACTIONS.SET_SUBCATEGORY: {
      const subCategory = action.payload;

      if (
        !state.selectedCategory ||
        !isValidSubCategory(state.selectedCategory, subCategory)
      ) {
        return state;
      }

      return {
        ...state,
        selectedSubCategory: subCategory,
      };
    }

    case ACTIONS.RESET:
      return initialState;

    default:
      return state;
  }
}

export function ChallengeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setCategory = useCallback((category) => {
    dispatch({
      type: ACTIONS.SET_CATEGORY,
      payload: category,
    });
  }, []);

  const setSubCategory = useCallback((subCategory) => {
    dispatch({
      type: ACTIONS.SET_SUBCATEGORY,
      payload: subCategory,
    });
  }, []);

  const reset = useCallback(() => {
    dispatch({
      type: ACTIONS.RESET,
    });
  }, []);

  const categoryConfig = useMemo(() => {
    if (!state.selectedCategory) return null;

    return getCategoryConfig(state.selectedCategory);
  }, [state.selectedCategory]);

  const value = useMemo(
    () => ({
      ...state,
      categoryConfig,
      setCategory,
      setSubCategory,
      reset,
    }),
    [
      state,
      categoryConfig,
      setCategory,
      setSubCategory,
      reset,
    ]
  );

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenge() {
  const context = useContext(ChallengeContext);

  if (!context) {
    throw new Error(
      "useChallenge must be used inside ChallengeProvider."
    );
  }

  return context;
}

