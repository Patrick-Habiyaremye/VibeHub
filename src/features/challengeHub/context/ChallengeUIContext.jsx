import {
    createContext,
    useReducer,
    useContext,
    useMemo,
} from "react";

const ChallengeUIContext = createContext(null);

const initialState = {

    mode: "PLAY",

    category: null,

    difficulty: "ALL",

    search: "",

    sort: "recommended",

    tab: "featured",

};

function reducer(state, action) {

    switch(action.type){

        case "SET_MODE":

            return {

                ...state,

                mode: action.payload,

            };

        case "SET_CATEGORY":

            return {

                ...state,

                category: action.payload,

            };

        case "SET_SEARCH":

            return {

                ...state,

                search: action.payload,

            };

        case "SET_DIFFICULTY":

            return {

                ...state,

                difficulty: action.payload,

            };

        case "SET_SORT":

            return {

                ...state,

                sort: action.payload,

            };

        case "SET_TAB":

            return {

                ...state,

                tab: action.payload,

            };

        case "RESET":

            return initialState;

        default:

            return state;

    }

}

export function ChallengeUIProvider({ children }) {

    const [state, dispatch] =
        useReducer(reducer, initialState);

    const value = useMemo(() => ({

        ...state,

        setMode:
            mode =>
                dispatch({
                    type:"SET_MODE",
                    payload:mode
                }),

        setCategory:
            category =>
                dispatch({
                    type:"SET_CATEGORY",
                    payload:category
                }),

        setSearch:
            search =>
                dispatch({
                    type:"SET_SEARCH",
                    payload:search
                }),

        setDifficulty:
            difficulty =>
                dispatch({
                    type:"SET_DIFFICULTY",
                    payload:difficulty
                }),

        setSort:
            sort =>
                dispatch({
                    type:"SET_SORT",
                    payload:sort
                }),

        setTab:
            tab =>
                dispatch({
                    type:"SET_TAB",
                    payload:tab
                }),

    }), [state]);

    return (

        <ChallengeUIContext.Provider value={value}>

            {children}

        </ChallengeUIContext.Provider>

    );

}

export function useChallengeUI(){

    const ctx = useContext(ChallengeUIContext);

    if(!ctx)
        throw new Error(
            "useChallengeUI must be used inside ChallengeUIProvider"
        );

    return ctx;

}