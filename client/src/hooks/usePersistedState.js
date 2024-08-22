import { useState } from "react";



export default function usePersistedState(key, defaultValue) {

    //get data from localStorage only on page refresh
    //a.k.a initial render = unmount -> mount;
    const [state, setState] = useState(() => {
        const persistedState = localStorage.getItem(key);

        if (persistedState) {
            return JSON.parse(persistedState); //default value == persistedState
        }

        return defaultValue;
    });

    //performance hit - при промяна в state тр да се запази и в localStorage
    //което изисква първо stringify на стойността, която искаме да променяме
    const setPersistedState = (value) => {

        if (!value) {
            localStorage.removeItem(key);
            setState({});
        }
        else {
            const serializedValue = JSON.stringify(value);

            //всеки update направен чрез setPersistedState ще update-ва localStorage,
            //освен вътрешния state; синхронизация
            localStorage.setItem(key, serializedValue);
            setState(value);
        }


    };

    return [
        state,
        setPersistedState
    ]
};
