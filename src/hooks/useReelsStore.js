// hooks/useReelsStore.js

import { useReducer, useCallback } from "react";

const initialState = {
  byId: {},
  ids: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "UPSERT_MANY": {
      const byId = { ...state.byId };
      const ids = [...state.ids];

      for (const item of action.payload) {
        if (!byId[item.id]) {
          ids.push(item.id);
        }
        byId[item.id] = item;
      }

      return { byId, ids };
    }

    case "INSERT_TOP": {
      const item = action.payload;

      if (state.byId[item.id]) return state;

      return {
        byId: { ...state.byId, [item.id]: item },
        ids: [item.id, ...state.ids],
      };
    }

    case "REMOVE": {
      const id = action.payload;

      const { [id]: _, ...rest } = state.byId;

      return {
        byId: rest,
        ids: state.ids.filter((i) => i !== id),
      };
    }

    default:
      return state;
  }
}

export default function useReelsStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const upsertMany = useCallback((items) => {
    dispatch({ type: "UPSERT_MANY", payload: items });
  }, []);

  const insertTop = useCallback((item) => {
    dispatch({ type: "INSERT_TOP", payload: item });
  }, []);

  const remove = useCallback((id) => {
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  return {
    reels: state.ids.map((id) => state.byId[id]),
    byId: state.byId,
    upsertMany,
    insertTop,
    remove,
  };
}